---
title: 忘记密码
date: 2026-01-05
order: 4
icon: circle-question
---


平台使用 `sqlite` 数据库，要修改密码可以使用图形化工具，也可以使用 Linux 命令，图形化的方式需要在电脑安装特定的数据库管理工具，这里更推荐使用 Linux 命令来更改，操作如下

::: tip
操作需要在终端进行
:::

1. 关闭平台

2. 下载 `sqlite3`

```shell
apt install sqlite3
```

3. 更新密码

```shell title="设置所有人的密码为 123456"
cd ~/data/ && sqlite3 dmp.db <<EOF
UPDATE users SET password='ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413';
.exit
EOF
```

```shell title="设置指定用户的密码为 123456 自行修改用户名"
cd ~/data/ && sqlite3 dmp.db <<EOF
UPDATE users SET password='ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413' WHERE username='用户名';
.exit
EOF
```

4. 启动平台

::: caution
更新后的密码是弱密码 `123456`，更改后尽快登录平台修改密码💀
:::