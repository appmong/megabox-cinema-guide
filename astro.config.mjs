// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// 승인 도메인(anywhereifyoucan.com) 하위 메가박스 서브도메인.
const SITE_URL = "https://megabox.anywhereifyoucan.com";

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/404"),
    }),
  ],
});
