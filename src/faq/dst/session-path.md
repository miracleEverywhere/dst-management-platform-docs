---
title: 指定玩家的存档文件
date: 2026-10-08
order: 6
icon: circle-question
---

::: info
饥荒会为存档里的每个玩家创建一个文件夹，该文件夹的名字不是`科雷ID`，而是`科雷ID`编码后的结果

打开房间设置里的**用户路径编码**（对应`encode_user_path`）后，游戏使用的就是编码后的文件夹名，编码过程无法手动推算，只能用工具换算

此工具由[https://github.com/boringmj/DST-EncodeUserPath](https://github.com/boringmj/DST-EncodeUserPath)改写
:::

## 科雷ID 转文件夹名

在输入框中输入或粘贴玩家的`科雷ID`，下方会实时展示对应的文件夹名

<EncodeUserPath />

::: tip
编码结果只包含数字和大写字母，因为部分操作系统不区分大小写，而`科雷ID`是区分大小写的，编码后可以避免同名玩家的文件夹互相覆盖
:::

## 使用步骤

1. 获取玩家的`科雷ID`（形如`KU_AbCdEfGh`），可以在平台的[在线玩家](../../docs/setting/player.md#在线玩家)页面复制，也可以向玩家本人索要

2. 将`科雷ID`粘贴到上面的输入框，复制得到的文件夹名

3. 打开存档目录，找到该玩家的文件夹，路径较长，这里分成两行展示

`
.klei/DoNotStarveTogether/Cluster_{房间ID}/{世界名}/save/session/{session ID}/{编码后的文件夹名}
`

存档目录的更多说明可以查看[游戏存档](../../docs/tools/snapshot.md)页面

## 常见问题

::: info
**为什么输入后没有结果？**

编码只支持`0-9`、`A-Z`、`a-z`、`-`、`_`这些字符，如果粘贴的内容里带有空格、换行或者其他符号，输入框下方会给出提示，重新复制一遍`科雷ID`即可
:::

::: warning
房间创建完成后不建议修改**用户路径编码**配置，切换后游戏会按另一种命名规则查找玩家文件夹，可能识别不到已有的玩家数据
:::
