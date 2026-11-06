# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Documentation site for **dst-management-platform** (饥荒管理平台 / Don't Starve Together Management Platform). Built with VuePress 2 + vuepress-theme-hope, written in Chinese (zh-CN).

Live site: https://docs.miraclesses.top

## Commands

```bash
pnpm docs:dev          # Start dev server
pnpm docs:clean-dev    # Start dev server with clean cache
pnpm docs:build        # Production build (output: src/.vuepress/dist/)
pnpm docs:update-package  # Update vuepress packages
pnpm images:webp       # Convert referenced PNGs to WebP (keeps PNGs, rewrites md refs)
pnpm images:clean-png  # Delete PNGs that have been replaced by WebP
```

Package manager: **pnpm** (required).

## Architecture

- `src/` — all markdown content lives here; `src/README.md` is the homepage
- `src/.vuepress/` — VuePress configuration
  - `config.ts` — main config (lang, title, Vite bundler with image optimization)
  - `theme.ts` — theme-hope config (navbar, sidebar, markdown features, plugins)
  - `navbar.ts` — top navigation: Home, Quick Start, Docs, FAQ
  - `sidebar.ts` — uses `"structure"` mode (auto-generated from directory structure)
  - `styles/` — SCSS overrides (palette, config, index)
  - `public/` — static assets (logo, favicon, images)

## Content Sections

- `src/quick-start/` — installation, server setup, firewall, settings, token
- `src/docs/` — full documentation: dashboard, rooms, settings, tools, logs, import, platform, users
- `src/faq/` — FAQ split into `dmp/` (platform issues) and `dst/` (game issues)
- `src/project/` — project info (referenced in sidebar but no markdown files yet)

## Key Details

- Sidebar is auto-generated from directory structure (`"structure"` mode) — folder/file ordering is controlled by frontmatter or file naming
- Markdown features enabled: markmap, mermaid, code tabs, plantuml, figure, GFM, image lazy-load, shiki syntax highlighting with collapsible lines
- Comments powered by Giscus (GitHub Discussions)
- Content images are WebP: run `pnpm images:webp` after adding PNG screenshots, check `pnpm docs:dev`, then `pnpm images:clean-png` to drop the originals (`scripts/images.mjs`)
- `vite-plugin-image-optimizer` still runs at build time as a safety net for PNG/SVG, but `.webp` is excluded so already-compressed images are not re-encoded
- Docs branch is `master`; docs source dir is `src`
