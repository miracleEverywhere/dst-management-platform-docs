---
title: 常见问题
icon: circle-question
order: 9
date: 2026-11-02
---

## Lite 支持 Windows 或 macOS 吗？

不支持。`run.sh` 启动时会检查系统类型，非 Linux 直接退出。Lite 依赖 `screen` 管理游戏进程，也只面向 Linux 服务器。

需要 Windows / macOS 支持请使用完整版 DMP。

## 能开多个房间或多个世界吗？

不能。Lite 固定只有一个房间 `Cluster_1` 和两个世界：地面 `Master`、洞穴 `Caves`，页面上没有新增入口。

多房间、多世界请使用完整版 DMP。

## 能创建多个账号吗？

不能。Lite 是单账号设计：

- 数据库中没有用户时，登录页才会显示"注册账号"
- 注册成功后，注册接口会拒绝再次注册
- 没有用户管理、角色、权限相关页面

多用户和权限管理请使用完整版 DMP。

## 忘记密码怎么办？

Lite 没有找回密码功能。可以清空平台数据库后重新注册：

```bash
cd /root/dmp-lite

# 1. 停止平台
./run.sh   # 选择 [2]

# 2. 备份后删除数据库
mv dmp-lite.sdb dmp-lite.sdb.bak

# 3. 重新启动
./run.sh   # 选择 [1]
```

::: danger
`dmp-lite.sdb` 里保存了账号、房间配置、世界配置和模组配置。删除后这些内容会全部丢失（世界存档 `Cluster_1` 不受影响），需要重新配置房间和世界。
:::

## 控制面板的"启动世界"按钮是灰色的？

按以下顺序检查：

1. 该世界是否已经在运行（运行中不能再启动）
2. 是否正在执行启动 / 关闭操作
3. 该世界的 `leveldataoverride.lua` 是否为空

第 3 点最常见。Lite 不会自动生成世界配置，需要先在[世界设置](./world.md)中填写 `leveldataoverride.lua` 并保存。

## 世界启动失败怎么办？

先看[游戏日志](./logs.md)，再按下面顺序排查：

```bash
cd /root/dmp-lite

# screen 是否存在
which screen

# dst 与 steamcmd 是否安装
ls dst/version.txt
ls steamcmd/steamcmd.sh

# 世界会话是否存在
screen -ls
```

常见原因：

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 提示未检测到 `screen` | 未安装依赖 | 执行 `bash manual_install.sh` |
| 提示未检测到 `dst` / `steamcmd` | 未安装游戏依赖 | 执行 `bash manual_install.sh`，或复用完整版的目录 |
| 日志提示缺少 `libcurl`、`lib32` 等 | 缺少 32 位运行库 | 重新执行 `bash manual_install.sh` |
| 日志提示端口被占用 | 端口冲突 | 关闭占用端口的进程，或按[世界设置](./world.md#修改端口)调整端口 |
| 日志提示 Lua 语法错误 | `leveldataoverride.lua` / `modoverrides.lua` 写错 | 修正语法后重新保存 |

::: tip
Lite 默认调用的是 32 位饥荒服务端（`dontstarve_dedicated_server_nullrenderer`）。Rocky 10 等不再支持 32 位应用的系统无法使用。
:::

## 顶部游戏版本是红色或黄色？

| 颜色 | 含义 | 处理 |
| --- | --- | --- |
| 红色（版本 `0`） | 未读到本地版本 | 检查 `dst/version.txt` 是否存在，即游戏依赖是否安装 |
| 黄色 | 本地版本落后 | 在控制面板点击 **更新游戏**，或执行 `bash manual_update.sh` |
| 绿色 | 已是最新版本 | 无需处理 |

最新版本由后台每 2 小时拉取一次，刚启动时可能还没取到，稍等后刷新页面即可。

## "更新游戏"和"更新平台"有什么区别？

| 操作 | 更新对象 | 入口 |
| --- | --- | --- |
| 更新游戏 | 饥荒服务端 `dst/` | 控制面板 **更新游戏**，或 `bash manual_update.sh` |
| 更新平台 | Lite 程序与前端 | `./run.sh` → `[4]` |
| 更新启动脚本 | `run.sh` | `./run.sh` → `[5]` |

更新游戏前请先关闭地面与洞穴世界；更新平台不会影响 `dmp-lite.sdb` 和存档。

## 平台打不开 / 端口被占用？

```bash
cd /root/dmp-lite

# 平台进程是否存在
pgrep -x dmp-lite

# 端口是否被监听
ss -ltn | grep 9999

# 平台日志
tail -n 50 logs/dmp-lite.log
```

- 进程不存在：重新执行 `./run.sh`，选择 `[1]`，查看终端报错
- 端口被占用：`run.sh` 会打印占用者，修改脚本顶部的 `PORT` 后重新执行 `./run.sh` 并选择 `[3]`
- 进程正常但网页打不开：检查云服务器安全组是否放行 `PORT`（TCP）

## 直连地址为空或不正确？

- 公网 IP 由后台调用外部接口获取，平台刚启动时可能需要几秒；过一会儿刷新页面即可
- 所有外部接口都失败时直连地址可能为空，此时可以手动在游戏中执行：

```lua
c_connect('你的公网IP', 11001)
```

- 有密码时：

```lua
c_connect('你的公网IP', 11001, '房间密码')
```

- 直连延迟高或进不去：确认安全组已放行 `11001`、`11002`（UDP）

::: info
Lite 不提供自定义直连地址的功能，如果使用了端口映射或内网穿透，请以映射后的公网 IP 与端口为准，手动拼接直连代码。
:::

## 日志为什么只能看 100 行？

这是 Lite 的固定设计，目的是控制内存占用和读盘量。需要更多内容时，直接在服务器上查看文件：

```bash
tail -n 500 ~/.klei/DoNotStarveTogether/Cluster_1/Master/server_log.txt
```

## 如何备份和迁移？

停止平台与游戏后，复制以下两处：

```bash
# 平台数据
cp /root/dmp-lite/dmp-lite.sdb /path/to/backup/

# 存档与配置
cp -r /root/.klei/DoNotStarveTogether/Cluster_1 /path/to/backup/
```

迁移到新服务器时：

1. 在新服务器安装并启动一次 Lite（生成目录和默认数据库）
2. 停止平台
3. 用备份覆盖 `dmp-lite.sdb` 与 `~/.klei/DoNotStarveTogether/Cluster_1`
4. 启动平台

::: tip
迁移后如果游戏无法启动，检查新服务器的依赖、端口与安全组是否与旧服务器一致。
:::

## 为什么在线玩家人数有延迟？

在线玩家由后台每 2 分钟向游戏注入一次查询命令采集，控制面板读取的是缓存结果，因此最多会有 2 分钟延迟。世界未运行或查询失败时，会显示上一次成功获取的结果或 `0`。

## 能与完整版 DMP 共用存档吗？

两者目录结构相同（`Cluster_1`、`Master`、`Caves`），可以复制存档，但：

- 不要同时运行 Lite 和完整版并指向同一个 `Cluster_1`，会互相覆盖配置与存档
- 完整版的房间 ID 可能与 Lite 的 `Cluster_1` 不同，复制后需要按 Lite 的固定目录结构调整
- 两边的 `dmp-lite.sdb` 与 `data/dmp.db` 不通用

## 还有问题？

可以先在本站搜索，或到[常见问题](../faq/)中查找完整版的对应说明；玩游戏本身的问题（模组、直连、卡顿等）在 Lite 与完整版中是相通的。
