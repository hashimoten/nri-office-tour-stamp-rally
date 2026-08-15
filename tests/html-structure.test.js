import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const groups = [
  "team-a", "team-b", "team-c", "team-d", "team-e",
  "team-f", "team-g", "team-h", "team-i", "team-j",
  "team-k", "team-l", "team-m", "team-n", "team-o",
  "team-p", "team-q", "team-r", "team-s", "team-t",
  "team-u", "team-v", "team-w",
];

describe.each(groups)("%s のHTML構造", (groupId) => {
  it("共通機能に必要な固定属性と読込を持つ", () => {
    const html = fs.readFileSync(path.join("groups", groupId, "index.html"), "utf8");
    const page = new DOMParser().parseFromString(html, "text/html");
    expect(page.body.dataset.group).toBe(groupId);
    for (const role of ["progress", "stamp-list", "complete-panel", "notice"]) {
      expect(page.querySelector(`[data-role='${role}']`)).not.toBeNull();
    }
    expect(page.querySelector("[data-action='reset-stamps']")).not.toBeNull();
    expect(page.querySelector("[data-action='scan-qr']")).not.toBeNull();
    expect(
      page.querySelector("a[data-action='change-group']")?.getAttribute("href"),
    ).toBe("../../index.html?change-group=1");
    expect(page.querySelector('script[src="../../shared/app.js"]')).not.toBeNull();
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
      const image = page.querySelector(`[data-image-slot='${slotNumber}'] img`);
      expect(image).not.toBeNull();
      expect(image.getAttribute("src")).toBe(`./images/ai-image-${slotNumber}.svg`);
      expect(image.getAttribute("alt")).not.toBe("");
      expect(
        fs.existsSync(path.join("groups", groupId, "images", `ai-image-${slotNumber}.svg`)),
      ).toBe(true);
    }
  });
});

describe.each(groups)("%s の開発ルール", (groupId) => {

  it("チームフォルダ単体でも台紙を表示する基本CSSを持つ", () => {
    const css = fs.readFileSync(path.join("groups", groupId, "style.css"), "utf8");
    expect(css).toContain("box-sizing: border-box");
    expect(css).toMatch(/body\s*{[^}]*margin:\s*0;/s);
    expect(css).toContain("[hidden]");
  });
});
