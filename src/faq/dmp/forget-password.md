---
title: 忘记密码
date: 2026-01-05
order: 4
icon: circle-question
---


::: tip
因为饥荒管理平台不存储用户的密码，所以只能修改密码
:::

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
