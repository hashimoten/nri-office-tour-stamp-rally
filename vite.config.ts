import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const normalizeBasePath = (value: string) => {
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = normalizeBasePath(env.VITE_BASE_PATH || "/");

  return {
    base,
    build: {
      emptyOutDir: true,
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "icons/app-icon-192.png",
          "icons/app-icon-512.png",
        ],
        manifest: {
          id: "./",
          name: "NRIオフィス探検",
          short_name: "NRI探検",
          description: "NRIオフィス探検スタンプラリー",
          lang: "ja",
          start_url: "./",
          scope: "./",
          display: "standalone",
          orientation: "portrait-primary",
          background_color: "#F4F7FA",
          theme_color: "#173B6C",
          icons: [
            {
              src: "icons/app-icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "icons/app-icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
          cleanupOutdatedCaches: true,
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    test: {
      environment: "jsdom",
      setupFiles: "./src/tests/setup.ts",
      css: true,
      restoreMocks: true,
    },
  };
});
