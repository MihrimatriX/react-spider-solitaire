// @ts-nocheck — Node builtins; this file is not in the app tsconfig.
import fs from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

function seoFiles(siteUrl: string): Plugin {
  return {
    name: "seo-files",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        if (!siteUrl) return html;
        return html
          .replaceAll('content="/og-image.jpg"', `content="${siteUrl}/og-image.jpg"`)
          .replaceAll('"url": "/"', `"url": "${siteUrl}/"`)
          .replaceAll('"image": "/og-image.jpg"', `"image": "${siteUrl}/og-image.jpg"`)
          .replace(
            "</head>",
            `    <link rel="canonical" href="${siteUrl}/" />\n    <meta property="og:url" content="${siteUrl}/" />\n  </head>`,
          );
      },
    },
    closeBundle() {
      const dist = path.resolve("dist");
      if (!fs.existsSync(dist)) return;

      const robots = [
        "User-agent: *",
        "Allow: /",
        "",
        ...(siteUrl ? [`Sitemap: ${siteUrl}/sitemap.xml`, ""] : []),
      ].join("\n");
      fs.writeFileSync(path.join(dist, "robots.txt"), robots);

      if (!siteUrl) return;

      const today = new Date().toISOString().slice(0, 10);
      const urls = [
        { loc: "/", priority: "1.0", changefreq: "weekly" },
        { loc: "/game", priority: "0.8", changefreq: "monthly" },
      ]
        .map(
          ({ loc, priority, changefreq }) => `  <url>
    <loc>${siteUrl}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
        )
        .join("\n");

      fs.writeFileSync(
        path.join(dist, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = (env.VITE_SITE_URL ?? "").replace(/\/$/, "");

  return {
    plugins: [react(), seoFiles(siteUrl)],
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./tests/test/setup.ts"],
      css: true,
    },
  };
});
