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
cd ~ && wget https://github.acmsz.top/https://github.com/miracleEverywhere/dst-management-platform-api/raw/refs/heads/master/run.sh && chmod +x run.sh
```

## 配置启动脚本(可选)

使用任意文本编辑器(例如vim)打开run.sh脚本，前几行供用户自定义配置
::: caution
请注意，添加加速站点时，需要保留最后的空字符串，否则会导致脚本运行异常
:::

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

# 加速站点，最后一个加速站点为空代表从Github直接下载
# 可在 https://github.akams.cn/ 自行添加，但要保证Github(空的那个)在最后一行，不然会出现错误
GITHUB_PROXYS=(
    "https://github.acmsz.top/" # 主加速站点
    "https://ghproxy.cn/"       # 备用加速站点
    ""                          # Github
)
# --------------- ↑可修改↑ --------------- #

###########################################
#     下方变量请不要修改，否则可能会出现异常     #
###########################################

USER=$(whoami)
ExeFile="$HOME/dmp"

# 检查用户，只能使用root执行
if [[ "${USER}" != "root" ]]; then
    echo -e "\e[31m请使用root用户执行此脚本 (Please run this script as the root user) \e[0m"
    exit 1
fi

# 定义一个函数来提示用户输入
function prompt_user() {
    clear
    echo -e "\e[32m饥荒管理平台(DMP) \e[0m"
    echo -e "\e[32m--- https://github.com/miracleEverywhere/dst-management-platform-api --- \e[0m"
    echo -e "\e[33m———————————————————————————————————————————————————————————— \e[0m"
    echo -e "\e[32m[0]: 下载并启动服务(Download and start the service) \e[0m"
    echo -e "\e[33m———————————————————————————————————————————————————————————— \e[0m"
    echo -e "\e[32m[1]: 启动服务(Start the service) \e[0m"
    echo -e "\e[32m[2]: 关闭服务(Stop the service) \e[0m"
    echo -e "\e[32m[3]: 重启服务(Restart the service) \e[0m"
    echo -e "\e[33m———————————————————————————————————————————————————————————— \e[0m"
    echo -e "\e[32m[4]: 更新管理平台(Update management platform) \e[0m"
    echo -e "\e[32m[5]: 强制更新平台(Force update platform) \e[0m"
    echo -e "\e[32m[6]: 更新启动脚本(Update startup script) \e[0m"
    echo -e "\e[33m———————————————————————————————————————————————————————————— \e[0m"
    echo -e "\e[32m[7]: 设置虚拟内存(Setup swap) \e[0m"
    echo -e "\e[32m[8]: 退出脚本(Exit script) \e[0m"
    echo -e "\e[33m———————————————————————————————————————————————————————————— \e[0m"
    echo -e "\e[33m请输入选择(Please enter your selection) [0-8]:  \e[0m"
}

# 检查jq
function check_jq() {
    echo -e "\e[36m正在检查jq命令(Checking jq command) \e[0m"
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
    echo -e "\e[36m正在检查curl命令(Checking curl command) \e[0m"
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
    echo -e "\e[36m正在检查strings命令(Checking strings command) \e[0m"
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
    echo -e "\e[36m正在检查GLIBC版本(Checking GLIBC version) \e[0m"
    OS=$(grep -P "^ID=" /etc/os-release | awk -F'=' '{print($2)}' | sed "s/['\"]//g")
    if [[ ${OS} == "ubuntu" ]]; then
        if ! strings /lib/x86_64-linux-gnu/libc.so.6 | grep GLIBC_2.34 >/dev/null 2>&1; then
            apt update
            apt install -y libc6
        fi
    else
        echo -e "\e[31m非Ubuntu系统，如GLIBC小于2.34，请手动升级(For systems other than Ubuntu, if the GLIBC version is less than 2.34, please upgrade manually) \e[0m"
    fi
}

# 下载函数:下载链接,尝试次数,超时时间(s)
function download() {
    local url="$1"
    local output="$2"
    local timeout="$3"

    curl -L --connect-timeout "${timeout}" --progress-bar -o "${output}" "${url}"

    return $? # 返回 wget 的退出状态
}

# 安装主程序
function install_dmp() {
    check_jq
    check_curl
    # 原GitHub下载链接
    GITHUB_URL=$(curl -s https://api.github.com/repos/miracleEverywhere/dst-management-platform-api/releases/latest | jq -r '.assets[] | select(.name == "dmp.tgz") | .browser_download_url')

    for proxy in "${GITHUB_PROXYS[@]}"; do
        local full_url="${proxy}${GITHUB_URL}"
        if download "${full_url}" "dmp.tgz" 10; then
            echo -e "\e[32m通过${proxy}加速站点下载成功\e[0m"
            break
        else
            if [[ "${proxy}" == "" ]]; then
                echo -e "\e[31m通过Github下载失败！请手动下载\e[0m"
                exit 1
            else
                echo -e "\e[31m通过${proxy}加速站点下载失败！正在更换加速站点重试\e[0m"
            fi
        fi
    done

    tar zxvf dmp.tgz
    rm -f dmp.tgz
    chmod +x "$ExeFile"
}

# 检查进程状态
function check_dmp() {
    sleep 1
    if pgrep dmp >/dev/null; then
        echo -e "\e[32m启动成功 (Startup Success) \e[0m"
    else
        echo -e "\e[31m启动失败 (Startup Fail) \e[0m"
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
    echo -e "\e[32m关闭成功 (Shutdown Success) \e[0m"
    sleep 1
}

# 删除主程序、请求日志、运行日志、遗漏的压缩包
function clear_dmp() {
    echo -e "\e[36m正在执行清理 (Cleaning Files) \e[0m"
    rm -f dmp dmp.log dmpProcess.log
}

# 检查当前版本号
function get_current_version() {
    if [ -e "$ExeFile" ]; then
        CURRENT_VERSION=$("$ExeFile" -v | head -n1) # 获取输出的第一行作为版本号
    else
        CURRENT_VERSION="0.0.0"
    fi
}

# 获取GitHub最新版本号
function get_latest_version() {
    check_jq
    check_curl
    LATEST_VERSION=$(curl -s https://api.github.com/repos/miracleEverywhere/dst-management-platform-api/releases/latest | jq -r .tag_name | grep -oP '(\d+\.)+\d+')
    if [[ -z "$LATEST_VERSION" ]]; then
        echo -e "\e[31m无法获取最新版本号，请检查网络连接或GitHub API (Failed to fetch the latest version, please check network or GitHub API) \e[0m"
        exit 1
    fi
}

# 更新启动脚本
function update_script() {
    check_curl
    echo -e "\e[36m正在更新脚本... \e[0m"
    TEMP_FILE="/tmp/run.sh"
    SCRIPT_GITHUB="https://github.com/miracleEverywhere/dst-management-platform-api/raw/refs/heads/master/run.sh"

    for proxy in "${GITHUB_PROXYS[@]}"; do
        local full_url="${proxy}${SCRIPT_GITHUB}"
        if download "${full_url}" "${TEMP_FILE}" 10; then
            echo -e "\e[32m通过${proxy}加速站点下载成功\e[0m"
            break
        else
            if [[ "${proxy}" == "" ]]; then
                echo -e "\e[31m通过Github下载失败！请手动下载\e[0m"
                exit 1
            else
                echo -e "\e[31m通过${proxy}加速站点下载失败！正在更换加速站点重试\e[0m"
            fi
        fi
    done

    # 保存用户修改过的变量
    # 端口
    USER_PORT_STRING="PORT=${PORT}\n"
    # 数据库文件
    USER_CONFIG_DIR_STRING="CONFIG_DIR=\"${CONFIG_DIR}\"\n"
    # swap
    USER_SWAPSIZE_STRING="SWAPSIZE=${SWAPSIZE}\n"
    # 加速站点
    USER_GITHUB_PROXYS=""
    for proxy in "${GITHUB_PROXYS[@]}"; do
        USER_GITHUB_PROXYS+="    \"${proxy}\"\n"
    done
    USER_GITHUB_PROXYS_STRING="GITHUB_PROXYS=(\n${USER_GITHUB_PROXYS})\n"
    # 生成要替换的内容
    USER_FULL_CONFIG_STRING=$"# dmp暴露端口，即网页打开时所用的端口\n${USER_PORT_STRING}\n# 数据库文件所在目录，例如：./config\n${USER_CONFIG_DIR_STRING}\n# 虚拟内存大小，例如 1G 4G等\n${USER_SWAPSIZE_STRING}\n# 加速站点，最后一个加速站点为空代表从Github直接下载\n# 可在 https://github.akams.cn/ 自行添加，但要保证Github(空的那个)在最后一行，不然会出现错误\n${USER_GITHUB_PROXYS_STRING}"

    # 修改下载好的最新文件
    sed -i "8,23c\\"$'\n'"$USER_FULL_CONFIG_STRING" $TEMP_FILE

    # 替换当前脚本
    mv -f "$TEMP_FILE" "$0" && chmod +x "$0"
    echo -e "\e[32m脚本更新完成，3 秒后重新启动... \e[0m"
    sleep 3
    exec "$0"
}

# 设置虚拟内存
function set_swap() {
    SWAPFILE=/swapfile

    # 检查是否已经存在交换文件
    if [ -f $SWAPFILE ]; then
        echo -e "\e[32m交换文件已存在，跳过创建步骤 \e[0m"
    else
        echo -e "\e[36m创建交换文件... \e[0m"
        sudo fallocate -l $SWAPSIZE $SWAPFILE
        sudo chmod 600 $SWAPFILE
        sudo mkswap $SWAPFILE
        sudo swapon $SWAPFILE
        echo -e "\e[32m交换文件创建并启用成功 \e[0m"
    fi

    # 添加到 /etc/fstab 以便开机启动
    if ! grep -q "$SWAPFILE" /etc/fstab; then
        echo -e "\e[36m将交换文件添加到 /etc/fstab  \e[0m"
        echo "$SWAPFILE none swap sw 0 0" | sudo tee -a /etc/fstab
        echo -e "\e[32m交换文件已添加到开机启动 \e[0m"
    else
        echo -e "\e[32m交换文件已在 /etc/fstab 中，跳过添加步骤 \e[0m"
    fi

    # 更改swap配置并持久化
    sysctl -w vm.swappiness=20
    sysctl -w vm.min_free_kbytes=100000
    echo -e 'vm.swappiness = 20\nvm.min_free_kbytes = 100000\n' > /etc/sysctl.d/dmp_swap.conf

    echo -e "\e[32m系统swap设置成功 (System swap setting completed) \e[0m"
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
        clear_dmp
        install_dmp
        start_dmp
        check_dmp
        break
        ;;
    1)
        start_dmp
        check_dmp
        break
        ;;
    2)
        stop_dmp
        break
        ;;
    3)
        stop_dmp
        start_dmp
        check_dmp
        echo -e "\e[32m重启成功 (Restart Success) \e[0m"
        break
        ;;
    4)
        get_current_version
        get_latest_version
        if [[ "$(echo -e "$CURRENT_VERSION\n$LATEST_VERSION" | sort -V | head -n1)" == "$CURRENT_VERSION" && "$CURRENT_VERSION" != "$LATEST_VERSION" ]]; then
            echo -e "\e[33m当前版本 ($CURRENT_VERSION) 小于最新版本 ($LATEST_VERSION)，即将更新 (Updating to the latest version) \e[0m"
            stop_dmp
            clear_dmp
            install_dmp
            start_dmp
            check_dmp
            echo -e "\e[32m更新完成 (Update completed) \e[0m"
        else
            echo -e "\e[32m当前版本 ($CURRENT_VERSION) 已是最新版本 ($LATEST_VERSION)，无需更新 (No update needed) \e[0m"
        fi
        break
        ;;
    5)
        stop_dmp
        clear_dmp
        install_dmp
        start_dmp
        check_dmp
        echo -e "\e[32m强制更新完成 (Force update completed) \e[0m"
        break
        ;;
    6)
        update_script
        break
        ;;
    7)
        set_swap # 调用设置虚拟内存的函数
        break
        ;;
    8)
        exit 0
        break
        ;;
    *)
        echo -e "\e[31m请输入正确的数字 [0-8](Please enter the correct number [0-8]) \e[0m"
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

#### 修改加速节点

`GITHUB_PROXYS`是一个数组，默认含有3个元素，前两个分别是加速节点，最后一个为空字符串，表示不使用加速节点，直接通过Github进行下载

你可以在最后一个元素之前任意添加加速节点，脚本会从第一个节点尝试下载，如果下载失败则会按照顺序尝试下一个节点，如果所有节点都下载失败(包含Github)，启动脚本则会报错

::: warning
请勿删除加速节点数组的最后一个元素，即空字符串，否则会出现报错
:::

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

#### [5] 更新更新平台
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
```shell
# 以下命令会自动执行，无需手动执行
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
