import { defineClientConfig } from "vuepress/client";

export default defineClientConfig({
  setup() {
    if (__VUEPRESS_SSR__) return;
    window.history.replaceState = () => {};
  },
});
