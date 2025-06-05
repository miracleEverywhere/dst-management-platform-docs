---
title: Docker部署
order: 2
date: 2025-06-05
---

## 镜像拉取
::: important
饥荒管理平台的镜像仓库为Github仓库，地址为`ghcr.io/miracleeverywhere`，作者并未在任何其他仓库上传，请注意甄别
:::

最新的镜像为
```shell
docker pull ghcr.io/miracleeverywhere/dst-management-platform-api:latest
```

也可以通过版本号进行拉取
```shell
docker pull ghcr.io/miracleeverywhere/dst-management-platform-api:v2.0.3
```

## 启动容器
::: tip
建议映射必要的目录，以保留数据，避免重复下载游戏与模组
:::

绑定宿主机80端口，并映射一些必要的目录
```shell
# 将容器内部的目录映射到/app目录下
docker run -itd --name dmp -p 80:80 \
-v /app/config:/root/config \
-v /app/dst:/root/dst \
-v /app/.klei:/root/.klei \
-v /app/dmp_files:/root/dmp_files \
-v /app/steamcmd:/root/steamcmd \
-v /etc/localtime:/etc/localtime:ro \
-v /etc/timezone:/etc/timezone:ro \
ghcr.io/miracleeverywhere/dst-management-platform-api:latest
```

绑定宿主机8000端口
```shell
docker run -itd --name dmp -p 8000:80 \
-v /app/config:/root/config \
-v /app/dst:/root/dst \
-v /app/.klei:/root/.klei \
-v /app/dmp_files:/root/dmp_files \
-v /app/steamcmd:/root/steamcmd \
-v /etc/localtime:/etc/localtime:ro \
-v /etc/timezone:/etc/timezone:ro \
ghcr.io/miracleeverywhere/dst-management-platform-api:latest
```

使用host网络，即宿主机网络，绑定8080端口，并把容器内目录映射到`/app`目录下
```shell
# 使用host网络，并绑定8080端口
docker run -itd --name dmp --net=host \
-e DMP_PORT=8080 \
-v /app/config:/root/config \
-v /app/dst:/root/dst \
-v /app/.klei:/root/.klei \
-v /app/dmp_files:/root/dmp_files \
-v /app/steamcmd:/root/steamcmd \
-v /etc/localtime:/etc/localtime:ro \
-v /etc/timezone:/etc/timezone:ro \
ghcr.io/miracleeverywhere/dst-management-platform-api:latest
```

使用host网络，限制CPU2个核心，内存4G

::: tip
如果限制了CPU和内存，在首页显示的**系统信息**则会相应的适配容器被限制的资源，而不会显示宿主机的资源使用百分比
:::

```shell
docker run -itd --name dmp --net=host \
-e DMP_PORT=8080 \
--cpus=2 --memory=4G \
-v /app/config:/root/config \
-v /app/dst:/root/dst \
-v /app/.klei:/root/.klei \
-v /app/dmp_files:/root/dmp_files \
-v /app/steamcmd:/root/steamcmd \
-v /etc/localtime:/etc/localtime:ro \
-v /etc/timezone:/etc/timezone:ro \
ghcr.io/miracleeverywhere/dst-management-platform-api:latest
```
::: tip
查看容器状态命令
`docker stats 容器名 --no-stream`
:::



## 更新镜像
直接拉取最新版本的镜像并重启容器即可