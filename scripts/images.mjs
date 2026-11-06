#!/usr/bin/env node
/**
 * 图片工作流：PNG → WebP
 *
 *   pnpm images:webp        # 1) 把被引用的 PNG 转成 WebP（保留原 PNG），并更新引用
 *   pnpm images:clean-png   # 2) 转换确认无误后，删除已被 WebP 取代的 PNG
 *
 * 常用参数（pnpm 需要 -- 透传，如 pnpm images:webp -- --quality 85）：
 *   --quality=80       WebP 质量，默认 80
 *   --max-width=1600   超过该宽度的图片等比缩小（默认不缩放，保持原尺寸）
 *   --force            忽略“已有较新 WebP”的跳过逻辑，强制重新转换
 *   --dry-run          只打印将要做什么，不写任何文件
 *   --prune-unused     （仅 clean 命令）顺带删除从未被引用的 PNG
 *   --help
 *
 * 安全策略：
 *   - 只处理被 Markdown / HTML / Vue / CSS 引用到的 PNG
 *   - WebP 体积比 PNG 大时不写入、不改引用
 *   - clean 只删除“已有同名 .webp”且“已无任何引用”的 PNG
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'src')
const PUBLIC_DIR = path.join(SRC, '.vuepress', 'public')

const SKIP_DIRS = new Set(['dist', 'node_modules', '.temp', '.cache', '.git', '.idea', '.pnpm-store'])
const TEXT_EXTS = new Set(['.md', '.markdown', '.vue', '.ts', '.scss', '.css', '.html'])
// 路径片段 + .png（允许 ../ 开头），后面不能紧跟字母数字（避免匹配到 .pngx）
const PNG_REF_RE = /([\w@./-]+)\.png(?![a-z0-9])/gi
const IMG_EXT_RE = /\.(png|jpe?g|gif|webp|avif)$/i

/* ------------------------------------------------------------------ utils */

const args = parseArgs(
  process.argv.slice(2).filter((a) => a !== 'convert' && a !== 'clean' && a !== '--'),
)
const COLOR = process.stdout.isTTY && !process.env.NO_COLOR
const paint = (code, s) => (COLOR ? `\u001b[${code}m${s}\u001b[0m` : s)
const dim = (s) => paint('2', s)
const green = (s) => paint('32', s)
const yellow = (s) => paint('33', s)
const red = (s) => paint('31', s)
const cyan = (s) => paint('36', s)

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`
const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`

function parseArgs(argv) {
  const out = { quality: 80, maxWidth: 0, force: false, dryRun: false, pruneUnused: false, all: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--help' || a === '-h') out.help = true
    else if (a === '--force') out.force = true
    else if (a === '--dry-run') out.dryRun = true
    else if (a === '--prune-unused') out.pruneUnused = true
    else if (a === '--all') out.all = true
    else if (a.startsWith('--quality')) out.quality = Number(a.split('=')[1] ?? argv[++i])
    else if (a.startsWith('--max-width')) out.maxWidth = Number(a.split('=')[1] ?? argv[++i])
    else throw new Error(`未知参数: ${a}（用 --help 查看用法）`)
  }
  if (!Number.isFinite(out.quality) || out.quality < 1 || out.quality > 100) {
    throw new Error(`--quality 需要 1-100 的数字`)
  }
  if (!Number.isFinite(out.maxWidth) || out.maxWidth < 0) {
    throw new Error(`--max-width 需要 >= 0 的数字`)
  }
  return out
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.vuepress') continue
    if (SKIP_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

/** 把引用路径解析成磁盘上的绝对路径 */
function resolveRef(fromFile, rawRef) {
  if (/^[a-z]+:\/\//i.test(rawRef)) return null // 外链
  if (rawRef.startsWith('@source/')) return path.resolve(SRC, rawRef.slice('@source/'.length))
  if (rawRef.startsWith('/')) return path.resolve(PUBLIC_DIR, `.${rawRef}`)
  return path.resolve(path.dirname(fromFile), rawRef)
}

/** 收集所有文本文件里对被引用图片的引用 */
function collectRefs() {
  const textFiles = walk(SRC).filter((f) => TEXT_EXTS.has(path.extname(f).toLowerCase()))
  const byImage = new Map() // absPath -> [{ file, raw }]
  const unresolved = []
  for (const file of textFiles) {
    const text = fs.readFileSync(file, 'utf8')
    for (const m of text.matchAll(PNG_REF_RE)) {
      const abs = resolveRef(file, `${m[1]}.png`)
      if (!abs || !fs.existsSync(abs)) {
        unresolved.push({ file, raw: `${m[1]}.png` })
        continue
      }
      if (!byImage.has(abs)) byImage.set(abs, [])
      byImage.get(abs).push({ file, raw: `${m[1]}.png` })
    }
  }
  return { textFiles, byImage, unresolved }
}

const webpPathOf = (png) => png.replace(/\.png$/i, '.webp')

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length)
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i], i)
    }
  })
  await Promise.all(workers)
  return results
}

function rel(p) {
  return path.relative(ROOT, p)
}

/* ---------------------------------------------------------------- convert */

async function convert() {
  const quality = args.quality
  const maxWidth = args.maxWidth
  const { textFiles, byImage, unresolved } = collectRefs()
  const allPngs = walk(SRC).filter((f) => f.toLowerCase().endsWith('.png'))
  const unusedPngs = allPngs.filter((p) => !byImage.has(p)).sort()
  const usedPngs = (args.all ? allPngs : [...byImage.keys()]).sort()

  console.log(cyan('▶ 转换 PNG → WebP（保留原 PNG）'))
  console.log(dim(`  质量 ${quality}${maxWidth ? `，限宽 ${maxWidth}px` : '，不缩放'}${args.dryRun ? '，dry-run 不写文件' : ''}`))
  console.log(dim(`  src 下共 ${allPngs.length} 张 PNG，其中被引用 ${usedPngs.length} 张`))
  if (unresolved.length) {
    console.log(yellow(`  ⚠ ${unresolved.length} 处引用指向不存在的 PNG（已忽略）：`))
    for (const u of unresolved.slice(0, 5)) console.log(dim(`    ${rel(u.file)} → ${u.raw}`))
    if (unresolved.length > 5) console.log(dim(`    …`))
  }
  console.log('')

  const stats = { converted: 0, reused: 0, failed: [], pngBytes: 0, webpBytes: 0, notWorth: [] }

  await mapLimit(usedPngs, 6, async (png) => {
    const webp = webpPathOf(png)
    const pngSize = fs.statSync(png).size

    const upToDate =
      !args.force &&
      fs.existsSync(webp) &&
      fs.statSync(webp).mtimeMs >= fs.statSync(png).mtimeMs &&
      fs.statSync(webp).size > 0

    if (upToDate) {
      stats.reused++
      stats.pngBytes += pngSize
      stats.webpBytes += fs.statSync(webp).size
      return
    }

    try {
      let pipeline = sharp(png, { failOn: 'none' })
      if (maxWidth > 0) {
        pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true })
      }
      const buf = await pipeline.webp({ quality, effort: 5, smartSubsample: true }).toBuffer()

      if (buf.length >= pngSize) {
        stats.notWorth.push({ png, pngSize, webpSize: buf.length })
        return
      }
      if (!args.dryRun) fs.writeFileSync(webp, buf)

      stats.converted++
      stats.pngBytes += pngSize
      stats.webpBytes += buf.length
      if (stats.converted % 40 === 0) console.log(dim(`  …已处理 ${stats.converted} 张`))
    } catch (err) {
      stats.failed.push({ png, message: err.message })
    }
  })

  // 更新引用：只要同名 .webp 存在就替换（幂等，重跑不会重复改）
  let changedFiles = 0
  let changedRefs = 0
  for (const file of textFiles) {
    const text = fs.readFileSync(file, 'utf8')
    let count = 0
    const next = text.replace(PNG_REF_RE, (match, p) => {
      const abs = resolveRef(file, `${p}.png`)
      if (!abs || !fs.existsSync(abs)) return match
      if (!fs.existsSync(webpPathOf(abs))) return match
      count++
      return `${p}.webp`
    })
    if (count > 0 && next !== text) {
      changedRefs += count
      changedFiles++
      if (!args.dryRun) fs.writeFileSync(file, next)
    }
  }

  console.log('')
  if (stats.failed.length) {
    console.log(red(`✖ ${stats.failed.length} 张转换失败：`))
    for (const f of stats.failed.slice(0, 10)) console.log(dim(`  ${rel(f.png)}: ${f.message}`))
    console.log('')
  }
  const saved = stats.pngBytes - stats.webpBytes
  const pct = stats.pngBytes ? ((saved / stats.pngBytes) * 100).toFixed(1) : '0'
  console.log(green('✅ 转换完成'))
  const parts = [`新转换 ${stats.converted} 张`]
  if (stats.reused) parts.push(`复用已有 WebP ${stats.reused} 张`)
  if (stats.notWorth.length) parts.push(`转 WebP 不合算保持 PNG ${stats.notWorth.length} 张`)
  if (stats.failed.length) parts.push(`失败 ${stats.failed.length} 张`)
  console.log(`   ${parts.join('，')}`)
  if (stats.pngBytes > 0) {
    console.log(`   体积：${mb(stats.pngBytes)} → ${mb(stats.webpBytes)} ${dim(`(省 ${pct}%)`)}`)
  } else {
    console.log(green(usedPngs.length ? '   没有新的 PNG 需要转换' : '   所有图片引用都已是 WebP，无需转换'))
  }
  console.log(`   更新引用：${changedRefs} 处，涉及 ${changedFiles} 个文件${args.dryRun ? dim('（dry-run，未写入）') : ''}`)

  if (stats.notWorth.length) {
    console.log(yellow(`\n   ${stats.notWorth.length} 张转 WebP 反而更大，已保持 PNG：`))
    for (const n of stats.notWorth.slice(0, 5)) {
      console.log(dim(`     ${rel(n.png)}  ${kb(n.pngSize)} → ${kb(n.webpSize)}`))
    }
  }
  // 剩下的 PNG 分两类：已被 WebP 取代（等 clean 删）、真正没人用（建议手动清理）
  const leftover = unusedPngs.filter((p) => fs.existsSync(webpPathOf(p)))
  const orphans = unusedPngs.filter((p) => !fs.existsSync(webpPathOf(p)))

  if (leftover.length) {
    let bytes = 0
    for (const p of leftover) bytes += fs.statSync(p).size
    console.log(dim(`\n   另有 ${leftover.length} 张 PNG（${mb(bytes)}）已被同名 .webp 取代，确认效果后可执行 pnpm images:clean-png 删除`))
  }
  if (orphans.length) {
    let bytes = 0
    for (const p of orphans) bytes += fs.statSync(p).size
    console.log(yellow(`\n   ${orphans.length} 张 PNG 从未被任何文件引用（${mb(bytes)}），建议删除：`))
    for (const p of orphans) console.log(dim(`     ${rel(p)}`))
    console.log(dim(`   可执行 pnpm images:clean-png -- --prune-unused 一并清理`))
  }
  if (!args.dryRun && stats.converted > 0) {
    console.log(dim('\n   下一步：pnpm docs:dev 检查图片是否正常，确认无误后执行 pnpm images:clean-png'))
  }
  process.exitCode = stats.failed.length ? 1 : 0
}

/* ------------------------------------------------------------------ clean */

async function clean() {
  const allPngs = walk(SRC).filter((f) => f.toLowerCase().endsWith('.png')).sort()
  const { byImage } = collectRefs()
  const deleted = []
  const pruned = []
  const kept = []

  for (const png of allPngs) {
    const webp = webpPathOf(png)
    const refs = byImage.get(png) ?? []
    const hasWebp = fs.existsSync(webp) && fs.statSync(webp).size > 0

    if (hasWebp && refs.length === 0) {
      // 已有 WebP 且引用全部改完 → 原 PNG 可以删
      if (!args.dryRun) fs.unlinkSync(png)
      deleted.push(png)
      continue
    }
    if (hasWebp && refs.length > 0) {
      kept.push({ png, reason: `仍有引用指向 PNG（${rel(refs[0].file)}）` })
      continue
    }
    if (!hasWebp && refs.length === 0 && args.pruneUnused) {
      // 从未被引用、也没转换过：确认是死文件，按需删掉
      if (!args.dryRun) fs.unlinkSync(png)
      pruned.push(png)
      continue
    }
    kept.push({
      png,
      reason: refs.length === 0 ? '未被引用，且没有 .webp' : '没有对应的 .webp（先跑 pnpm images:webp）',
    })
  }

  // 删除后校验：所有引用是否都还在
  const { unresolved } = collectRefs()
  const broken = unresolved.filter((u) => !/^[a-z]+:\/\//i.test(u.raw))

  console.log(cyan('▶ 清理已被 WebP 取代的 PNG'))
  console.log(dim(`  src 下剩余 PNG ${allPngs.length} 张${args.dryRun ? '，dry-run 不删文件' : ''}`))
  console.log('')
  console.log(`${args.dryRun ? '将删除' : green('已删除')} ${deleted.length} 张 PNG`)
  for (const d of deleted.slice(0, 10)) console.log(dim(`  ${rel(d)}`))
  if (deleted.length > 10) console.log(dim(`  …另 ${deleted.length - 10} 张`))

  if (pruned.length) {
    console.log(`\n${args.dryRun ? '将删除' : green('已删除')} ${pruned.length} 张从未被引用的 PNG`)
    for (const p of pruned.slice(0, 10)) console.log(dim(`  ${rel(p)}`))
  }

  if (kept.length) {
    console.log(yellow(`\n保留 ${kept.length} 张 PNG：`))
    const grouped = new Map()
    for (const k of kept) {
      const list = grouped.get(k.reason) ?? []
      list.push(k.png)
      grouped.set(k.reason, list)
    }
    for (const [reason, list] of grouped) {
      console.log(dim(`  ${reason}（${list.length} 张）`))
      for (const p of list.slice(0, 5)) console.log(dim(`    ${rel(p)}`))
      if (list.length > 5) console.log(dim(`    …`))
    }
  }

  if (broken.length) {
    console.log(red(`\n✖ 有 ${broken.length} 处引用找不到文件，请检查：`))
    for (const b of broken.slice(0, 10)) console.log(dim(`  ${rel(b.file)} → ${b.raw}`))
    process.exitCode = 1
  } else {
    console.log(green('\n✅ 引用检查通过，没有坏链'))
  }
}

/* ------------------------------------------------------------------- main */

function help() {
  console.log(`用法:
  node scripts/images.mjs convert [options]   PNG → WebP（保留原 PNG），并更新引用
  node scripts/images.mjs clean   [options]   删除已被 WebP 取代的 PNG

options:
  --quality=80        WebP 质量（1-100，默认 80）
  --max-width=1600    超过该宽度等比缩小（默认不缩放）
  --force             强制重新转换
  --dry-run           只打印计划，不写文件
  --prune-unused      clean 时顺带删除从未被引用的 PNG
  --all               convert 时连同未被引用的 PNG 一起转换
  -h, --help          显示帮助`)
}

async function main() {
  const cmd = process.argv[2]
  if (args.help || !cmd) return help()
  if (cmd === 'convert') return convert()
  if (cmd === 'clean') return clean()
  throw new Error(`未知命令: ${cmd}（可用: convert / clean）`)
}

main().catch((err) => {
  console.error(red(`\n✖ ${err.message}`))
  process.exit(1)
})
