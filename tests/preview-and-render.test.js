import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { checkpoints } from "../shared/checkpoints.js";
import { createPreviewStamps, initStampRally, renderStampRally } from "../shared/app.js";

const preparePage = () => {
  const page = new DOMParser().parseFromString(
    fs.readFileSync("groups/team-a/index.html", "utf8"),
    "text/html",
  );
  document.body.dataset.group = "team-a";
  document.body.innerHTML = page.body.innerHTML;
};

describe("プレビューモードと表示", () => {
  it("空の初期HTMLを保ったまま実際の保存状態へ更新する", () => {
    const page = new DOMParser().parseFromString(
      fs.readFileSync("groups/team-a/index.html", "utf8"),
      "text/html",
    );
    expect(page.querySelectorAll(".stamp-card--collected")).toHaveLength(0);
    const firstCard = page.querySelector(".stamp-card");
    renderStampRally({ documentRef: page, stamps: createPreviewStamps("partial") });
    expect(page.querySelector(".stamp-card")).toBe(firstCard);
    expect(page.querySelectorAll(".stamp-card--collected")).toHaveLength(2);
    expect(page.querySelectorAll(".stamp-card--uncollected")).toHaveLength(3);
    expect(page.querySelector("[data-role='progress']").textContent).toContain("2 / 5個");
  });

  it("empty・partial・completeの件数が正しい", () => {
    expect(createPreviewStamps("empty")).toHaveLength(0);
    expect(createPreviewStamps("partial")).toHaveLength(2);
    expect(createPreviewStamps("complete")).toHaveLength(5);
  });

  it("completeで全カードとコンプリート画面を表示する", () => {
    preparePage();
    renderStampRally({ documentRef: document, stamps: createPreviewStamps("complete") });
    expect(document.querySelectorAll(".stamp-card--collected")).toHaveLength(checkpoints.length);
    expect(document.querySelector("[data-role='complete-panel']").hidden).toBe(false);
    expect(document.querySelector("[data-role='progress']").textContent).toContain("5 / 5個");
  });

  it("プレビュー中はlocalStorageを変更しない", () => {
    preparePage();
    localStorage.setItem("untouched", "yes");
    const before = JSON.stringify({ ...localStorage });
    initStampRally({
      documentRef: document,
      storage: localStorage,
      locationRef: { href: "https://example.com/groups/team-a/?preview=partial", search: "?preview=partial" },
    });
    expect(JSON.stringify({ ...localStorage })).toBe(before);
    expect(document.querySelectorAll(".stamp-card--collected")).toHaveLength(2);
  });

  it("プレビュー終了後は保存済みの通常データを表示する", () => {
    preparePage();
    localStorage.setItem(
      "nri-office-tour-stamps-v1:team-a",
      JSON.stringify([{ checkpointId: "office", acquiredAt: "2026-07-18T00:00:00.000Z" }]),
    );
    initStampRally({
      documentRef: document,
      storage: localStorage,
      locationRef: { href: "https://example.com/groups/team-a/", search: "" },
    });
    expect(document.querySelectorAll(".stamp-card--collected")).toHaveLength(1);
  });
});
