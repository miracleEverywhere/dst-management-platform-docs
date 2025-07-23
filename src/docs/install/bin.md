---
title: 启动脚本部署
icon: code
order: 1
date: 2025-06-04
---

::: important
注意，以下所有操作，均使用root用户执行
注意，以下所有操作，均使用root用户执行
注意，以下所有操作，均使用root用户执行
:::

## 下载启动脚本

1. 复制下方命令到服务器终端并执行

```shell
# 执行以下命令，下载脚本（不使用加速节点）
cd ~ && wget https://github.com/miracleEverywhere/dst-management-platform-api/raw/refs/heads/master/run.sh && chmod +x run.sh
```

如果下载失败，可以通过加速节点下载

::: tip
注意，加速节点可能会失效，如果出现无法下载的情况，前往 https://github.akams.cn 更换加速节点
:::
```shell
# 执行以下命令，下载脚本（使用加速节点）
cd && rm -f run.sh && curl -o run.sh -L $(curl -s https://api.akams.cn/github | jq -r '.data[0].url')/https://github.com/miracleEverywhere/dst-management-platform-api/raw/refs/heads/master/run.sh && chmod +x run.sh && ./run.sh
```

## 配置启动脚本(可选)

使用任意文本编辑器(例如vim)打开run.sh脚本，前几行供用户自定义配置

```shell title="run.sh" :collapsed-lines=25
#!/bin/bash

###########################################
# 用户自定义设置请修改下方变量，其他变量请不要修改 #
###########################################

# --------------- ↓可修改↓ --------------- #
# dmp暴露端口，即网页打开时所用的端口
PORT=80

# 数据库文件所在目录，例如：./config
CONFIG_DIR="./"

# 虚拟内存大小，例如 1G 4G等
SWAPSIZE=2G
# --------------- ↑可修改↑ --------------- #

###########################################
#     下方变量请不要修改，否则可能会出现异常     #
###########################################

USER=$(whoami)
ExeFile="$HOME/dmp"

cd "$HOME" || exit

function echo_red() {
    echo -e "\033[0;31m$*\033[0m"
}

function echo_green() {
    echo -e "\033[0;32m$*\033[0m"
}

function echo_yellow() {
    echo -e "\033[0;33m$*\033[0m"
}

function echo_cyan() {
    echo -e "\033[0;36m$*\033[0m"
}

# 检查用户，只能使用root执行
if [[ "${USER}" != "root" ]]; then
    echo_red "请使用root用户执行此脚本 (Please run this script as the root user)"
    exit 1
fi

# 设置全局stderr为红色并添加固定格式
function set_tty() {
    exec 2> >(while read -r line; do echo_red "[$(date +'%F %T')] [ERROR] ${line}" >&2; done)
}

# 恢复stderr颜色
function unset_tty() {
    exec 2> /dev/tty
}

# 定义一个函数来提示用户输入
function prompt_user() {
    clear
    echo_green "饥荒管理平台(DMP)"
    echo_green "--- https://github.com/miracleEverywhere/dst-management-platform-api ---"
    echo_yellow "————————————————————————————————————————————————————————————"
    echo_green "[0]: 下载并启动服务(Download and start the service)"
    echo_yellow "————————————————————————————————————————————————————————————"
    echo_green "[1]: 启动服务(Start the service)"
    echo_green "[2]: 关闭服务(Stop the service)"
    echo_green "[3]: 重启服务(Restart the service)"
    echo_yellow "————————————————————————————————————————————————————————————"
    echo_green "[4]: 更新管理平台(Update management platform)"
    echo_green "[5]: 强制更新平台(Force update platform)"
    echo_green "[6]: 更新启动脚本(Update startup script)"
    echo_yellow "————————————————————————————————————————————————————————————"
    echo_green "[7]: 设置虚拟内存(Setup swap)"
    echo_green "[8]: 退出脚本(Exit script)"
    echo_yellow "————————————————————————————————————————————————————————————"
    echo_yellow "请输入选择(Please enter your selection) [0-8]: "
}

# 检查jq
function check_jq() {
    echo_cyan "正在检查jq命令(Checking jq command)"
    if ! jq --version >/dev/null 2>&1; then
        OS=$(grep -P "^ID=" /etc/os-release | awk -F'=' '{print($2)}' | sed "s/['\"]//g")
        if [[ ${OS} == "ubuntu" ]]; then
            apt install -y jq
        else
            if grep -P "^ID_LIKE=" /etc/os-release | awk -F'=' '{print($2)}' | sed "s/['\"]//g" | grep rhel; then
                yum install -y jq
            fi
        fi
    fi
}

function check_curl() {
    echo_cyan "正在检查curl命令(Checking curl command)"
    if ! curl --version >/dev/null 2>&1; then
        OS=$(grep -P "^ID=" /etc/os-release | awk -F'=' '{print($2)}' | sed "s/['\"]//g")
        if [[ ${OS} == "ubuntu" ]]; then
            apt install -y curl
        else
            if grep -P "^ID_LIKE=" /etc/os-release | awk -F'=' '{print($2)}' | sed "s/['\"]//g" | grep rhel; then
                yum install -y curl
            fi
        fi
    fi
}

function check_strings() {
    echo_cyan "正在检查strings命令(Checking strings command)"
    if ! strings --version >/dev/null 2>&1; then
        OS=$(grep -P "^ID=" /etc/os-release | awk -F'=' '{print($2)}' | sed "s/['\"]//g")
        if [[ ${OS} == "ubuntu" ]]; then
            apt install -y binutils
        else
            if grep -P "^ID_LIKE=" /etc/os-release | awk -F'=' '{print($2)}' | sed "s/['\"]//g" | grep rhel; then
                yum install -y binutils
            fi
        fi
    fi

}

# Ubuntu检查GLIBC, rhel需要下载文件手动安装
function check_glibc() {
    check_strings
    echo_cyan "正在检查GLIBC版本(Checking GLIBC version)"
    OS=$(grep -P "^ID=" /etc/os-release | awk -F'=' '{print($2)}' | sed "s/['\"]//g")
    if [[ ${OS} == "ubuntu" ]]; then
        if ! strings /lib/x86_64-linux-gnu/libc.so.6 | grep GLIBC_2.34 >/dev/null 2>&1; then
            apt update
            apt install -y libc6
        fi
    else
        echo_red "非Ubuntu系统，如GLIBC小于2.34，请手动升级(For systems other than Ubuntu, if the GLIBC version is less than 2.34, please upgrade manually)"
    fi
}

# 下载函数:下载链接,尝试次数,超时时间(s)
function download() {
    local url="$1"
    local output="$2"
    local timeout="$3"

    unset_tty
    curl -L --connect-timeout "${timeout}" --progress-bar -o "${output}" "${url}"
    set_tty

    return $? # 返回 wget 的退出状态
}

# 安装主程序
function install_dmp() {
    check_jq
    check_curl
    # 原GitHub下载链接
    GITHUB_URL=$(curl -s https://api.github.com/repos/miracleEverywhere/dst-management-platform-api/releases/latest | jq -r '.assets[] | select(.name == "dmp.tgz") | .browser_download_url')
    # 生成加速链接
    url="$(curl -s https://api.akams.cn/github | jq -r '.data[0].url')/${GITHUB_URL}"
    if download "${url}" "dmp.tgz" 10; then
        if [ -e "dmp.tgz" ]; then
            echo_green "DMP下载成功"
        else
            echo_red "DMP下载失败"
            exit 1
        fi
    else
        echo_red "DMP下载失败"
        exit 1
    fi

    set -e
    tar zxvf dmp.tgz
    rm -f dmp.tgz
    chmod +x "$ExeFile"
    set +e
}

# 检查进程状态
function check_dmp() {
    sleep 1
    if pgrep dmp >/dev/null; then
        echo_green "启动成功 (Startup Success)"
    else
        echo_red "启动失败 (Startup Fail)"
        exit 1
    fi
}

# 启动主程序
function start_dmp() {
    check_glibc
    if [ -e "$ExeFile" ]; then
        nohup "$ExeFile" -c -l ${PORT} -s ${CONFIG_DIR} >dmp.log 2>&1 &
    else
        install_dmp
        nohup "$ExeFile" -c -l ${PORT} -s ${CONFIG_DIR} >dmp.log 2>&1 &
    fi
}

# 关闭主程序
function stop_dmp() {
    pkill -9 dmp
    echo_green "关闭成功 (Shutdown Success)"
    sleep 1
}

# 删除主程序、请求日志、运行日志、遗漏的压缩包
function clear_dmp() {
    echo_cyan "正在执行清理 (Cleaning Files)"
    rm -f dmp dmp.log dmpProcess.log
}

# 检查当前版本号
function get_current_version() {
    if [ -e "$ExeFile" ]; then
        CURRENT_VERSION=$("$ExeFile" -v | head -n1) # 获取输出的第一行作为版本号
    else
        CURRENT_VERSION="v0.0.0"
    fi
}

# 获取GitHub最新版本号
function get_latest_version() {
    check_jq
    check_curl
    LATEST_VERSION=$(curl -s https://api.github.com/repos/miracleEverywhere/dst-management-platform-api/releases/latest | jq -r .tag_name)
    if [[ -z "$LATEST_VERSION" ]]; then
        echo_red "无法获取最新版本号，请检查网络连接或GitHub API (Failed to fetch the latest version, please check network or GitHub API)"
        exit 1
    fi
}

# 更新启动脚本
function update_script() {
    check_curl
    echo_cyan "正在更新脚本..."
    TEMP_FILE="/tmp/run.sh"
    SCRIPT_GITHUB="https://github.com/miracleEverywhere/dst-management-platform-api/raw/refs/heads/master/run.sh"
    # 生成加速链接
    url="$(curl -s https://api.akams.cn/github | jq -r '.data[0].url')/${SCRIPT_GITHUB}"
    if download "${url}" "${TEMP_FILE}" 10; then
        if [ -e "${TEMP_FILE}" ]; then
            echo_green "run.sh下载成功"
        else
            echo_red "run.sh下载失败"
            exit 1
        fi
    else
        echo_red "run.sh下载失败"
        exit 1
    fi

    # 修改下载好的最新文件
    sed -i "s/^PORT=.*/PORT=${PORT}/" $TEMP_FILE
    sed -i "s/^SWAPSIZE=.*/SWAPSIZE=${SWAPSIZE}/" $TEMP_FILE
    sed -i "s#^CONFIG_DIR=.*#CONFIG_DIR=${CONFIG_DIR}#" $TEMP_FILE

    # 替换当前脚本
    mv -f "$TEMP_FILE" "$0" && chmod +x "$0"
    echo_green "脚本更新完成，3 秒后重新启动..."
    sleep 3
    exec "$0"
}

# 设置虚拟内存
function set_swap() {
    SWAPFILE=/swapfile

    # 检查是否已经存在交换文件
    if [ -f $SWAPFILE ]; then
        echo_green "交换文件已存在，跳过创建步骤"
    else
        echo_cyan "创建交换文件..."
        sudo fallocate -l $SWAPSIZE $SWAPFILE
        sudo chmod 600 $SWAPFILE
        sudo mkswap $SWAPFILE
        sudo swapon $SWAPFILE
        echo_green "交换文件创建并启用成功"
    fi

    # 添加到 /etc/fstab 以便开机启动
    if ! grep -q "$SWAPFILE" /etc/fstab; then
        echo_cyan "将交换文件添加到 /etc/fstab "
        echo "$SWAPFILE none swap sw 0 0" | sudo tee -a /etc/fstab
        echo_green "交换文件已添加到开机启动"
    else
        echo_green "交换文件已在 /etc/fstab 中，跳过添加步骤"
    fi

    # 更改swap配置并持久化
    sysctl -w vm.swappiness=20
    sysctl -w vm.min_free_kbytes=100000
    echo -e 'vm.swappiness = 20\nvm.min_free_kbytes = 100000\n' > /etc/sysctl.d/dmp_swap.conf

    echo_green "系统swap设置成功 (System swap setting completed)"
}

# 使用无限循环让用户输入命令
while true; do
    # 提示用户输入
    prompt_user
    # 读取用户输入
    read -r command
    # 使用 case 语句判断输入的命令
    case $command in
    0)
        set_tty
        clear_dmp
        install_dmp
        start_dmp
        check_dmp
        unset_tty
        break
        ;;
    1)
        set_tty
        start_dmp
        check_dmp
        unset_tty
        break
        ;;
    2)
        set_tty
        stop_dmp
        unset_tty
        break
        ;;
    3)
        set_tty
        stop_dmp
        start_dmp
        check_dmp
        echo_green "重启成功 (Restart Success)"
        unset_tty
        break
        ;;
    4)
        set_tty
        get_current_version
        get_latest_version
        if [[ "$(echo -e "$CURRENT_VERSION\n$LATEST_VERSION" | sort -V | head -n1)" == "$CURRENT_VERSION" && "$CURRENT_VERSION" != "$LATEST_VERSION" ]]; then
            echo_yellow "当前版本 ($CURRENT_VERSION) 小于最新版本 ($LATEST_VERSION)，即将更新 (Updating to the latest version)"
            stop_dmp
            clear_dmp
            install_dmp
            start_dmp
            check_dmp
            echo_green "更新完成 (Update completed)"
        else
            echo_green "当前版本 ($CURRENT_VERSION) 已是最新版本，无需更新 (No update needed)"
        fi
        unset_tty
        break
        ;;
    5)
        set_tty
        stop_dmp
        clear_dmp
        install_dmp
        start_dmp
        check_dmp
        echo_green "强制更新完成 (Force update completed)"
        unset_tty
        break
        ;;
    6)
        set_tty
        update_script
        unset_tty
        break
        ;;
    7)
        set_tty
        set_swap
        unset_tty
        break
        ;;
    8)
        exit 0
        break
        ;;
    *)
        echo_red "请输入正确的数字 [0-8](Please enter the correct number [0-8])"
        continue
        ;;
    esac
done

```

#### 修改启动端口

如果将启动端口修改为8080，即`PORT=8080`
::: warning
注意，端口号最大值为65535，如果超过最大值会导致启动失败
:::

#### 修改数据库文件路径

默认为当前目录，即`/root/`，如果修改为当前目录下的config目录，则 `CONFIG_DIR="./config"`

数据库的文件名为`DstMP.sdb`，是一个未加密的纯字符，如果不清楚运行逻辑，请勿手动修改该文件

#### 修改虚拟内存大小

默认为2G，请按需修改字段`SWAPSIZE`

## 启动脚本功能

输入 `./run.sh` 即可运行启动脚本

![启动脚本](assets/running-run-sh.png)

#### [0] 下载并启动服务
1. 脚本会自动检查使用到的系统依赖是否正确安装，如果缺失的话，会进行自动安装并给出相应的提示

2. 自动从Github下载最新版本的饥荒管理平台安装包

3. 根据定义好的端口(`PORT`变量)启动平台

4. 自动检查平台是否正常启动，并给出相应的提示

#### [1] 启动服务
1. 脚本会检测是否含有`dmp`二进制文件，如果没有的话，会执行[0]操作

2. 如果含有`dmp`二进制文件则会据定义好的端口(`PORT`变量)启动平台

3. 自动检查平台是否正常启动，并给出相应的提示

#### [2] 关闭服务
1. 脚本会关闭正在运行的饥荒管理平台

#### [3] 重启服务
1. 脚本执行[2]

2. 脚本执行[1]

#### [4] 更新管理平台
1. 脚本获取Github上饥荒管理平台的最新版本

2. 脚本获取当前运行平台的版本

3. 如果上述两步获取到的版本不一致，则会关闭正在运行的平台并给出相应的提示，清理 `dmp`，`dmp.log`，`dmpProcess.log`这三个文件

4. 下载最新版本并及启动，即[0]

#### [5] 强制更新平台
1. 脚本不检查最新版本与当前运行版本，直接执行清理、下载和启动

#### [6] 更新启动脚本
1. 下载最新版本的启动脚本到`/tmp/run.sh`

2. 如果上一步成功，则会将新下载的脚本替换当前运行的脚本

3. 运行新脚本

#### [7] 设置虚拟内存
1. 检查 `/swapfile` 文件是否存在，如果存在则跳过设置

2. 创建虚拟内存文件并启用

3. 将 虚拟内存分区写入 `/etc/fstab` 实现开机自动挂载

4. 自动设置内核参数

::: tip
以下命令会自动执行，无需手动执行
:::

```shell
sysctl -w vm.swappiness=20
sysctl -w vm.min_free_kbytes=100000
```

## 部署饥荒管理平台
执行 `run.sh`脚本并输入 `0` 即可


## 设置开机自启(与启动脚本无关)
::: caution
使用此功能会覆盖启动脚本的 [0] [1] [2] [3] 项功能，如果需要启动或关闭饥荒管理平台，请使用Linux命令行
:::

#### 创建系统服务文件
创建文件 `/usr/lib/systemd/system/dmp.service`

```ini title="/usr/lib/systemd/system/dmp.service"
[Unit]
Description=dmp.service
After=network.target
[Service]
WorkingDirectory=/root
User=root
Group=root
Type=simple
ExecStart=/root/dmp -c -l 80
TimeoutStopSec=20s
Restart=always
[Install]
WantedBy=multi-user.target
```

::: tip
上述文件第9行中的80为启动端口，请自行修改，如果还需修改数据库文件路径，则添加 `-s ./config` 参数
:::

#### 设置开机自启
::: tip
设置开机自启并立即启动： `systemctl enable --now dmp`
:::

```shell
systemctl enable dmp
```

#### 启动服务
```shell
systemctl start dmp
```

#### 关闭服务
```shell
systemctl stop dmp
```

#### 重启服务
```shell
systemctl restart dmp
```
