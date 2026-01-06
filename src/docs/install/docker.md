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

也可以通过版本号进行拉取 (**推荐**)
```shell
docker pull ghcr.io/miracleeverywhere/dst-management-platform-api:v3.0.2
```

## 启动容器
::: tip
建议映射必要的目录，以保留数据，避免重复下载游戏与模组
推荐使用 `host` 网络模式，毕竟你还要映射饥荒游戏端口
:::

**文件目录说明**

- `/root/data`: 平台数据库目录
- `/root/dst`: 饥荒专用服务器
- `/root/.klei`: 游戏房间目录
- `/root/dmp_files`: 管理平台生成的一些文件，包含备份文件、LuaJIT、临时ugc模组和临时上传目录
- `/root/steamcmd`: steamcmd 目录
- `/etc/localtime:ro`: 本地时区，不要改
- `/etc/timezone:ro`: 本地时区，不要改

**容器变量说明**

- `DMP_PORT`: 平台启动端口，默认：`80`，无需额外修改
- `DMP_IN_CONTAINER`: 让平台知道自己是以容器方式启动，会影响游戏安装，无需额外修改
- `LEVEL`: 日志等级，默认`info` (debug | info | warning | error)，无需额外修改

绑定宿主机80端口，并映射一些必要的目录
```shell title="将容器内部的目录映射到/app目录下"
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
```shell title="使用host网络，并绑定8080端口"
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

## docker-compose

```yaml title="使用宿主机网络，绑定8082端口"
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
       # 让dmp知道自己是容器方式启动，会影响游戏安装
       - DMP_IN_CONTAINER=1
       # 日志等级设置为info (debug | info | warning | error)
       - LEVEL=info
    volumes:
      # dmp 数据库目录
      - /app/data:/root/data
      # 饥荒专用服务器目录
      - /app/dst:/root/dst
      # 饥荒存档目录
      - /app/klei:/root/.klei
      # dmp 文件所在目录
      - /app/dmp_files:/root/dmp_files
      # dmp 日志所在目录
      - /app/logs:/root/logs
      # steamcmd 文件目录
      - /app/steamcmd:/root/steamcmd
      # Steam 文件目录
      - /app/Steam:/root/Steam
      # 使用物理机的时区
      - /etc/localtime:/etc/localtime:ro
      - /etc/timezone:/etc/timezone:ro
```

## 更新镜像

1. 拉取最新版本的镜像

```shell
docker pull ghcr.io/miracleeverywhere/dst-management-platform-api:v3.0.3
```

2. 停止旧容器

```shell
docker rm -f dmp
```

3. 启动新版本容器

::: tip
请自行修改docker启动参数，与旧版本的启动参数保持一致
:::

```shell title="例如"
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
ghcr.io/miracleeverywhere/dst-management-platform-api:v3.0.3
```
