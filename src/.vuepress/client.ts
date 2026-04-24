import { defineClientConfig } from "vuepress/client";

export default defineClientConfig({
  setup() {
    window.history.replaceState = () => {};
  },
});
