---
title: 安装与启动
icon: download
order: 2
date: 2026-11-02
---

## 环境要求

- **仅支持 Linux**：`run.sh` 会检查系统类型，非 Linux 会直接退出
- 推荐 **Ubuntu 24**、**Rocky 9**、**Debian 13** 或更高版本（作者主要测试这三个系统）
- 需要安装饥荒服务端依赖（`screen`、`steamcmd`、`dst`），见[安装游戏依赖](#安装游戏依赖)
- 建议 2 核 2G 及以上，并开启虚拟内存（`run.sh` 的 `[6]` 可一键设置）
- 需要放行平台端口（默认 `9999/TCP`）与游戏端口（默认 `11001`、`11002`，UDP）

::: warning
Rocky 10 不再支持 32 位应用，无法安装 32 位的饥荒服务端，请不要使用。
:::

## 下载启动脚本

以 `root` 登录服务器，在准备存放 Lite 的目录中执行：

```bash
mkdir -p /root/dmp-lite
cd /root/dmp-lite

curl -fL -O https://raw.githubusercontent.com/miracleEverywhere/dst-management-platform-api/master/lite/run.sh
chmod +x run.sh
```

如果服务器无法访问 `raw.githubusercontent.com`，把地址前面拼上加速节点即可，例如：

```bash
curl -fL -O https://ghfast.top/https://raw.githubusercontent.com/miracleEverywhere/dst-management-platform-api/master/lite/run.sh
chmod +x run.sh
```

::: tip
`run.sh` 启动时会校验自身的关键地址。如果出现红色闪烁的"脚本可能被加速站点篡改"提示，说明下载到的脚本不完整或被改写，请更换加速节点重新下载。
:::

## 可修改的配置

脚本开头有三个可修改的变量，**修改后再执行安装**：

```bash
# dmp-lite 暴露端口，即网页打开时所用的端口
PORT=9999

# 虚拟内存大小，例如 1G 4G 等
SWAPSIZE=2G

# 加速节点
ACCELERATION_SITE=(
	"gh-proxy.com"
	"github.dpik.top"
	"ghfast.top"
)
```

| 变量                  | 说明                             |
|---------------------|--------------------------------|
| `PORT`              | 平台网页端口，也是 `dmp-lite -bind` 的端口 |
| `SWAPSIZE`          | 菜单 `[6]` 设置虚拟内存时创建的 swap 大小    |
| `ACCELERATION_SITE` | 下载平台安装包时可选用的加速节点，可自行增删         |

## 首次安装

```bash
./run.sh
```

::: tip
默认要求 `root` 用户运行。如果你想用普通用户运行，请使用 `./run.sh no-root`，脚本会在需要 root 权限的步骤（如安装依赖、设置 swap）使用 `sudo`。
:::

启动后会看到如下菜单：

```text
[0]: 下载并启动饥荒管理平台 Lite
[1]: 启动饥荒管理平台 Lite
[2]: 关闭饥荒管理平台 Lite
[3]: 重启饥荒管理平台 Lite
[4]: 更新饥荒管理平台 Lite
[5]: 更新run.sh启动脚本
[6]: 设置虚拟内存
[7]: 设置开机自启
[8]: 退出脚本
```

选择 `0` 开始安装：

1. 检查 `jq`、`curl`，缺失时自动安装
2. 从 GitHub 获取最新版本的 `dmp-lite.tgz` 下载地址与 `sha-256` 校验值
3. 选择加速节点（直接回车默认第 1 个，最后一个选项为不加速）
4. 下载并校验安装包，校验失败会中止
5. 解压到临时目录，确认 `dmp-lite` 与 `dist-lite/index.html` 存在后，覆盖到工作目录
6. 检查 `PORT` 是否被占用
7. 提示是否检测到 `screen`、`dst`、`steamcmd`
8. 后台启动 `dmp-lite`，日志写入 `logs/dmp-lite.log`

安装成功后终端会输出 **启动成功**：

此时在浏览器打开 `http://服务器IP:9999` 即可，端口以你的 `PORT` 为准。

::: info
菜单 `[0]` 会清理旧的程序文件（`dmp-lite`、`dist-lite`、日志与手动脚本），但**不会删除** `dmp-lite.sdb` 和 `~/.klei/.../Cluster_1`，重新安装不会丢配置与存档。
:::

## 菜单说明

| 选项    | 作用                                                            |
|-------|---------------------------------------------------------------|
| `[0]` | 清理旧程序 → 下载最新版 → 启动                                            |
| `[1]` | 启动平台；程序或前端缺失时会先自动安装                                           |
| `[2]` | 停止平台（先 `pkill`，1 秒后仍在则 `-9` 强杀）                               |
| `[3]` | 停止后重新启动                                                       |
| `[4]` | **直接**下载并覆盖最新版，再启动（Lite 不做版本比较）                               |
| `[5]` | 更新 `run.sh`，保留你设置的 `PORT`、`SWAPSIZE` 后自动重启脚本                  |
| `[6]` | 创建 / 启用 `/swapfile` 并写入 `/etc/fstab`，同时设置 `vm.swappiness` 等参数 |
| `[7]` | 向当前用户 `crontab` 写入 `@reboot` 开机自启                             |
| `[8]` | 退出脚本（不会停止平台）                                                  |

::: warning
`[4]` 是"无脑覆盖"式更新：即使当前已是最新版本，也会重新下载安装。更新不会动 `dmp-lite.sdb` 和存档。
:::

## 安装游戏依赖

Lite 只负责管理，**不会自动安装饥荒服务端**。发布包内附带了 `manual_install.sh`，完成上面的平台安装后，在工作目录执行：

```bash
cd /root/dmp-lite
bash manual_install.sh
```

::: tip
以 `no-root` 模式运行时，请改用 `sudo bash manual_install.sh`。
:::

该脚本会：

- 安装 `screen`、`wget` 与 32 位运行库（Ubuntu/Debian 使用 `apt`，RHEL 系使用 `yum`）
- 下载 `steamcmd` 到 `./steamcmd`
- 通过 SteamCMD 下载饥荒服务端 `343050` 到 `./dst`
- 为 64 位服务端补齐 `libcurl` 软链，并生成 `dontstarve_dedicated_server_nullrenderer_x64_luajit`

脚本执行时间较长（取决于网络），期间不要中断。完成后工作目录下应有 `dst/` 和 `steamcmd/`。

::: tip
如果你已经部署过完整版 DMP，`dst/` 与 `steamcmd/` 可以直接复用：把这两个目录复制（或软链接）到 Lite 的工作目录即可，无需重复下载。
:::

如果启动时看到下面的黄色提示，说明依赖尚未就绪，平台本身能启动，但世界无法运行：

```text
未检测到 screen 命令，游戏进程管理将不可用，请先安装 screen
未检测到 dst 或 steamcmd，请先安装游戏依赖（DMP Lite 不会自动安装）
```

## 放行端口

| 端口             | 协议  | 用途                   |
|----------------|-----|----------------------|
| `9999`（`PORT`） | TCP | 访问 Lite 网页           |
| `11001`        | UDP | 地面世界直连端口             |
| `11002`        | UDP | 洞穴世界直连端口             |
| `21001`        | UDP | 主从世界通信（同一台机器时可不对外开放） |

云服务器需要在厂商控制台的**防火墙 / 安全组**中放行；没有独立公网 IP 的机器还需要做端口映射，映射建议内外端口一致。详细操作可参考[开通防火墙](../quick-start/firewall.md)。

## 日常运维

```bash
cd /root/dmp-lite
./run.sh
```

- 修改 `PORT` 后，重新执行 `run.sh` 并选择 `[3]` 重启即可生效
- 开机自启使用 `[7]`，以当前用户身份写入 `crontab`
- 平台日志：

```bash
tail -f /root/dmp-lite/logs/dmp-lite.log
```

- 游戏进程在 `screen` 中运行，会话名为 `DMP_LITE_<世界名>`，例如 `DMP_LITE_Master`：

```bash
screen -ls
```

## 更新

- **更新平台**：`./run.sh` → `[4]`，直接下载最新版覆盖并重启
- **更新启动脚本**：`./run.sh` → `[5]`
- **更新饥荒服务端**：在 [控制面板](./dashboard.md) 点击 **更新游戏**，或手动执行：

```bash
cd /root/dmp-lite
bash manual_update.sh
```

::: warning
更新游戏会通过 SteamCMD 校验并覆盖 `dst/`，**请先关闭地面与洞穴世界**，更新完成后再启动，否则可能出现文件被占用或版本不一致的问题。
:::

## 卸载

Lite 没有单独的卸载菜单，按下面步骤手动清理：

```bash
# 1. 先停止平台
cd /root/dmp-lite
./run.sh   # 选择 [2]

# 2. 删除程序目录
cd ..
rm -rf /root/dmp-lite
```

::: danger
存档目录 `~/.klei/DoNotStarveTogether/Cluster_1` 不在程序目录内，**不会被删除**。如果确实不再需要，请自行确认后删除；否则重装 Lite 后仍会读到旧存档。
:::
