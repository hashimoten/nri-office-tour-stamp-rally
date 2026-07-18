import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const groupIds = ["team-a", "team-b", "team-c", "team-d"];

export const normalizeBasePath = (value = "/") => {
  const leading = value.startsWith("/") ? value : `/${value}`;
  return leading.endsWith("/") ? leading : `${leading}/`;
};

const listFiles = (directory, prefix = "") =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.posix.join(prefix, entry.name);
    return entry.isDirectory()
      ? listFiles(path.join(directory, entry.name), relative)
      : [relative];
  });

const pwaFilesPlugin = (base) => ({
  name: "nri-pwa-files",
  closeBundle() {
    const outputDirectory = path.join(projectRoot, "dist");
    fs.copyFileSync(
      path.join(projectRoot, "manifest.webmanifest"),
      path.join(outputDirectory, "manifest.webmanifest"),
    );
    fs.copyFileSync(
      path.join(projectRoot, "sw.js"),
      path.join(outputDirectory, "sw.js"),
    );

    for (const htmlPath of [
      path.join(outputDirectory, "index.html"),
      ...groupIds.map((groupId) =>
        path.join(outputDirectory, "groups", groupId, "index.html"),
      ),
    ]) {
      const html = fs.readFileSync(htmlPath, "utf8");
      fs.writeFileSync(
        htmlPath,
        html.replace(
          /href="[^"]*manifest[^"]*\.webmanifest"/,
          `href="${base}manifest.webmanifest"`,
        ),
      );
    }

    const precache = listFiles(outputDirectory)
      .filter((file) => file !== "service-worker.js")
      .map((file) => `./${file}`);
    const cacheVersion = crypto
      .createHash("sha256")
      .update(JSON.stringify(precache))
      .digest("hex")
      .slice(0, 12);
    const workerTemplate = fs.readFileSync(
      path.join(projectRoot, "service-worker.js"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(outputDirectory, "service-worker.js"),
      workerTemplate
        .replace("__CACHE_VERSION__", cacheVersion)
        .replace(
          '"BUILD_PRECACHE_PLACEHOLDER"',
          JSON.stringify(precache, null, 2).slice(1, -1),
        ),
    );
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "");
  const base = normalizeBasePath(env.VITE_BASE_PATH || "/");
  const input = {
    index: path.join(projectRoot, "index.html"),
    ...Object.fromEntries(
      groupIds.map((groupId) => [
        groupId,
        path.join(projectRoot, "groups", groupId, "index.html"),
      ]),
    ),
  };

  return {
    base,
    plugins: [pwaFilesPlugin(base)],
    build: { emptyOutDir: true, rollupOptions: { input } },
    test: {
      environment: "jsdom",
      setupFiles: "./tests/setup.js",
      restoreMocks: true,
    },
  };
});
