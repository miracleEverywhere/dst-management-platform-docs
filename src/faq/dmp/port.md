---
title: 更换平台端口
date: 2026-01-04
order: 1
---

如果你是`启动脚本部署`的饥荒管理平台，其默认端口是`80/tcp`，具体修改方式如下：

打开`run.sh`脚本，找到下图中的那一行，修改后重启平台即可

![修改为8972](assets/dmp-port.png)

或者直接执行命令

```shell
sed -i 's/^PORT=.*/PORT=8972/' run.sh
```

即可修改端口为`8972`

`docker部署`的同学可查看[深度文档-安装部署-Docker部署](../docs/install/docker.md)，修改对应的启动端口即可