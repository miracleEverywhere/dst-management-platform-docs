---
title: 非root部署
icon: gears
order: 4
date: 2026-05-18
---

::: warning
如果你是第一次部署饥荒管理平台，作者建议按照快速上手进行操作
:::

::: info
如果你不想使用root用户进行，dmp提供以下方式，使用其他用户进行部署
下方的非root用户为`app`
:::

#### 安装依赖
请根据你当前的系统安装对应的依赖
ubuntu 依赖
```shell
dpkg --add-architecture i386
apt install -y jq screen wget curl
apt install -y lib32gcc1
apt install -y lib32gcc-s1
apt install -y libcurl4-gnutls-dev:i386
apt install -y libcurl4-gnutls-dev
```

redhat 依赖
```shell
yum install -y jq screen wget curl
yum install -y glibc.i686 libstdc++.i686 libcurl.i686
yum install -y glibc libstdc++ libcurl
ln -s /usr/lib/libcurl.so.4 /usr/lib/libcurl-gnutls.so.4
```

#### 创建run.sh脚本
复制 [快速上手-部署安装](../../quick-start/install.md) 中的脚本内容，粘贴到终端即可

#### 运行脚本并安装平台

```shell
./run.sh no-root
```

选择0，下载并启动饥荒管理平台

#### 安装steam和饥荒
粘贴下方命令至终端，安装steam和饥荒
```shell
cd "$HOME"

STEAM_DIR="$HOME/steamcmd"
DST_DIR="$HOME/dst"

wget https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz

mkdir -p "$STEAM_DIR"

tar -zxvf steamcmd_linux.tar.gz -C "$STEAM_DIR"

cd "$STEAM_DIR"

./steamcmd.sh +force_install_dir "$DST_DIR" +login anonymous +app_update 343050 validate +quit
./steamcmd.sh +force_install_dir "$DST_DIR" +login anonymous +app_update 343050 validate +quit

cd "$HOME"
cp dmp_files/luajit/* dst/bin64/
cat >dst/bin64/dontstarve_dedicated_server_nullrenderer_x64_luajit <<-"EOF"
export LD_PRELOAD=./libpreload.so
./dontstarve_dedicated_server_nullrenderer_x64 "$@"
unset LD_PRELOAD
EOF
chmod --reference=dst/bin64/dontstarve_dedicated_server_nullrenderer_x64 dst/bin64/dontstarve_dedicated_server_nullrenderer_x64_luajit

cd "$HOME"
rm -f steamcmd_linux.tar.gz
```

#### 设置开机自启(可选)

echo 8 | ./run.sh

::: info
完成上述步骤，即可打开页面进行用户注册和开服
::: 
