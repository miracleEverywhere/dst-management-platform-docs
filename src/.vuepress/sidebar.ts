import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/docs/": [
    {
      text: "",
      children: ["install", "user", "cluster", "setting", "mod", "player", "tool", "log"],
    },
  ],
  "/project/": [
    {
      text: "",
      children: ["file", "changelog"],
    },
  ],
});