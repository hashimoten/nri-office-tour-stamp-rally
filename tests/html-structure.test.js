import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const groups = [
  ["team-a", "イチゴ"], ["team-b", "ブドウ"], ["team-c", "ミカン"],
  ["team-d", "レモン"], ["team-e", "リンゴ"], ["team-f", "バナナ"],
  ["team-g", "メロン"], ["team-h", "キウイ"], ["team-i", "スイカ"],
  ["team-j", "パイン"], ["team-k", "ライチ"], ["team-l", "ザクロ"],
  ["team-m", "アンズ"], ["team-n", "ビワ"], ["team-o", "モモ"],
  ["team-p", "カキ"], ["team-q", "ナシ"], ["team-r", "ユズ"],
  ["team-s", "イチジク"], ["team-t", "マンゴー"],
  ["team-u", "パパイヤ"], ["team-v", "サクランボ"],
  ["team-w", "ラズベリー"],
];

const imageSlotLabels = [
  "IMAGE 1 · 探検キャラクター",
  "IMAGE 2 · 探検アイテム",
  "IMAGE 3 · チームフラッグ",
];

const imagePromptKeywords = [
  "探検キャラクター",
  "探検バッグ",
  "チームフラッグ",
];

describe.each(groups)("%s（%s）のHTML構造", (groupId, groupDirectory) => {
  it("共通機能に必要な固定属性と読込を持つ", () => {
    const html = fs.readFileSync(path.join("groups", groupDirectory, "index.html"), "utf8");
    const page = new DOMParser().parseFromString(html, "text/html");
    expect(page.body.dataset.group).toBe(groupId);
    expect(page.querySelectorAll("[data-role='team-name']")).toHaveLength(2);
    for (const role of ["progress", "stamp-list", "complete-panel", "notice"]) {
      expect(page.querySelector(`[data-role='${role}']`)).not.toBeNull();
    }
    expect(page.querySelector("[data-action='reset-stamps']")).not.toBeNull();
    expect(page.querySelector("[data-action='scan-qr']")).not.toBeNull();
    expect(
      page.querySelector("a[data-action='change-group']")?.getAttribute("href"),
    ).toBe("../../index.html?change-group=1");
    expect(page.querySelector('script[src="../../shared/app.js"]')).not.toBeNull();
    expect(page.querySelector('script[src="../../team-names.js"]')).not.toBeNull();
    expect(page.querySelector('script[src="../../checkpoints-config.js"]')).not.toBeNull();
    expect(page.querySelector('link[href="../../shared/base.css"]')).not.toBeNull();
    expect(page.querySelector('link[href="./style.css"]')).not.toBeNull();
    expect(page.querySelector('link[rel="manifest"]')).not.toBeNull();
    expect(page.querySelector("[data-role='progress']").textContent).toContain("0 / 5個");
    expect(page.querySelectorAll(".stamp-card")).toHaveLength(5);
    expect(page.querySelectorAll(".stamp-card--collected")).toHaveLength(0);
    expect(page.querySelectorAll(".stamp-card--uncollected")).toHaveLength(5);
    expect(page.querySelectorAll(".stamp-card .stamp-imprint")).toHaveLength(5);
    expect(page.querySelectorAll(".stamp-card .stamp-imprint[hidden]")).toHaveLength(5);
    expect(page.querySelectorAll("[data-image-slot]")).toHaveLength(3);
    for (const slotNumber of ["1", "2", "3"]) {
      const slot = page.querySelector(`[data-image-slot='${slotNumber}']`);
      const image = slot.querySelector("img");
      expect(image).not.toBeNull();
      expect(image.getAttribute("src")).toBe("★ここにつくった画像をいれてみよう★");
      expect(image.getAttribute("alt")).not.toBe("");
      expect(slot.querySelector("figcaption").textContent).toBe(
        imageSlotLabels[Number(slotNumber) - 1],
      );
      expect(slot.textContent).toContain("ここに画像を入れてね！");
      expect(slot.textContent).toContain("AIにこんなふうにお願いしてみよう！");
      expect(slot.textContent).toContain(
        imagePromptKeywords[Number(slotNumber) - 1],
      );
      expect(slot.textContent).not.toContain("画像をこのフォルダに置いて");
    }
    expect(fs.existsSync(path.join("groups", groupDirectory, "images"))).toBe(false);
  });
});

describe.each(groups)("%s（%s）のCSS", (_groupId, groupDirectory) => {

  it("チームフォルダ単体でも台紙を表示する基本CSSを持つ", () => {
    const css = fs.readFileSync(path.join("groups", groupDirectory, "style.css"), "utf8");
    expect(css).toContain("box-sizing: border-box");
    expect(css).toMatch(/body\s*{[^}]*margin:\s*0;/s);
    expect(css).toContain("[hidden]");
    expect(css).toContain("width: min(100%, 390px)");
    expect(css).toContain("PCでもスマートフォンと同じ1カラム表示");
    expect(css).toMatch(/\.stamp-grid\s*{ grid-template-columns: 1fr; }/);
    expect(css).toMatch(
      /\.ai-image-frame--sheet[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/,
    );
    expect(css).toMatch(
      /\.ai-image-frame--sheet \.image-placeholder[\s\S]*aspect-ratio:\s*16 \/ 9/,
    );
  });
});
