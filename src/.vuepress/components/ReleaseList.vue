<template>
  <div class="release-list">
    <div v-if="loading" class="release-list-status">
      <span class="release-list-spinner" />
      正在从 GitHub 获取更新日志…
    </div>

    <template v-else>
      <p v-if="error" class="release-list-alert">{{ error }}</p>

      <p v-if="!releases.length" class="release-list-status">
        暂无发布记录，可前往
        <a :href="RELEASES_PAGE" target="_blank" rel="noopener noreferrer">
          GitHub Releases
        </a>
        查看。
      </p>

      <article
        v-for="(release, index) in releases"
        :id="release.tag_name"
        :key="release.tag_name"
        class="release-list-item"
      >
        <header class="release-list-head">
          <a
            class="release-list-version"
            :href="release.html_url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ release.tag_name }}
          </a>
          <span v-if="index === 0" class="release-list-badge release-list-badge--latest">
            最新
          </span>
          <span v-if="release.prerelease" class="release-list-badge">预发布</span>
          <time class="release-list-date">{{ formatDate(release.published_at) }}</time>
        </header>

        <!-- eslint-disable-next-line vue/no-v-html -- 内容经 markdown-it 转义并消毒 -->
        <div v-if="htmlBodies[release.tag_name]" class="release-list-body" v-html="htmlBodies[release.tag_name]" />

        <div v-if="release.assets?.length" class="release-list-assets">
          <a
            v-for="asset in release.assets"
            :key="asset.name"
            class="release-list-asset"
            :href="asset.browser_download_url"
          >
            <span class="release-list-asset-name">{{ asset.name }}</span>
            <span class="release-list-asset-meta">
              {{ formatSize(asset.size) }}
            </span>
          </a>
        </div>
      </article>

      <footer class="release-list-foot">
        <span class="release-list-foot-info">
          数据来自 GitHub Releases
          <template v-if="updatedAt">
            · 更新于 {{ formatTime(updatedAt) }}{{ fromCache ? "（缓存）" : "" }}
          </template>
        </span>
        <span class="release-list-foot-actions">
          <button
            class="release-list-button"
            type="button"
            :disabled="refreshing"
            @click="fetchReleases(true)"
          >
            {{ refreshing ? "刷新中…" : "刷新" }}
          </button>
          <a
            class="release-list-button"
            :href="RELEASES_PAGE"
            target="_blank"
            rel="noopener noreferrer"
          >
            全部版本
          </a>
        </span>
      </footer>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

interface ReleaseAsset {
  name: string;
  size: number;
  download_count: number;
  browser_download_url: string;
}

interface Release {
  tag_name: string;
  name: string;
  body: string | null;
  html_url: string;
  prerelease: boolean;
  published_at: string;
  assets: ReleaseAsset[];
}

interface ReleaseCache {
  fetchedAt: number;
  releases: Release[];
}

const REPO = "miracleEverywhere/dst-management-platform-api";
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases?per_page=10`;
const RELEASES_PAGE = `https://github.com/${REPO}/releases`;

/** 每次写入缓存后，在 TTL 内不再重复请求，避免打满 GitHub 的匿名限流（60 次/小时/IP） */
const CACHE_KEY = "dmp-changelog-releases-v1";
const CACHE_TTL = 6 * 60 * 60 * 1000;

const releases = ref<Release[]>([]);
const htmlBodies = ref<Record<string, string>>({});
const loading = ref(true);
const refreshing = ref(false);
const updatedAt = ref<number>();
const fromCache = ref(false);
const error = ref("");

/* ---------------------------------- 缓存 ---------------------------------- */

function readCache(): ReleaseCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ReleaseCache;
    return Array.isArray(parsed?.releases) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(cache: ReleaseCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* 隐私模式等场景下忽略写入失败 */
  }
}

/* -------------------------------- 数据获取 -------------------------------- */

async function fetchReleases(force = false): Promise<void> {
  const cache = readCache();
  const fresh = cache !== null && Date.now() - cache.fetchedAt < CACHE_TTL;

  if (!force && cache && fresh) {
    releases.value = cache.releases;
    updatedAt.value = cache.fetchedAt;
    fromCache.value = true;
    loading.value = false;
    return;
  }

  refreshing.value = true;

  try {
    const response = await fetch(RELEASES_API, {
      headers: { Accept: "application/vnd.github+json" },
    });

    if (!response.ok) throw new Error(`GitHub API 返回 ${response.status}`);

    const data = (await response.json()) as Release[];
    const list = (Array.isArray(data) ? data : []).slice(0, 10);

    releases.value = list;
    updatedAt.value = Date.now();
    fromCache.value = false;
    error.value = "";
    writeCache({ fetchedAt: Date.now(), releases: list });
  } catch {
    if (cache?.releases.length) {
      releases.value = cache.releases;
      updatedAt.value = cache.fetchedAt;
      fromCache.value = true;
      error.value = "无法连接 GitHub，当前展示的是本地缓存内容。";
    } else {
      error.value = "无法获取更新日志，请检查网络后重试，或直接前往 GitHub 查看。";
    }
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

/* ------------------------------ Markdown 渲染 ------------------------------ */

/**
 * markdown-it 只在 /changelog/ 页面按需加载，避免污染站点主包。
 * `html: false` 会转义 release 正文里的原始 HTML，配合 markdown-it 自带的
 * 链接协议校验，再由 DOMPurify 兜底。
 */
let renderer: Promise<(body: string) => string> | undefined;

function getRenderer(): Promise<(body: string) => string> {
  renderer ??= (async () => {
    const [{ default: MarkdownIt }, { default: DOMPurify }] = await Promise.all([
      import("markdown-it"),
      import("dompurify"),
    ]);

    const md = new MarkdownIt({ html: false, linkify: true, breaks: false });

    const renderLinkOpen =
      md.renderer.rules.link_open ??
      ((tokens, index, options, _env, self) =>
        self.renderToken(tokens, index, options));

    md.renderer.rules.link_open = (tokens, index, options, env, self) => {
      tokens[index].attrSet("target", "_blank");
      tokens[index].attrSet("rel", "noopener noreferrer");
      return renderLinkOpen(tokens, index, options, env, self);
    };

    return (body: string) => {
      const tokens = md.parse(body, {});

      // release 正文开头是 `# 2026-09-18`，与页面上的日期重复，去掉
      if (
        tokens[0]?.type === "heading_open" &&
        tokens[0].tag === "h1" &&
        tokens[1]?.type === "inline" &&
        /^\d{4}-\d{2}-\d{2}$/.test(tokens[1].content.trim())
      )
        tokens.splice(0, 3);

      // 标题降级，避免正文标题抢占页面大纲层级
      for (const token of tokens)
        if (token.type === "heading_open" || token.type === "heading_close")
          token.tag = `h${Math.min(Number(token.tag.slice(1)) + 2, 6)}`;

      const html = md.renderer.render(tokens, md.options, {});

      try {
        return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
      } catch {
        // DOMPurify 不可用时降级：markdown-it 已关闭 html 并校验链接协议
        return html;
      }
    };
  })();

  return renderer;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

watch(releases, async (list) => {
  if (!list.length) return;

  const bodies: Record<string, string> = {};

  try {
    const render = await getRenderer();
    for (const release of list)
      bodies[release.tag_name] = render(release.body ?? "");
  } catch {
    // 渲染器加载失败时退化为纯文本，避免整页空白
    for (const release of list)
      bodies[release.tag_name] = `<p>${escapeHtml(release.body ?? "")}</p>`;
  }

  htmlBodies.value = bodies;
});

onMounted(() => {
  void fetchReleases();
});

/* --------------------------------- 格式化 --------------------------------- */

function formatDate(iso: string): string {
  return iso?.slice(0, 10) ?? "";
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function formatSize(bytes: number): string {
  if (!bytes) return "";

  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
</script>

<style lang="scss" scoped>
.release-list {
  --rl-border: var(--vp-c-divider, #e2e2e3);
  --rl-surface: var(--vp-c-bg-alt, #f6f6f7);
  --rl-text-weak: var(--vp-c-text-2, #6b6b6b);
  --rl-brand: var(--vp-c-brand-1, #3eaf7c);
}

.release-list-status {
  display: flex;
  gap: 8px;
  align-items: center;
  color: var(--rl-text-weak);
}

.release-list-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--rl-border);
  border-top-color: var(--rl-brand);
  border-radius: 50%;
  animation: release-list-spin 0.8s linear infinite;
}

@keyframes release-list-spin {
  to {
    transform: rotate(360deg);
  }
}

.release-list-alert {
  padding: 10px 14px;
  margin: 0 0 16px;
  font-size: 0.9rem;
  color: var(--vp-c-warning-1, #b8860b);
  background: var(--vp-c-warning-soft, rgb(255 248 220 / 60%));
  border: 1px solid var(--vp-c-warning-1, #b8860b);
  border-radius: 8px;
}

.release-list-item {
  padding: 18px 20px;
  margin-bottom: 16px;
  background: var(--rl-surface);
  border: 1px solid var(--rl-border);
  border-radius: 10px;
  scroll-margin-top: 80px;
}

.release-list-head {
  display: flex;
  gap: 10px;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px dashed var(--rl-border);
}

.release-list-version {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--rl-brand);

  &:hover {
    text-decoration: underline;
  }
}

.release-list-badge {
  padding: 1px 8px;
  font-size: 0.75rem;
  color: var(--rl-text-weak);
  border: 1px solid var(--rl-border);
  border-radius: 10px;
}

.release-list-badge--latest {
  color: #fff;
  background: var(--rl-brand);
  border-color: var(--rl-brand);
}

.release-list-date {
  margin-left: auto;
  font-size: 0.85rem;
  color: var(--rl-text-weak);
}

.release-list-body {
  font-size: 0.95rem;

  :deep(> *:first-child) {
    margin-top: 0;
  }

  :deep(> *:last-child) {
    margin-bottom: 0;
  }

  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin: 16px 0 8px;
    font-size: 1rem;
    font-weight: 600;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 20px;
    margin: 0.4em 0;
  }

  :deep(a) {
    color: var(--rl-brand);
  }

  :deep(code) {
    padding: 0.15em 0.4em;
    font-size: 0.875em;
    background: var(--vp-c-bg, #fff);
    border: 1px solid var(--rl-border);
    border-radius: 4px;
  }

  :deep(pre) {
    padding: 12px;
    overflow: auto;
    background: var(--vp-c-bg, #fff);
    border: 1px solid var(--rl-border);
    border-radius: 8px;

    code {
      padding: 0;
      background: none;
      border: none;
    }
  }

  :deep(blockquote) {
    padding-left: 12px;
    margin: 8px 0;
    color: var(--rl-text-weak);
    border-left: 4px solid var(--rl-border);
  }
}

.release-list-assets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
  margin-top: 14px;
  border-top: 1px dashed var(--rl-border);
}

.release-list-asset {
  display: inline-flex;
  gap: 6px;
  align-items: baseline;
  padding: 4px 10px;
  font-size: 0.85rem;
  background: var(--vp-c-bg, #fff);
  border: 1px solid var(--rl-border);
  border-radius: 6px;

  &:hover {
    color: var(--rl-brand);
    border-color: var(--rl-brand);
  }
}

.release-list-asset-meta {
  color: var(--rl-text-weak);
}

.release-list-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--rl-text-weak);
}

.release-list-foot-actions {
  display: inline-flex;
  gap: 8px;
}

.release-list-button {
  padding: 4px 12px;
  font-size: 0.85rem;
  color: var(--rl-text-weak);
  cursor: pointer;
  background: var(--vp-c-bg, #fff);
  border: 1px solid var(--rl-border);
  border-radius: 6px;

  &:hover:not(:disabled) {
    color: var(--rl-brand);
    border-color: var(--rl-brand);
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
}
</style>
