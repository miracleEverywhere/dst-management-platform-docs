import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  "/docs/",
  {
    text: '项目',
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
