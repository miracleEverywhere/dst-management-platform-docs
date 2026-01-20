---
title: 目录介绍
icon: folder-open
date: 2026-01-20
order: 11
---

::: info
饥荒管理平台会生成一些特定的目录，不同的目录有着不同的作用，有需要的同学可以查阅此页
:::

::: tip
路径有**相对路径**和**绝对路径**，相对路径可以根据`工作目录`的路径变化而变化，而绝对路径不允许更改
:::

## 平台目录

饥荒管理平台的目录创建与使用均为相对路径，看过代码的同学可以任意的修改目录的路径，或者创建软连接等

::: info
下面我就以`/root`作为`工作目录`进行讲解
:::

#### 主目录

即`dmp`文件所在的路径，默认为`/root`即`工作目录`

该目录通过一些特殊的手段进行修改，使用`/root`主要是为了自动化的安装一些依赖，需要root权限

如果你会手动安装对应的依赖、steam、饥荒，你可以将`工作目录`变更至任意目录

例如`/app/dmp-install`

::: caution
如果使用了其他工作目录，请确保饥荒游戏路径与dmp文件在同一目录下

如上面里例子：
`/app/dmp-install/dmp`
`/app/dmp-install/dst`
:::

::: tip
该目录为相对路径
:::

#### 数据库

可通过修改`run.sh`文件中的`CONFIG_DIR`字段修改

默认为`/root/data`

该目录存放dmp的数据库文件

::: tip
该目录为相对路径
:::

#### 日志

默认为`/root/logs`

该目录存放dmp产生的日志文件，包含运行日志和请求日志，分别为`runtime.log`和`access.log`

该目录会在平台启动时自动创建

::: tip
该目录为相对路径
:::

#### 平台工具目录

默认为`/root/dmp_files`

- 存档备份，对应的路径为：`dmp_files/backup/{房间ID}`

- luajit依赖文件，对应的路径为：`dmp_files/luajit`

- ugc模组，临时目录，对应路径为：`dmp_files/mods/ugc/`，该目录会在游戏启动时删除

- 存档上传，临时目录，对应路径为：`dmp_files/upload/{上传时的时间戳}/`，该目录会在存档上传完成后删除

::: tip
该目录为相对路径
:::

## 饥荒目录

#### steamcmd

用于安装饥荒游戏、饥荒模组等

默认为`/root/steamcmd`

::: tip
该目录为相对路径
:::

#### Steam

安装好的Steam

默认为`/root/Steam`

::: tip
该目录为相对路径
:::

#### dst

饥荒游戏目录

默认为`/root/dst`

- ugc模组路径：`/dst/ugc_mods/Cluster_{房间ID}`，大部分饥荒模组都会保存在这里，游戏启动时会读取该目录下的模组信息，每个世界都会自动下载一份，如果该目录出现模组缺失，则会导致游戏中模组缺失
- 非ugc模组路径：`/dst/mods`，该目录的模组为所有房间公用，你可以上传模组到该目录，并修改模组目录名为`workshop-模组ID`格式
- bin：`/dst/bin`，32位游戏
- bin64：`/dst/bin64`，64位游戏与luajit

::: tip
该目录为相对路径
:::

#### .klei

饥荒游戏配置目录

默认为：`/root/.klei/DoNotStarveTogether/Cluster_{房间ID}`

- cluster.ini：房间设置，包含房间名，密码，最大玩家数等配置
- cluster_token.txt：饥荒令牌
- adminlist.txt：饥荒游戏管理员
- blocklist.txt：饥荒游戏黑名单
- whitelist.txt：饥荒游戏预留位
- Master：主世界，`/root/.klei/DoNotStarveTogether/Cluster_{房间ID}/Master`
  - leveldataoverride.lua：世界规则、世界生成设置
  - modoverrides.lua：模组设置
  - server.ini：世界的一些端口等配置
- Caves：从世界
    - leveldataoverride.lua：世界规则、世界生成设置
    - modoverrides.lua：模组设置
    - server.ini：世界的一些端口等配置

::: tip
该路径为绝对路径，更正确的写法为：`$HOME/.klei/DoNotStarveTogether/Cluster_{房间ID}`

如果你用`miracle`用户启动饥荒，则该目录为`/home/miracle/.klei/DoNotStarveTogether/Cluster_{房间ID}`

如果你用`root`用户启动饥荒，则该目录为`/root/.klei/DoNotStarveTogether/Cluster_{房间ID}`
:::

## 合理操作

#### 软连接

- `dst`目录包含游戏和所有房间的模组(科雷官方定的，跟dmp没关系)，随着时间的推移，会变的越来越大(你房间很多的话)

- `dmp_files`目录中保存着房间备份，也会越来越大(房间多、没有备份清理)

- `.klei`目录包含游戏配置和游戏存档，也会越来越大(房间多、游戏天数长、游戏玩家多)

上述三个目录会变的很大，你可以创建软链接，讲这些目录转移到其他地方

1. 关闭平台

```shell
./run.sh
# 输入2关闭
```

2. 移动目录(以`dst`为例，移动到`/app`目录下)

```shell
mv dst /app
```

3. 创建软连接

```shell
ln -s /app/dst dst
```

4. 启动平台

```shell
./run.sh
# 输入1启动
```

#### 不用root

以`app`用户为例

1. 使用`sudo`或`root`安装依赖
2. 切换至`app`用户
3. 修改`run.sh`文件，注释或删除以下内容
```shell
# 检查用户，只能使用root执行
if [[ "${USER}" != "root" ]]; then
	echo_red "请使用root用户执行此脚本"
	exit 1
fi
```
4. 启动平台
