---
title: Lite轻量版
index: false
icon: feather
order: 1
date: 2026-11-02
---

DMP Lite 是饥荒管理平台（DMP）的精简版本，只保留"开一个房间、管好地面和洞穴、随时看日志"这条主线，去掉了多房间、多用户、备份、地图等模块，平台进程常驻内存约 10MB，适合低配服务器或只想快速开服的场景。

::: tip
Lite 与完整版是两套独立程序，**数据不互通**。Lite 的配置和存档不会出现在完整版中，反之亦然。
:::

## 与完整版的区别

| 项目             | DMP Lite              | 完整版 DMP                         |
|----------------|-----------------------|---------------------------------|
| 运行平台           | 仅 Linux               | Linux / macOS / Windows（见完整版文档） |
| 房间数量           | 固定 1 个（`Cluster_1`）   | 多房间                             |
| 世界数量           | 固定地面 + 洞穴             | 可自由增删                           |
| 账号体系           | 单账号，仅用户名 + 密码         | 多用户、角色与权限                       |
| 世界 / 模组配置      | 直接编辑 `lua` 文本         | 可视化配置                           |
| 日志             | 当前游戏日志、聊天日志（最近 100 行） | 实时 / 历史 / Steam / 请求 / 运行日志     |
| 备份、快照、地图、公告等工具 | 无                     | 有                               |
| 内存占用           | 约 10MB                | 相对较高                            |
| 游戏依赖           | 需自行安装                 | 安装向导内可安装                        |
| 平台更新           | 直接下载并覆盖最新版            | 比较版本后更新                         |

## 功能一览

| 页面                          | 说明                               |
|-----------------------------|----------------------------------|
| [安装与启动](./install.md)       | 下载 `run.sh`、安装、升级与日常运维           |
| [注册登录与首次开服](./first-use.md) | 注册账号、认识界面、按顺序开服                  |
| [控制面板](./dashboard.md)      | 房间概览、系统指标、世界启停、更新游戏              |
| [房间设置](./room.md)           | 房间名、模式、令牌、端口、名单等                 |
| [世界设置](./world.md)          | 端口、主世界开关、`leveldataoverride.lua` |
| [模组设置](./mod.md)            | 编辑 `modoverrides.lua`            |
| [日志查看](./logs.md)           | 游戏日志与聊天日志                        |
| [常见问题](./faq.md)            | 使用中可能遇到的问题                       |

## 目录结构

Lite 没有安装位置限制，下面以 `/root/dmp-lite` 为例：

```text
dmp-lite/                  # 工作目录，可任意指定
├── dmp-lite               # 平台主程序
├── dist-lite/             # 前端静态文件
├── run.sh                 # 启动脚本
├── manual_install.sh      # 饥荒游戏依赖安装脚本
├── manual_update.sh       # 饥荒服务端更新脚本
├── dmp-lite.sdb           # 平台数据库（Base64 编码的 JSON）
├── logs/
│   └── dmp-lite.log       # 平台运行日志
├── dst/                   # 饥荒服务端（需自行安装）
└── steamcmd/              # SteamCMD（需自行安装）
```

房间存档与游戏配置位于启动 Lite 的用户的 Home 目录下：

```text
~/.klei/DoNotStarveTogether/Cluster_1/
├── cluster.ini            # 房间配置
├── cluster_token.txt      # 游戏令牌
├── whitelist.txt          # 预留位
├── adminlist.txt          # 管理员
├── blocklist.txt          # 黑名单
├── Master/                # 地面世界
│   ├── server.ini
│   ├── leveldataoverride.lua
│   ├── modoverrides.lua
│   ├── server_log.txt
│   └── server_chat_log.txt
└── Caves/                 # 洞穴世界
    └── ...
```

::: warning
如果以 `root` 运行，存档目录就是 `/root/.klei/DoNotStarveTogether/Cluster_1`；以普通用户运行时则在该用户的 Home 下。迁移或备份时不要找错位置。
:::

## 数据备份

Lite 需要备份的内容只有两处：

- `dmp-lite.sdb`：账号、房间、世界、模组配置与 JWT 密钥
- `~/.klei/DoNotStarveTogether/Cluster_1/`：房间配置与存档

建议先通过 `run.sh` 停止平台和游戏，再复制这两个位置，避免写入到一半的文件。

## 快速开始

1. [安装并启动 Lite](./install.md)
2. [注册账号并完成首次开服](./first-use.md)
3. 在 [控制面板](./dashboard.md) 启动世界，把直连地址发给玩家
