import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import {ViteImageOptimizer} from "vite-plugin-image-optimizer";
import { viteBundler } from '@vuepress/bundler-vite'


export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "饥荒管理平台",
  description: "饥荒管理平台",

  theme,

  bundler: viteBundler({
    viteOptions: {
      plugins: [
        ViteImageOptimizer({
          logStats:true,
          png: {
            quality: 90,
            compressionLevel: 9,
          }
        })
      ]
    },
  }),

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});

