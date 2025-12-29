---
title: 安装游戏
icon: download
date: 2025-12-29
order: 10
---

进入安装游戏页面，会显示左右两部分内容

左侧为当前服务器的配置信息，如CPU、内存、运行时间等信息

![系统信息](assets/install-system-info.png)

右侧如果未安装会提示安装

![检查安装游戏不存在](assets/install-check-none.png)

如果系统名为`ubuntu`、`Debian`、`rocky`其中的一个，即可进行安装

::: tip
推荐系统版本 `Ubuntu24`、`Rocky9`、`Debian13`
:::

如果平台检测到饥荒已经安装，则会显示重新安装和更新游戏

![检查安装游戏已存在](assets/install-check.png)

点击安装或重新安装按钮后，平台会在当前页面开启一个终端，并执行安装脚本

平台安装进行的操作：

1. 生成安装脚本

```shell  title="manual_install.sh"
#!/bin/bash

# 设置错误处理
set -e

# 定义变量
STEAM_DIR="$HOME/steamcmd"
DST_DIR="$HOME/dst"

# 错误处理函数
function error_exit() {
    echo -e "==>dmp@@ 安装失败 @@dmp<=="
    exit 1
}

# 设置trap捕获所有错误
trap error_exit ERR

# 工具函数
function install_ubuntu() {
    dpkg --add-architecture i386
    apt update -y
    apt install -y lib32gcc1 || true
    apt install -y lib32gcc-s1 || true
    apt install -y libcurl4-gnutls-dev:i386
    apt install -y screen wget
}

function install_rhel() {
    yum update -y
    yum -y install glibc.i686 libstdc++.i686 libcurl.i686
    yum -y install glibc libstdc++ libcurl
    yum -y install screen wget
}

function check_screen() {
    if ! which screen > /dev/null 2>&1; then
        echo -e "screen命令安装失败"
        error_exit
    fi
}

function check_wget() {
    if ! which wget > /dev/null 2>&1; then
        echo -e "wget命令安装失败"
        error_exit
    fi
}

# 安装依赖
OS=$(grep -P "^ID=" /etc/os-release | awk -F'=' '{print($2)}' | sed "s/['\"]//g")
if [[ "${OS}" == "ubuntu" || "${OS}" == "debian" ]]; then
    install_ubuntu
else
    if grep -P "^ID_LIKE=" /etc/os-release | awk -F'=' '{print($2)}' | sed "s/['\"]//g" | grep rhel > /dev/null 2>&1; then
        install_rhel
    else
        echo -e "系统不支持"
        error_exit
    fi
fi

# 检查screen命令
check_screen

# 检查wget命令
check_wget

# 下载安装包
cd "$HOME" || error_exit
rm -f steamcmd_linux.tar.gz
wget https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz

# 解压安装包
rm -rf "$STEAM_DIR"
mkdir -p "$STEAM_DIR"
tar -zxvf steamcmd_linux.tar.gz -C "$STEAM_DIR"

# PR77 清理可能损坏的acf文件
rm -rf "$DST_DIR/steamapps/appmanifest_343050.acf"

# 安装DST
cd "$STEAM_DIR" || error_exit
./steamcmd.sh +force_install_dir "$DST_DIR" +login anonymous +app_update 343050 validate +quit

cd "$HOME" || error_exit
cp steamcmd/linux32/libstdc++.so.6 dst/bin/lib32/
[ ! -L "dst/bin64/lib64/libcurl-gnutls.so.4" ] && ln -s /usr/lib64/libcurl.so.4 dst/bin64/lib64/libcurl-gnutls.so.4
[ ! -L "dst/bin/lib32/libcurl-gnutls.so.4" ] && ln -s /usr/lib/libcurl.so.4 dst/bin/lib32/libcurl-gnutls.so.4

# luajit
cd "$HOME" || error_exit
cp dmp_files/luajit/* dst/bin64/
cat >dst/bin64/dontstarve_dedicated_server_nullrenderer_x64_luajit <<-"EOF"
export LD_PRELOAD=./libpreload.so
./dontstarve_dedicated_server_nullrenderer_x64 "$@"
unset LD_PRELOAD
EOF
chmod --reference=dst/bin64/dontstarve_dedicated_server_nullrenderer_x64 dst/bin64/dontstarve_dedicated_server_nullrenderer_x64_luajit

# 清理
cd "$HOME" || error_exit
rm -f steamcmd_linux.tar.gz

# 安装完成
echo -e "==>dmp@@ 安装完成 @@dmp<=="
```

2. 再次检查系统是否支持

3. 安装对应依赖

4. 检查`screen`命令

5. 下载`steamcmd`: **耗时操作，耐心等待😘👉🤳**

6. 安装`steamcmd`

7. 安装`steam`

8. 下载饥荒联机版: **耗时操作，耐心等待😘👉🤳**

9. 安装饥荒联机版

::: tip
安装速度取决于当前的网络环境以及服务器的性能，请耐心等待
:::

::: warning
安装过程中请勿刷新页面或者重复安装
:::

如果出现安装失败，请手动执行`manual_install.sh`脚本

## 手动安装 Steamcmd
提供手动安装方便大家复制，节省重新检查和下载依赖的时间
::: warning
前提是依赖和 `scree` 已经安装完成
:::

```shell
# 手动下载 steamcmd
wget https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz
# 解压安装包
rm -rf "/root/steamcmd"  # 这里假设用户是使用 root 用户，安装目录在 steamcmd 文件夹内
mkdir -p "/root/steamcmd" # 新建文件夹
tar -zxvf steamcmd_linux.tar.gz -C "/root/steamcmd" # 解压到 /root/steamcmd 目录下
```

## 手动安装饥荒联机版
提供手动安装方便大家复制，节省重新检查和下载依赖的时间
::: warning
前提是依赖和 `scree` 已经安装完成，并且 `steamcmd` 安装同样完成安装
:::

```shell
cd "/root/steamcmd"  # 假设 steamcmd 安装目录是在 /root/steamcmd 
# 下面指定的饥荒安装目录是在 /root/dst 不要使用其他目录
./steamcmd.sh +force_install_dir "/root/dst" +login anonymous +app_update 343050 validate +quit
```
