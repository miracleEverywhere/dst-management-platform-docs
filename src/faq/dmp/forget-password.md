---
title: 忘记密码
date: 2026-01-05
order: 4
icon: circle-question
---


::: tip
因为饥荒管理平台**不存储**用户的**明文密码**，所以只能修改密码
:::

::: warning
以下修改方式都以`Ubuntu`系统为例，选择其中的一种重置密码即可
:::

## 方式一(推荐)：使用dmp主程序修改

::: info
**v3.1.3** 引入的新功能，旧版本不支持
:::

1. 登入终端，执行以下命令进入重置密码环境

```shell
./dmp -console reset_password
```

2. 输入用户名和新密码

::: tip
输入的密码不会显示
就像你登录Linux时，输入密码也不会显示
::: 

![控制台重置密码](assets/forget-password/reset.png)

## 方式二：使用脚本修改

创建并执行下方shell脚本，请自行修改脚本中的用户名和密码

```shell title='set_password.sh'
#!/bin/bash

USERNAME="你的用户名"
PASSWORD="要把密码改成什么"

# 安装sqlite
apt install sqlite3 -y

# 生成加密后的密码
db_password=$(echo -n "$PASSWORD" | sha512sum | awk '{print $1}')

# 修改数据库
sqlite3 data/dmp.db "update users set password='$db_password' where username='$USERNAME'"

# 重启平台
echo 3 | ./run.sh
```

执行`bash set_password.sh`即可


## 方式三：手动修改

1. 登录终端，安装`sqlite`

```shell
apt install sqlite3 -y
```

2. 输入下方命令，将**所有**用户的密码修改为`123456`

```shell
cd && sqlite3 data/dmp.db "update users set password='ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413'"
```

3. 获取用户名：

```shell
cd && sqlite3 data/dmp.db "select username from users"
```

4. 使用用户名密码在饥荒管理平台登录即可

::: caution
请注意，123456是临时密码，请尽快修改为强密码
::: 
