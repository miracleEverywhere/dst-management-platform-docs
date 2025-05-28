import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  "/quick-start/",
  "/docs/",
  {
    text: '项目详情',
    icon: 'circle-info',
    prefix: '/project/',
    children: [
      {
        text: "",
        children: ["file", "changelog"],
      },
    ]
  },
]);
