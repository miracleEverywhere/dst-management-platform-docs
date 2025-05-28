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