---
home: true
icon: house
title: 主页
bgImage: https://theme-hope-assets.vuejs.press/bg/6-light.svg
bgImageDark: https://theme-hope-assets.vuejs.press/bg/6-dark.svg
bgImageStyle:
  background-attachment: fixed
heroText: 饥荒管理平台
tagline: 帮助你更好的管理饥荒专用服务器
actions:
  - text: 快速上手
    link: ./quick-start/
    type: primary

  - text: 前往下载
    link: https://github.com/miracleEverywhere/dst-management-platform-api/releases

highlights:
  - header: 易于安装
    image: /assets/image/box.svg
    bgImage: /assets/image/3-light.svg
    bgImageDark: /assets/image/3-dark.svg
    highlights:
      - title: 运行 <code>run.sh</code> 脚本即可一键安装和使用。
        link: docs/install.html
      - title: 支持Docker部署，多个环境互不干涉。
        link: docs/install.html

  - header: 多种功能
    image: /assets/image/features.svg
    bgImage: /assets/image/1-light.svg
    bgImageDark: /assets/image/1-dark.svg
    features:
      - title: 多房间管理
        icon: network-wired
        details: 支持多房间、多世界管理，提供清晰明了的配置选项
        link: docs/cluster.html

      - title: 日志查看
        icon: bxs:file
        details: 包含世界日志、聊天日志、请求日志、运行日志
        link: docs/log.html

      - title: 玩家信息
        icon: streamline:desktop-game-solid
        details: 可快速的查看玩家的信息，并提供一键添加管理员、白名单、黑名单
        link: docs/player.html

      - title: 用户体系
        icon: fa6-solid:user
        details: 可实现多个账号登录，不同账号拥有不同权限，由管理员统一配置
        link: docs/user.html

      - title: 自动备份
        icon: material-symbols:save
        details: 在设定的时间自动备份存档，并提供一键恢复功能
        link: docs/tool.html

      - title: 可视化配置
        icon: eva:image-fill
        details: 像游戏中一样，随心所欲的配置世界和模组
        link: docs/setting.html
        
      - title: 更多功能
        icon: ic:round-more
        details: 更多功能等你来体验
        link: https://github.com/miracleEverywhere/dst-management-platform-api

  - header: 技术栈
    description: 使用Golang和Vue开发
    image: /assets/image/advanced.svg
    bgImage: /assets/image/5-light.svg
    bgImageDark: /assets/image/5-dark.svg
    highlights:
      - title: Golang
        details: 使用 <code>1.23.1</code> 版本，标准C-S架构，采用Gin轻量级Web框架

      - title: Vue
        details: 使用<code>3.5.2</code> 版本，通过 Axios 与服务端交互，采用Element-Plus作为UI框架

      - title: 其他
        details: 使用JWT进行接口鉴权，Pinia作为前端缓存，支持多语言、明暗切换、移动端自动布局等

  - header: 饥荒管理平台App
    description: 通过使用桌面App对多个饥荒管理平台进行统一管理
    image: /assets/image/blog.svg
    bgImage: /assets/image/4-light.svg
    bgImageDark: /assets/image/4-dark.svg
    highlights:
      - title: 统一管理
        details: 多个饥荒管理平台，通过令牌的形式进行统一鉴权与管理，无需频繁切换多个网页

      - title: 耳目一新
        details: 使用Vuetify作为UI框架，提供不一样的视觉体验

copyright: false
footer: 使用 <a href="https://theme-hope.vuejs.press/zh/" target="_blank">VuePress Theme Hope</a> 主题 | MIT 协议
---

