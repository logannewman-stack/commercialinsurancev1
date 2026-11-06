import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { BRAND } from "./src/brand.js";

const escape = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/* Fills %BRAND_NAME% and %BRAND_TAGLINE% in index.html from src/brand.js. */
const brandHtml = {
  name: "brand-html",
  transformIndexHtml: (html) =>
    html.replaceAll("%BRAND_NAME%", escape(BRAND.name)).replaceAll("%BRAND_TAGLINE%", escape(BRAND.tagline.replace(/\.$/, ""))),
};

export default defineConfig({
  plugins: [react(), brandHtml],
  build: { sourcemap: false, chunkSizeWarningLimit: 700 },
});
