import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/docs/": [
    {
      text: "",
      children: ["register"],
    },
  ],
  "/project/": [
    {
      text: "",
      children: ["file", "changelog"],
    },
  ],
});