import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(projectRoot, "dist");
const groupDirectories = [
  "イチゴ", "ブドウ", "ミカン", "レモン", "リンゴ",
  "バナナ", "メロン", "キウイ", "スイカ", "パイン",
  "ライチ", "ザクロ", "アンズ", "ビワ", "モモ",
  "カキ", "ナシ", "ユズ", "イチジク", "マンゴー",
  "パパイヤ", "サクランボ", "ラズベリー",
];
const required = [
  "index.html",
  "manifest.webmanifest",
  "service-worker.js",
  "sw.js",
  "icons/app-icon-192.png",
  "icons/app-icon-512.png",
  ...groupDirectories.map(
    (groupDirectory) => `groups/${groupDirectory}/index.html`,
  ),
];

const missing = required.filter((relative) => !fs.existsSync(path.join(dist, relative)));
if (missing.length > 0) {
  throw new Error(`ビルド成果物が不足しています: ${missing.join(", ")}`);
}

for (const groupDirectory of groupDirectories) {
  const html = fs.readFileSync(path.join(dist, "groups", groupDirectory, "index.html"), "utf8");
  if (!html.includes('rel="stylesheet"') || !html.includes("manifest.webmanifest")) {
    throw new Error(`${groupDirectory} のCSSまたはManifestがビルドに含まれていません`);
  }

  const imageSlotCount = (html.match(/data-image-slot=/g) ?? []).length;
  if (imageSlotCount !== 3) {
    throw new Error(`${groupDirectory} の画像スペースが3か所ではありません`);
  }
}

const worker = fs.readFileSync(path.join(dist, "service-worker.js"), "utf8");
if (worker.includes('["./", "BUILD_PRECACHE_PLACEHOLDER"]') || worker.includes("__CACHE_VERSION__")) {
  throw new Error("Service Workerのビルド用プレースホルダーが残っています");
}

console.log("ビルド成果物を確認しました（入口、23グループ、画像、CSS、PWA）。");
