import { defineClientConfig } from "vuepress/client";

import EncodeUserPath from "./components/EncodeUserPath.vue";
import ReleaseList from "./components/ReleaseList.vue";

export default defineClientConfig({
  enhance({ app }) {
    app.component("EncodeUserPath", EncodeUserPath);
    app.component("ReleaseList", ReleaseList);
  },

  setup() {
    if (__VUEPRESS_SSR__) return;
    window.history.replaceState = () => {};
  },
});
