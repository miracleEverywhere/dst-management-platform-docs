import { defineUserConfig } from "vuepress";
import theme from "./theme.js";


export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "饥荒管理平台",
  description: "饥荒管理平台",

  theme,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});

