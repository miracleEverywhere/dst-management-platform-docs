---
home: true
icon: house
title: 主页
heroText: 饥荒管理平台
tagline: 优雅的饥荒专用服务器管理方案。一键部署，智能运维，让你专注于游戏本身。
heroAlt: 饥荒管理平台控制面板
heroImage: /assets/home/hero-light.svg
heroImageDark: /assets/home/hero-dark.svg
bgImage: /assets/home/bg-light.svg
bgImageDark: /assets/home/bg-dark.svg
actions:
  - text: 快速上手
    icon: wand-magic-sparkles
    link: ./quick-start/
    type: primary
  - text: Lite 轻量版
    icon: feather
    link: ./lite/
highlights:
  - header: 开服之后，才是日常
    description: 房间、世界、模组、玩家、备份和日志，常用操作都在同一个界面里完成。
    features:
      - title: 多房间、多世界
        icon: network-wired
        details: 一个平台管理多个存档，地面与洞穴独立配置、独立启停。
        link: docs/rooms.html
      - title: 可视化配置
        icon: sliders
        details: 房间、世界与模组，像在游戏里一样点选，不用手写配置文件。
        link: docs/setting/room.html#世界设置
      - title: 玩家管理
        icon: users
        details: 查看在线玩家，一键设置管理员、预留位与黑名单。
        link: docs/setting/player.html
      - title: 自动备份
        icon: database
        details: 按计划备份存档，需要时一键恢复，回档不再靠运气。
        link: docs/tools/backup.html
      - title: 日志与控制台
        icon: file-lines
        details: 世界日志、聊天日志、运行日志，配合网页控制台排查问题。
        link: docs/logs.html
      - title: 用户与权限
        icon: lock
        details: 多账号登录，按角色分配可用页面与操作权限。
        link: docs/users.html
  - header: 一条命令，从零到开服
    description: 安装脚本自动检查依赖、下载最新版本并启动，也支持 Docker 部署。
    image: /assets/home/install-light.svg
    imageDark: /assets/home/install-dark.svg
    highlights:
      - title: run.sh 一键部署
        details: 自动下载、SHA-256 校验、解压并启动，失败时给出明确提示。
        link: docs/install/bin.html
      - title: Docker 部署
        details: 容器化运行，多实例、多环境互不影响。
        link: docs/install/docker.html
      - title: 不止 Linux
        details: 支持 Linux、macOS 与 Windows（WSL），按文档选择合适的方式。
        link: docs/install/
  - header: 轻量，还是全能？
    description: 两种形态，同样的操作习惯。按服务器配置和开服规模选择即可。
    image: /assets/home/modes-light.svg
    imageDark: /assets/home/modes-dark.svg
    highlights:
      - title: Lite 轻量版 · 约 10MB
        details: 单房间、地面 + 洞穴双世界，保留开服、配置与日志等核心能力。
        link: lite/
      - title: 完整版 · 全功能
        details: 多房间、多用户、自动备份、地图、控制台与平台工具。
        link: docs/
      - title: 桌面 App
        details: Windows、macOS、Linux 客户端，用令牌统一管理多个平台。
        link: https://github.com/miracleEverywhere/dst-management-platform-desktop
  - header: 开源、透明、可自托管
    description: Go + Vue 构建，数据与存档都留在你自己的服务器上。
    features:
      - title: Go 1.27.3
        icon: server
        details: 标准 C/S 架构，Gin 1.12.0，编译为单个可执行文件。
      - title: Vue 3.5.22
        icon: code
        details: Vuetify 3.12.1，支持明暗主题、移动端布局与多语言。
      - title: MIT 协议
        icon: code-branch
        details: 任意修改，允许商用，欢迎提交 Issue 与 PR。
        link: https://github.com/miracleEverywhere/dst-management-platform-api
copyright: false
footer: 使用 <a href="https://theme-hope.vuejs.press/zh/" target="_blank">VuePress Theme Hope</a> 主题 | MIT 协议
---

<section class="dmp-cta">
  <div class="dmp-cta-copy">
    <p class="dmp-cta-eyebrow">开源 · MIT</p>
    <h2>把服务器，交给 DMP</h2>
    <p>从一条命令开始。房间、世界、模组、备份和日志，都在这里。</p>
  </div>
  <div class="dmp-cta-actions">
    <a class="dmp-cta-btn dmp-cta-btn--primary" href="/quick-start/">快速上手</a>
    <a class="dmp-cta-btn" href="https://github.com/miracleEverywhere/dst-management-platform-api" target="_blank" rel="noreferrer">GitHub</a>
  </div>
</section>

<style>
/* ── 首页专用样式，全部限定在 .vp-project-home 内 ── */
.vp-project-home {
  --dmp-accent: #7c5cff;
  --dmp-accent-strong: #6d3ff2;
  --dmp-accent-soft: rgba(124, 92, 255, 0.1);
  --vp-c-accent: #7c5cff;
  --vp-c-accent-hover: #6d3ff2;
  --vp-c-accent-bg: #7c5cff;
  --vp-c-accent-soft: rgba(124, 92, 255, 0.12);
}

/* Hero */
.vp-project-home .vp-hero-info-wrapper {
  min-height: 580px;
}

.vp-project-home .vp-hero-info-wrapper::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  z-index: 0;
  height: 5rem;
  background: linear-gradient(180deg, transparent, var(--vp-c-bg));
  pointer-events: none;
}

.vp-project-home .vp-hero-info {
  max-width: 1180px;
  margin: 0 auto;
  padding-inline: 2.5rem;
}

.vp-project-home .vp-hero-infos {
  max-width: 34rem;
}

.vp-project-home .vp-hero-title {
  background-image: linear-gradient(112deg, #2b1a5e 0%, #6d3ff2 48%, #b388ff 100%);
  font-size: clamp(2.6rem, 5vw, 4rem);
  line-height: 1.14;
  letter-spacing: -0.035em;
}

[data-theme="dark"] .vp-project-home .vp-hero-title {
  background-image: linear-gradient(112deg, #ffffff 0%, #ece7ff 46%, #c4b5fd 100%);
}

.vp-project-home #main-description {
  max-width: 32rem;
  margin: 1.4rem 0 0;
  color: var(--vp-c-text-mute);
  font-weight: 400;
  font-size: clamp(1.05rem, 1.5vw, 1.25rem);
  line-height: 1.7;
}

.vp-project-home #main-description::before {
  content: "DMP · 饥荒管理平台";
  display: block;
  margin-bottom: 0.9rem;
  color: var(--dmp-accent);
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
}

.vp-project-home .vp-hero-actions {
  margin-top: 1.8rem;
}

.vp-project-home .vp-hero-action {
  border: 1px solid var(--vp-c-border);
  border-radius: 999px;
  background: var(--vp-c-bg);
  font-weight: 600;
  font-size: 1rem;
  padding: 0.68rem 1.45rem;
  box-shadow: 0 2px 10px rgba(43, 20, 80, 0.06);
}

.vp-project-home .vp-hero-action:hover {
  border-color: var(--dmp-accent);
  background: var(--vp-c-bg);
}

.vp-project-home .vp-hero-action.primary {
  border-color: transparent;
  background: linear-gradient(135deg, #8c57ff, #6d3ff2);
  box-shadow: 0 12px 28px rgba(124, 92, 255, 0.32);
}

.vp-project-home .vp-hero-action.primary:hover {
  background: linear-gradient(135deg, #9b6bff, #7c5cff);
}

.vp-project-home .vp-hero-image {
  width: 33rem;
  max-width: 100%;
  max-height: none;
  height: auto;
  filter: drop-shadow(0 28px 52px rgba(43, 20, 80, 0.16));
}

[data-theme="dark"] .vp-project-home .vp-hero-image {
  filter: drop-shadow(0 28px 52px rgba(0, 0, 0, 0.55));
}

/* Feature sections */
.vp-project-home .vp-feature {
  max-width: 1200px;
  padding: 4.5rem 2.5rem 3.5rem;
}

.vp-project-home .vp-feature-header {
  margin-bottom: 0.7rem;
  font-size: clamp(1.8rem, 3.2vw, 2.4rem);
  letter-spacing: -0.025em;
}

.vp-project-home .vp-feature-description {
  max-width: 46rem;
  margin: 0.6rem auto 2.4rem;
  color: var(--vp-c-text-mute);
  font-size: 1.02rem;
  line-height: 1.75;
}

.vp-project-home .vp-features {
  margin: 1rem -0.75rem 0;
}

.vp-project-home .vp-feature-item {
  box-sizing: border-box;
  flex-basis: calc(33.333% - 1.5rem);
  margin: 0.75rem;
  padding: 1.45rem 1.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 1.1rem;
  background: var(--vp-c-bg-soft);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease;
}

.vp-project-home .vp-feature-item.link:hover {
  border-color: rgba(124, 92, 255, 0.32);
  background: var(--vp-c-bg);
  box-shadow: 0 18px 40px rgba(43, 20, 80, 0.08);
  transform: translateY(-3px);
}

.vp-project-home .vp-feature-item.link:hover::before {
  content: none;
  display: none;
}

.vp-project-home .vp-feature-item.link::after {
  content: "→";
  position: absolute;
  top: 1.35rem;
  right: 1.35rem;
  color: var(--dmp-accent);
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.vp-project-home .vp-feature-item.link:hover::after {
  opacity: 1;
  transform: translateX(0);
}

.vp-project-home .vp-feature-item .vp-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  margin-bottom: 0.9rem;
  padding: 0.55rem;
  border-radius: 0.75rem;
  background: var(--dmp-accent-soft);
  color: var(--dmp-accent);
  font-size: 1.1rem;
}

.vp-project-home .vp-feature-title {
  margin: 0.2rem 0 0.5rem;
  font-size: 1.12rem;
  line-height: 1.4;
}

.vp-project-home .vp-feature-details {
  color: var(--vp-c-text-mute);
  font-size: 0.94rem;
  line-height: 1.65;
}

/* Highlight panels */
.vp-project-home .vp-highlight-wrapper {
  border-top: 1px solid var(--vp-c-border);
  background: linear-gradient(180deg, transparent, rgba(124, 92, 255, 0.045) 22%, rgba(124, 92, 255, 0.045) 78%, transparent);
}

[data-theme="dark"] .vp-project-home .vp-highlight-wrapper {
  background: linear-gradient(180deg, transparent, rgba(124, 92, 255, 0.075) 22%, rgba(124, 92, 255, 0.075) 78%, transparent);
}

.vp-project-home .vp-highlight {
  max-width: 1200px;
  padding: 3.5rem 2.5rem;
}

.vp-project-home .vp-highlight-image {
  width: 20rem;
  margin: 1rem 3rem;
  filter: drop-shadow(0 18px 34px rgba(43, 20, 80, 0.1));
}

[data-theme="dark"] .vp-project-home .vp-highlight-image {
  filter: drop-shadow(0 18px 34px rgba(0, 0, 0, 0.45));
}

.vp-project-home .vp-highlight-info {
  max-width: 33rem;
}

.vp-project-home .vp-highlight-header {
  margin-bottom: 0.6rem;
  font-size: clamp(1.8rem, 3.2vw, 2.4rem);
  letter-spacing: -0.025em;
}

.vp-project-home .vp-highlight-description {
  margin: 0.4rem 0 1.6rem;
  color: var(--vp-c-text-mute);
  font-size: 1.02rem;
  line-height: 1.75;
}

.vp-project-home .vp-highlights {
  display: grid;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
}

.vp-project-home .vp-highlight-item-wrapper {
  padding: 0.9rem 1.1rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 0.9rem;
  background: var(--vp-c-bg-soft);
  list-style: none;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.vp-project-home .vp-highlight-item-wrapper.link:hover {
  border-color: rgba(124, 92, 255, 0.28);
  background: var(--vp-c-bg);
}

.vp-project-home .vp-highlight-item-wrapper.link:hover::before {
  content: none;
  display: none;
}

.vp-project-home .vp-highlight-item {
  list-style: none;
}

.vp-project-home .vp-highlight-title {
  font-size: 1.02rem;
}

.vp-project-home .vp-highlight-details {
  margin-top: 0.35rem;
  color: var(--vp-c-text-mute);
  font-size: 0.92rem;
  line-height: 1.6;
}

/* 最后一个功能区与 CTA 之间留出呼吸空间 */
.vp-project-home .vp-feature-wrapper:last-of-type {
  border-top: 1px solid var(--vp-c-border);
}

/* CTA */
.vp-project-home [vp-content] {
  max-width: 1200px;
  padding: 1rem 2.5rem 4.5rem;
}

.vp-project-home .dmp-cta {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  max-width: 1120px;
  margin: 0 auto;
  padding: 2rem 2.4rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 1.25rem;
  background:
    radial-gradient(120% 170% at 0% 0%, rgba(124, 92, 255, 0.09), transparent 55%),
    var(--vp-c-bg-soft);
  box-shadow: 0 10px 30px rgba(43, 20, 80, 0.05);
  color: var(--vp-c-text);
}

[data-theme="dark"] .vp-project-home .dmp-cta {
  background:
    radial-gradient(120% 170% at 0% 0%, rgba(124, 92, 255, 0.14), transparent 55%),
    var(--vp-c-bg-soft);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.vp-project-home .dmp-cta::before {
  content: "";
  position: absolute;
  inset-block: 1.6rem;
  inset-inline-start: 0;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, #8c57ff, #c4b5fd);
  pointer-events: none;
}

.vp-project-home .dmp-cta-copy {
  flex: 1 1 22rem;
  min-width: 0;
}

.vp-project-home .dmp-cta-eyebrow {
  margin: 0 0 0.45rem;
  color: var(--dmp-accent);
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.14em;
}

.vp-project-home .dmp-cta h2 {
  margin: 0 0 0.4rem;
  border: none;
  color: var(--vp-c-text);
  font-size: clamp(1.45rem, 2.2vw, 1.85rem);
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.vp-project-home .dmp-cta p {
  max-width: 36rem;
  margin: 0;
  color: var(--vp-c-text-mute);
  font-size: 0.95rem;
  line-height: 1.7;
}

.vp-project-home .dmp-cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.vp-project-home .dmp-cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.64rem 1.35rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text);
  font-weight: 600;
  font-size: 0.92rem;
  text-decoration: none;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.vp-project-home .dmp-cta-btn:hover {
  border-color: var(--dmp-accent);
  color: var(--dmp-accent);
  background: var(--vp-c-bg);
  text-decoration: none;
  transform: translateY(-1px);
}

.vp-project-home .dmp-cta-btn--primary {
  border-color: transparent;
  background: var(--dmp-accent);
  color: #fff;
  box-shadow: 0 6px 16px rgba(124, 92, 255, 0.24);
}

.vp-project-home .dmp-cta-btn--primary:hover {
  background: var(--dmp-accent-strong);
  color: #fff;
}

/* Responsive */
@media (max-width: 959px) {
  .vp-project-home .vp-hero-info-wrapper {
    min-height: 0;
    padding-block: 3rem 2.5rem;
  }

  .vp-project-home .vp-hero-info-wrapper::after {
    height: 3rem;
  }

  .vp-project-home .vp-hero-info {
    display: flex;
    flex-direction: column;
  }

  .vp-project-home .vp-hero-infos {
    order: -1;
  }

  .vp-project-home .vp-hero-info {
    padding-inline: 1.5rem;
  }

  .vp-project-home .vp-hero-infos {
    margin: 0 auto;
  }

  .vp-project-home .vp-hero-image {
    width: 100%;
    max-width: 100%;
  }

  .vp-project-home .vp-feature,
  .vp-project-home .vp-highlight {
    padding: 3.5rem 1.5rem;
  }

  .vp-project-home .vp-feature-item {
    flex-basis: calc(50% - 1.5rem);
  }

  .vp-project-home .vp-highlight-image {
    width: 13rem;
    margin: 0 auto 1.5rem;
  }

  .vp-project-home .vp-highlight-info {
    margin: 0 auto;
  }

  .vp-project-home [vp-content] {
    padding: 2rem 1.5rem 3.5rem;
  }
}

@media (max-width: 719px) {
  .vp-project-home .vp-features {
    margin-inline: 0;
  }

  .vp-project-home .vp-feature-item {
    flex-basis: 100%;
    margin: 0.5rem 0;
  }

  .vp-project-home .vp-highlight-image {
    width: 11rem;
  }

  .vp-project-home .dmp-cta {
    padding: 2rem 1.5rem;
    border-radius: 1.3rem;
  }

  .vp-project-home .dmp-cta-actions {
    width: 100%;
  }

  .vp-project-home .dmp-cta-btn {
    flex: 1 1 auto;
  }
}
</style>
