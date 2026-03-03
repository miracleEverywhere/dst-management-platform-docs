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
方案一与方案二都以`Ubuntu`系统为例
:::

## 方案一：使用脚本修改

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


## 方案二：手动修改

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
