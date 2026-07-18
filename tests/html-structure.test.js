import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const groups = ["team-a", "team-b", "team-c", "team-d"];

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
  });
});
