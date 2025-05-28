import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
    {
      text: "文档",
      icon: "laptop-code",
      prefix: "docs/",
      link: "docs/",
    },
  ],
});
