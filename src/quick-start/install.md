---
title: 部署安装
order: 2
icon: download
date: 2025-12-26
---

::: important
**自动安装**和**手动安装**选择其中一种就行，可以先使用自动安装，如果出现任何下载失败的情况，再使用手动安装

两者都失败的话，可加群获取群文件，进行**离线安装**
:::

## 自动安装
### 下载启动脚本
打开上一节的终端页面，输入下方代码下载run.sh启动脚本

::: tip
感谢[akams.cn](https://akams.cn)社区无私奉献
:::

```shell
# 执行以下命令，下载脚本（使用加速节点）需要使用jq命令
cd && rm -f run.sh && curl -o run.sh -L $(curl -s https://api.akams.cn/github | jq -r '.data[0].url')/https://raw.githubusercontent.com/miracleEverywhere/dst-management-platform-api/master/run.sh && chmod +x run.sh && ./run.sh
```

::: warning
如果提示缺少`jq`命令，ubuntu系统请执行`apt install -y jq`进行安装
:::

<br>

---

<br>

::: caution
如果上方命令下载成功，请进入下一小节：**运行脚本**

如果出现下载异常，也可以手动创建 `run.sh` 脚本，将甲方代码复制粘贴到终端即可
:::

```shell title="手动创建run.sh" :collapsed-lines=10
cat > run.sh << 'EOF'
#!/bin/bash

###########################################
# 用户自定义设置请修改下方变量，其他变量请不要修改 #
###########################################

# --------------- ↓可修改↓ --------------- #
# dmp暴露端口，即网页打开时所用的端口
PORT=80

# 数据库文件所在目录，例如：./config
CONFIG_DIR="./data"

# 虚拟内存大小，例如 1G 4G等
SWAPSIZE=2G

# 日志等级，例如：debug info warn error
LEVEL="info"

# 加速节点
ACCELERATION_SITE=(
	"gh.llkk.cc"
	"github.dpik.top"
	"ghfast.top"
)
# --------------- ↑可修改↑ --------------- #

###########################################
#     下方变量请不要修改，否则可能会出现异常     #
###########################################

USER=$(whoami)
ExeFile="$HOME/dmp"

DMP_GITHUB_HOME_URL="https://github.com/miracleEverywhere/dst-management-platform-api"
DMP_GITHUB_API_URL="https://api.github.com/repos/miracleEverywhere/dst-management-platform-api/releases/latest"
SCRIPT_GITHUB="https://raw.githubusercontent.com/miracleEverywhere/dst-management-platform-api/master/run.sh"
DMP_HOME="https://miraclesses.top/"

ACCELERATED_URL=""

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

function echo_red_blink() {
	echo -e "\033[5;31m$*\033[0m"
}

# 检查用户，只能使用root执行
if [[ "${USER}" != "root" ]]; then
	echo_red "请使用root用户执行此脚本"
	exit 1
fi

# 设置全局stderr为红色并添加固定格式
function set_tty() {
	exec 2> >(while read -r line; do echo_red "[$(date +'%F %T')] [ERROR] ${line}" >&2; done)
}

# 恢复stderr颜色
function unset_tty() {
	exec 2>/dev/tty
}

# 定义一个函数来提示用户输入
function prompt_user() {
	clear
	echo_green "饥荒管理平台(DMP)"
	echo_green "--- ${DMP_GITHUB_HOME_URL} ---"
	if [[ $(echo "${DMP_GITHUB_HOME_URL}" | tr '/' '\n' | grep -vc "^$") != "4" ]] ||
		[[ $(echo "${DMP_GITHUB_API_URL}" | tr '/' '\n' | grep -vc "^$") != "7" ]] ||
		[[ $(echo "${SCRIPT_GITHUB}" | tr '/' '\n' | grep -vc "^$") != "6" ]]; then
		echo_red_blink "饥荒管理平台 run.sh 脚本可能被加速站点篡改，请切换加速站点重新下载"
		echo_cyan $DMP_HOME
		echo_green "如有疑问，请查阅帮助文档"
	fi
	echo_yellow "————————————————————————————————————————————————————————————"
	echo_green "[0]: 下载并启动饥荒管理平台"
	echo_yellow "————————————————————————————————————————————————————————————"
	echo_green "[1]: 启动饥荒管理平台"
	echo_green "[2]: 关闭饥荒管理平台"
	echo_green "[3]: 重启饥荒管理平台"
	echo_yellow "————————————————————————————————————————————————————————————"
	echo_green "[4]: 更新饥荒管理平台"
	echo_green "[5]: 强制更新饥荒管理平台"
	echo_green "[6]: 更新run.sh启动脚本"
	echo_yellow "————————————————————————————————————————————————————————————"
	echo_green "[7]: 设置虚拟内存"
	echo_green "[8]: 设置开机自启"
	echo_green "[9]: 退出脚本"
	echo_yellow "————————————————————————————————————————————————————————————"
	echo_yellow "请输入要执行的操作 [0-9]: "
}

# 加速节点选择
function generate_acceleration() {
	local origin_url="$1"
	# 输出加速节点让用户选择
	echo_cyan "饥荒管理平台部署在Github, 请选择一个加速节点进行加速:"
	for i in "${!ACCELERATION_SITE[@]}"; do
		echo_green "$((i + 1)). ${ACCELERATION_SITE[i]}"
	done
	acc_site_len=${#ACCELERATION_SITE[@]}
	echo_green "$((acc_site_len + 1)). 不使用加速节点直接下载"

	# 获取用户输入
	read -r -p "请输入选择 (1-$((acc_site_len + 1))): " selected_mirror

	# 输入验证和处理
	while true; do
		# 如果输入为空，使用默认值
		if [[ -z "$selected_mirror" ]]; then
			selected_mirror=1
			break
		fi
		# 验证是否为数字
		if [[ ! "$selected_mirror" =~ ^[0-9]+$ ]]; then
			echo_yellow "输入无效，请输入数字 (1-$((acc_site_len + 1)))"
			read -r -p "请重新输入: " selected_mirror
			continue
		fi
		# 验证范围
		if ((selected_mirror < 1 || selected_mirror > acc_site_len + 1)); then
			echo_yellow "选择超出范围，请输入 1 到 $((acc_site_len + 1)) 之间的数字"
			read -r -p "请重新输入: " selected_mirror
			continue
		fi
		break
	done

	# 根据选择设置URL
	if ((selected_mirror >= 1 && selected_mirror <= acc_site_len)); then
		index=$((selected_mirror - 1))
		ACCELERATED_URL="https://${ACCELERATION_SITE[index]}/${origin_url}"
		echo_green "已选择加速节点 ${selected_mirror}: ${ACCELERATION_SITE[index]}"
	elif ((selected_mirror == acc_site_len + 1)); then
		ACCELERATED_URL="${origin_url}"
		echo_green "已选择直接下载"
	fi
}

# 检查jq
function check_jq() {
	echo_cyan "正在检查jq命令"
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
	echo_cyan "正在检查curl命令"
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
	echo_cyan "正在检查strings命令"
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
	echo_cyan "正在检查GLIBC版本"
	OS=$(grep -P "^ID=" /etc/os-release | awk -F'=' '{print($2)}' | sed "s/['\"]//g")
	if [[ ${OS} == "ubuntu" ]]; then
		if ! strings /lib/x86_64-linux-gnu/libc.so.6 | grep GLIBC_2.34 >/dev/null 2>&1; then
			apt update
			apt install -y libc6
		fi
	else
		echo_red "非Ubuntu系统，如GLIBC小于2.34，请手动升级"
	fi
}

# 下载函数:下载链接,尝试次数,超时时间(s)
function download() {
	# 显示详细进度
	local url="$1"
	local output="$2"
	local timeout="$3"
	curl -L --connect-timeout "${timeout}" --progress-bar -o "${output}" "${url}" 2>&1

	local curl_exit_code=$?

	if [ $curl_exit_code -eq 0 ]; then
		echo_green "下载完成: $output"
	else
		echo_red "下载失败 (退出码: $curl_exit_code)"
	fi

	return $curl_exit_code
}

# 安装主程序
function install_dmp() {
	check_jq
	check_curl

	# 获取GITHUB最新releases地址
	echo_cyan "正在获取下载信息"
	if ! github_url=$(curl -s -L ${DMP_GITHUB_API_URL} | jq -r '.assets[] | select(.name == "dmp.tgz") | .browser_download_url'); then
		echo_red "获取最新版本信息失败，请检查网络连接"
		exit 1
	fi

	# sha256 digest
	echo_cyan "正在获取验证信息"
	if ! github_digest=$(curl -s -L ${DMP_GITHUB_API_URL} | jq -r '.assets[] | select(.name == "dmp.tgz") | .digest' | awk -F':' '{print $2}'); then
		echo_red "获取最新版本信息失败，请检查网络连接"
		exit 1
	fi

	generate_acceleration "${github_url}"
	url=$ACCELERATED_URL

	# 开始下载
	echo_cyan "正在从${url}进行下载"
	if download "${url}" "dmp.tgz" 10; then
		# 验证 SHA-256
		file_digest=$(sha256sum dmp.tgz | awk '{print $1}')
		if [[ "$github_digest" != "$file_digest" ]]; then
			echo_red "DMP下载失败"
			exit 1
		fi
	else
		echo_red "DMP下载失败"
		exit 1
	fi

	set -e
	tar zxvf dmp.tgz >/dev/null
	rm -f dmp.tgz
	chmod +x "$ExeFile"
	set +e
}

# 检查进程状态
function check_dmp() {
	sleep 1
	if pgrep dmp >/dev/null; then
		echo_green "启动成功"
	else
		echo_red "启动失败"
		exit 1
	fi
}

# 启动主程序
function start_dmp() {
	# 检查端口是否被占用,如果被占用则退出
	port=$(ss -ltnp | awk -v port=${PORT} '$4 ~ ":"port"$" {print $4}')

	if [ -n "$port" ]; then
		echo_red "端口 $PORT 已被占用: $port", 修改 run.sh 中的 PORT 变量后重新运行
		exit 1
	fi

	check_glibc

	if [ -e "$ExeFile" ]; then
		nohup "$ExeFile" -bind ${PORT} -dbpath ${CONFIG_DIR} -level ${LEVEL} >/dev/null 2>&1 &
	else
		install_dmp
		nohup "$ExeFile" -bind ${PORT} -dbpath ${CONFIG_DIR} -level ${LEVEL} >/dev/null 2>&1 &
	fi
}

# 关闭主程序
function stop_dmp() {
	pkill -9 dmp
	echo_green "关闭成功"
	sleep 1
}

# 删除主程序、请求日志、运行日志、遗漏的压缩包
function clear_dmp() {
	echo_cyan "正在执行清理"
	rm -f dmp dmp.tgz logs/*
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
	LATEST_VERSION=$(curl -s -L ${DMP_GITHUB_API_URL} | jq -r .tag_name)
	if [[ -z "$LATEST_VERSION" ]]; then
		echo_red "无法获取最新版本号，请检查网络连接或GitHub API"
		exit 1
	fi
}

# 更新启动脚本
function update_script() {
	check_curl

	# 生成加速链接
	generate_acceleration "${SCRIPT_GITHUB}"
	url=$ACCELERATED_URL

	TEMP_FILE="/tmp/run.sh"

	echo_cyan "正在从${url}进行下载"

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
	sed -i "s#^LEVEL=.*#LEVEL=${LEVEL}#" $TEMP_FILE

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
	echo -e 'vm.swappiness = 20\nvm.min_free_kbytes = 100000\n' >/etc/sysctl.d/dmp_swap.conf

	echo_green "系统swap设置成功"
}

# 设置开机自启
function auto_start_dmp() {
	CRON_JOB="@reboot /bin/bash -c 'source /etc/profile && cd /root && echo 1 | /root/run.sh'"

	# 检查 crontab 中是否已存在该命令
	if crontab -l 2>/dev/null | grep -Fq "$CRON_JOB"; then
		echo_yellow "已发现开机自启配置，请勿重复添加"
	else
		# 如果不存在，则添加到 crontab
		(
			crontab -l 2>/dev/null
			echo "$CRON_JOB"
		) | crontab -
		echo_green "已成功设置开机自启"
	fi
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
		echo_green "重启成功"
		unset_tty
		break
		;;
	4)
		set_tty
		get_current_version
		get_latest_version
		if [[ "$(echo -e "$CURRENT_VERSION\n$LATEST_VERSION" | sort -V | head -n1)" == "$CURRENT_VERSION" && "$CURRENT_VERSION" != "$LATEST_VERSION" ]]; then
			echo_yellow "当前版本 ($CURRENT_VERSION) 小于最新版本 ($LATEST_VERSION)，即将更新"
			stop_dmp
			clear_dmp
			install_dmp
			start_dmp
			check_dmp
			echo_green "更新完成"
		else
			echo_green "当前版本 ($CURRENT_VERSION) 已是最新版本，无需更新"
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
		echo_green "强制更新完成"
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
		set_tty
		auto_start_dmp
		unset_tty
		break
		;;
	9)
		exit 0
		;;
	*)
		echo_red "请输入正确的数字 [0-9]"
		continue
		;;
	esac
done
EOF

chmod +x run.sh
./run.sh
```

### 运行脚本
执行成功后输入0，即可完成安装

![下载并安装](./assets/install/run-sh-0.png)

::: tip
如果出现上图中的启动成功字样，就代表已经安装成功了，可以进入下一节；
如果出现网络错误，请根据下方手动安装教程进行安装
:::

## 手动安装

::: info
因为饥荒管理平台源码及安装包都在Github上，如未进行Github加速可能会导致安装失败。因此，下面的教程不使用`run.sh`脚本的自动化能力，保证顺利安装。
:::

### 下载run.sh脚本
<code>run.sh</code> 脚本保存在Github上，直接下载有概率会失败，因此需要加速
##### 获取加速链接
1. 首先打开 [github.akams.cn](https://github.akams.cn) 加速站点，<strong>感谢社区无私奉献</strong>

2. 需要等待网页完全加载完毕，即网页标签页不再显示旋转的加载图标，以及下图中的红框出现网站

![加速站点](./assets/install/akams.png)

3. `https://raw.githubusercontent.com/miracleEverywhere/dst-management-platform-api/master/run.sh` 将下方网址复制到加速站点的输入框中

```text
https://raw.githubusercontent.com/miracleEverywhere/dst-management-platform-api/master/run.sh
```

4. 选择 Wget & Curl 后，点击第一个复制

![run.sh加速](./assets/install/runshproxy.png)

##### 开始下载
1. 将复制的命令输入上一节打开的终端中，并按回车键执行

2. 并为下载好的`run.sh`添加执行权限：`chmod +x run.sh`

![run.sh下载](./assets/install/runshdownload.png)

##### 开启SWAP
::: tip
饥荒专用服务器比较吃内存，所以需要开启SWAP(虚拟内存)，以避免服务器卡死。
:::

1. 输入 `./run.sh` 运行脚本

2. 输入 `7` 即可

![设置SWAP](./assets/install/swap.png)

### 部署饥荒管理平台
##### 获取最新版本
1. 在浏览器中打开这个页面：[获取饥荒管理平台最新版本](https://api.github.com/repos/miracleEverywhere/dst-management-platform-api/releases/latest)

2. 打开后输入 ctrl+f(MacOS为 command+f) 打开页面搜索，输入`browser_download_url`

![获取最新版本](./assets/install/latestdmp.png)

##### 获取加速链接
1. 会出先两个结果，我们找到以 `dmp.tgz` 结尾的那个链接，复制下来

2. 回到加速站点，将复制的链接粘贴进输入框，并点击第一个复制

![获取加速链接](./assets/install/dmpproxy.png)

##### 下载并启动
1. 将复制好的命令粘贴到终端，按回车键运行

![执行下载](./assets/install/downloaddmp.png)

2. 输入命令解压下载好的压缩包：`tar zxvf dmp.tgz`，解压完成后输入：`./run.sh` 并输入：`1` 启动饥荒管理平台

![解压并启动](./assets/install/startup.png)

到目前为止，饥荒管理平台就算部署成功，下一节我们将进行令牌申请