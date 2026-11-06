/* Builds one self-contained HTML file for the claude.ai preview. Vercel does not use this. */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = "dist-artifact";
const html = readFileSync(join(dir, "index.html"), "utf8");
const js = html.match(/<script type="module" crossorigin src="\.\/(assets\/[^"]+\.js)"><\/script>/);
const css = html.match(/<link rel="stylesheet" crossorigin href="\.\/(assets\/[^"]+\.css)">/);
if (!js || !css) throw new Error("Could not find the built assets in index.html");
const code = readFileSync(join(dir, js[1]), "utf8").split("</script").join("<\\/script");
const styles = readFileSync(join(dir, css[1]), "utf8");
const out = [
  "<title>Keel Insurance</title>",
  '<meta name="claude:viewport-fit-sides" content="cover">',
  '<meta name="description" content="Compare commercial insurance quotes from top-rated carriers with one application.">',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Geist+Mono:wght@400;500&display=swap">',
  `<style>${styles}</style>`,
  '<div id="root"></div>',
  `<script type="module">${code}</script>`,
  "",
].join("\n");
writeFileSync(join(dir, "keel-preview.html"), out);
console.log("Wrote", join(dir, "keel-preview.html"), Math.round(out.length / 1024) + " KB");
