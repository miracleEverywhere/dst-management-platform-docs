import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/quick-start/": [
    {
      text: "",
      children: ["server", "install", "token", "setting"],
    },
  ],
  "/docs/": [
    {
      text: "安装部署",
      collapsible: true,
      children: ["bin-deploy", "docker-deploy"],
    },
    {
      text: "概念解释",
      link: "words-explain",
    },
    {
      text: "用户体系",
      link: "user",
    },
    {
      text: "游戏设置",
      collapsible: true,
      children: ["room", "player", "import", "mod", "system"],
    },
    {
      text: "平台工具",
      collapsible: true,
      children: ["backup", "announce", "install", "statistics", "metrics", "token"],
    },
  ],
  "/project/": [
    {
      text: "",
      children: ["web", "desktop", "docs"],
    },
  ],
});