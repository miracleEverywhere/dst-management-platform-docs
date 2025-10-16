---
title: Win 11 开服
icon: fa6-brands:windows
order: 3
date: 2025-10-16
---

::: important
目前作者只测试过Windows 11，其他版本的Windows没有测试过，该功能依赖`WSL`
:::

如果你有一台Windows 11 的电脑，长期开机，并且在使用，想安装**饥荒管理平台**又不想安装Ubuntu，那么你可使用此方法安装并开服

1. 打开Windows商店，可以在开始菜单搜索

![搜索商店](assets/win11-store.png)

2. 在商店搜索`ubuntu 24`，选择**Ubuntu 24**，必须是24版本，24以下版本可能会存在依赖问题

![搜索](assets/win11-store-search.png)

3. 进入详情页面点击**获取**，即可开始安装

![安装](assets/win11-store-install.png)

4. 安装完成后，在开始菜单中找到安装好的`Ubuntu 24`，点击打开，系统会自动安装一些`WSL`所需的组件，请耐心等待

![安装必须的组件](assets/win11-dependency-install.png)

5. 安装完成后，你就拥有一个Ubuntu的子系统了，剩余操作与[启动脚本部署](bin.md)一致
