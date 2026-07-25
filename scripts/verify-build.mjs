import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(projectRoot, "dist");
const groupIds = [
  "team-a", "team-b", "team-c", "team-d", "team-e",
  "team-f", "team-g", "team-h", "team-i", "team-j",
  "team-k", "team-l", "team-m", "team-n", "team-o",
  "team-p", "team-q", "team-r", "team-s", "team-t",
];
const required = [
  "index.html",
  "manifest.webmanifest",
  "service-worker.js",
  "sw.js",
  "icons/app-icon-192.png",
  "icons/app-icon-512.png",
  ...groupIds.map(
    (groupId) => `groups/${groupId}/index.html`,
  ),
];

const missing = required.filter((relative) => !fs.existsSync(path.join(dist, relative)));
if (missing.length > 0) {
  throw new Error(`ビルド成果物が不足しています: ${missing.join(", ")}`);
}

for (const groupId of groupIds) {
  const html = fs.readFileSync(path.join(dist, "groups", groupId, "index.html"), "utf8");
  if (!html.includes('rel="stylesheet"') || !html.includes("manifest.webmanifest")) {
    throw new Error(`${groupId} のCSSまたはManifestがビルドに含まれていません`);
  }
}

const worker = fs.readFileSync(path.join(dist, "service-worker.js"), "utf8");
if (worker.includes('["./", "BUILD_PRECACHE_PLACEHOLDER"]') || worker.includes("__CACHE_VERSION__")) {
  throw new Error("Service Workerのビルド用プレースホルダーが残っています");
}

console.log("ビルド成果物を確認しました（入口、20グループ、CSS、PWA）。");
