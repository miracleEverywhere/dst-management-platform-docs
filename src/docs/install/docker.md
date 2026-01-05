---
title: Docker部署
icon: fa6-brands:docker
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
docker pull ghcr.io/miracleeverywhere/dst-management-platform-api:v3.0.2
```

## 启动容器
::: tip
建议映射必要的目录，以保留数据，避免重复下载游戏与模组
推荐使用 `host` 网络模式，毕竟你还要映射饥荒游戏端口
:::

**目录说明**

- `/root/data`: 游戏数据库目录
- `/root/dst`: 饥荒目录
- `/root/.klei`: 游戏房间目录
- `/root/dmp_files`: 备份文件、luajit和ugc模组文件夹
- `/root/steamcmd`: steamcmd 目录
- `/etc/localtime:ro`: 本地时区，不要改
- `/etc/timezone:ro`: 本地时区，不要改

**容器变量说明**

- `DMP_PORT`: 平台启动端口，默认：`80`
- `DMP_IN_CONTAINER`: 平台监控物理机的数据
  - 设置值为 `0`

绑定宿主机80端口，并映射一些必要的目录
```shell
# 将容器内部的目录映射到/app目录下
docker run -itd \
--name dmp \
-p 80:80 \ 
-p 11000-22000:11000-22000/udp \
-v /app/data:/root/data \ 
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
-v /app/data:/root/data \
-v /app/dst:/root/dst \
-v /app/.klei:/root/.klei \
-v /app/dmp_files:/root/dmp_files \
-v /app/steamcmd:/root/steamcmd \
-v /etc/localtime:/etc/localtime:ro \
-v /etc/timezone:/etc/timezone:ro \
ghcr.io/miracleeverywhere/dst-management-platform-api:latest
```

## 项目管理
所谓项目就是 `docker-compose` 管理容器

```docker-compose
services:
  dst:
    # 镜像名称
    image: ghcr.io/miracleeverywhere/dst-management-platform-api:latest
    # 容器名称
    container_name: dmp
    # 重启规则, always 重启docker时，自动启动容器
    restart: always
    # 网络模式
    network_mode: host
    # 如果不使用 host 模式，需要开放 web 端口和世界的直联端口
    # ports:
    #   - "8082:8082"
    #   - "11000-22000:11000-22000/udp"
    environment:
       # dmp 启动端口
       - DMP_PORT=8082
       # 监控是物理机的内存和CPU使用率
       - DMP_IN_CONTAINER=0
    volumes:
      # dmp的配置文件
      - /app/data:/root/data
      # 饥荒游戏文件
      - /app/dst:/root/dst
      # 存档文件夹
      - /app/klei:/root/.klei
      # dmp 文件所在目录
      - /app/dmp_files:/root/dmp_files
      # steamcmd 文件目录
      - /app/steamcmd:/root/steamcmd
      # Steam 文件夹目录
      - /app/Steam:/root/Steam
      # 使用物理机的时区
      - /etc/localtime:/etc/localtime:ro
      - /etc/timezone:/etc/timezone:ro
```

## 更新镜像
直接拉取最新版本的镜像并重启容器即可