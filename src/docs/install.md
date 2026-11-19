---
title: 安装游戏
icon: download
date: 2025-12-29
order: 10
---

进入安装游戏页面，会显示左右两部分内容

![游戏未安装](assets/install-no.webp)

左侧为当前服务器的配置信息，如CPU、内存、运行时间等信息

右侧如果未安装会提示安装

如果系统名为`ubuntu`、`Debian`、`rocky`其中的一个，即可进行安装

::: tip
推荐系统版本 `Ubuntu24`、`Rocky9`、`Debian13`
:::

如果平台检测到饥荒已经安装，则会显示重新安装和更新游戏

![游戏已安装](assets/install-yes.webp)

点击安装、重新安装或更新游戏按钮后，页面会切换到**实时日志面板**，安装脚本的输出会逐行显示出来

平台安装进行的操作：

1. 生成安装脚本

```shell  title="manual_install.sh"
#!/bin/bash

# 设置错误处理
set -e

# 定义变量
WORK_DIR=$(pwd)
STEAM_DIR="$WORK_DIR/steamcmd"
DST_DIR="$WORK_DIR/dst"

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
    apt-get update -y
    apt-get install -y screen wget
    apt-get install -y lib32gcc1 || true	# ubuntu ≤ 22
    apt-get install -y lib32gcc-s1 || true
    apt-get install -y libcurl4-gnutls-dev:i386 || error_exit
    apt-get install -y libcurl4-gnutls-dev || true
    apt-get install -y lib32stdc++6 || error_exit
}

function install_rhel() {
    yum update -y
    yum -y install glibc.i686 libstdc++.i686 libcurl.i686
    yum -y install glibc libstdc++ libcurl
    yum -y install screen wget
    ln -sf /usr/lib/libcurl.so.4 /usr/lib/libcurl-gnutls.so.4
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

# 清理并安装steamcmd
# 容器中不安装steamcmd
if [[ "${DMP_IN_CONTAINER}" != "1" ]] ;then
	cd "$WORK_DIR" || error_exit
    rm -f steamcmd_linux.tar.gz
    wget https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz
	rm -rf "$STEAM_DIR"
	mkdir -p "$STEAM_DIR"
	tar -zxvf steamcmd_linux.tar.gz -C "$STEAM_DIR"
fi

# 安装DST
cd "$STEAM_DIR" || error_exit
./steamcmd.sh +force_install_dir "$DST_DIR" +login anonymous +app_update 343050 validate +quit || true
# 第一次安装dst可能会失败
./steamcmd.sh +force_install_dir "$DST_DIR" +login anonymous +app_update 343050 validate +quit

# PR77 清理可能损坏的acf文件
rm -rf "$DST_DIR/steamapps/appmanifest_343050.acf"

# 一些必要的so文件
cd "$WORK_DIR" || error_exit
# 2026年10月09日 新版本dst不兼容steam自带的GNU Standard C++ Library
# cp steamcmd/linux32/libstdc++.so.6 dst/bin/lib32/

# 2026年11月10日 取消PR166的软连接
#if [[ "${OS}" == "ubuntu" || "${OS}" == "debian" ]]; then
#	LIBSTDCPP32=/usr/lib/i386-linux-gnu/libstdc++.so.6
#else
#	LIBSTDCPP32=/usr/lib/libstdc++.so.6
#fi
#if [[ ! -f "$LIBSTDCPP32" ]]; then
#	error_exit
#fi
#
#ln -sfn "$LIBSTDCPP32" "$DST_DIR/bin/lib32/libstdc++.so.6"
if [[ "${OS}" == "ubuntu" || "${OS}" == "debian" ]]; then
	[ ! -L "dst/bin64/lib64/libcurl-gnutls.so.4" ] && ln -sf /usr/lib/x86_64-linux-gnu/libcurl-gnutls.so.4 dst/bin64/lib64/libcurl-gnutls.so.4
	[ ! -L "dst/bin/lib32/libcurl-gnutls.so.4" ] && ln -sf /usr/lib/i386-linux-gnu/libcurl-gnutls.so.4 dst/bin/lib32/libcurl-gnutls.so.4
else
	[ ! -L "dst/bin64/lib64/libcurl-gnutls.so.4" ] && ln -sf /usr/lib64/libcurl.so.4 dst/bin64/lib64/libcurl-gnutls.so.4
	[ ! -L "dst/bin/lib32/libcurl-gnutls.so.4" ] && ln -sf /usr/lib/libcurl.so.4 dst/bin/lib32/libcurl-gnutls.so.4
fi

# luajit
cd "$WORK_DIR" || error_exit
cp dmp_files/luajit/* dst/bin64/
cat >dst/bin64/dontstarve_dedicated_server_nullrenderer_x64_luajit <<-"EOF"
export LD_PRELOAD=./libpreload.so
./dontstarve_dedicated_server_nullrenderer_x64 "$@"
unset LD_PRELOAD
EOF
chmod --reference=dst/bin64/dontstarve_dedicated_server_nullrenderer_x64 dst/bin64/dontstarve_dedicated_server_nullrenderer_x64_luajit

# 清理
cd "$WORK_DIR" || error_exit
rm -f steamcmd_linux.tar.gz

# 安装完成
echo -e "==>dmp@@ 安装完成 @@dmp<=="
```

2. 安装对应依赖

3. 检查`screen`命令与`wget`命令

4. 下载并解压`steamcmd`

5. 通过`steamcmd`下载并安装饥荒联机版: **耗时操作，耐心等待😘👉🤳**

6. 清理可能损坏的`acf`文件

7. 链接一些必要的库文件

8. 生成`LuaJIT`启动脚本

9. 清理安装文件

![游戏安装中](assets/install-ing.webp)

::: tip
安装速度取决于当前的网络环境以及服务器的性能，请耐心等待
:::

::: tip
安装和更新都交给平台在后台执行，**刷新或关闭页面不会中断**；重新打开「安装游戏」页面会自动接回实时日志
:::

::: important
如果出现安装失败，请手动执行`manual_install.sh`脚本，需要root用户(不推荐sudo)
```shell
cd && ./manual_install.sh
```
:::

## 日志与状态

页面上的日志是平台实时推送过来的，请留意以下几种情况

- **断线自动重连**：网络抖动导致日志中断时，页面会按 1s、2s、4s 的间隔自动重连（最多 3 次），并从断开的位置继续补发日志，不会重复也不会丢失
- **重新连接日志**：自动重连用尽后，页面会显示 **重新连接日志** 按钮，点击后从断点续上；日志中断不代表安装失败
- **已有任务进行中**：安装和更新同一时间只允许一个任务。若任务是由定时更新、后台更新或 [AI 诊断](./tools/ai_diagnosis.md) 的修复动作触发的，网页没有对应的日志流，此时页面会提示已有任务正在进行，并把安装、重新安装、更新游戏三个按钮禁用；任务结束后按钮会自动恢复
- **结果判定**：安装/更新的成败由脚本退出码决定，成功和失败都会弹窗提示，点击 **我知道了** 会刷新页面，游戏版本信息随之更新

安装完成后会有相应的提示

![安装完成](assets/install-completed.webp)

更新完成也会有相应的提示

![更新完成](assets/install-update-completed.webp)
