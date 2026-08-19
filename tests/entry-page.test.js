import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("グループ選択ページ", () => {
  it("JavaScriptなしでも移動できる23個の通常リンクを持つ", () => {
    const page = new DOMParser().parseFromString(
      fs.readFileSync("index.html", "utf8"),
      "text/html",
    );
    const links = [...page.querySelectorAll("a[data-select-group]")];
    expect(page.querySelector('script[src="./team-names.js"]')).not.toBeNull();
    expect(links).toHaveLength(23);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "./groups/イチゴ/index.html",
      "./groups/ブドウ/index.html",
      "./groups/ミカン/index.html",
      "./groups/レモン/index.html",
      "./groups/リンゴ/index.html",
      "./groups/バナナ/index.html",
      "./groups/メロン/index.html",
      "./groups/キウイ/index.html",
      "./groups/スイカ/index.html",
      "./groups/パイン/index.html",
      "./groups/ライチ/index.html",
      "./groups/ザクロ/index.html",
      "./groups/アンズ/index.html",
      "./groups/ビワ/index.html",
      "./groups/モモ/index.html",
      "./groups/カキ/index.html",
      "./groups/ナシ/index.html",
      "./groups/ユズ/index.html",
      "./groups/イチジク/index.html",
      "./groups/マンゴー/index.html",
      "./groups/パパイヤ/index.html",
      "./groups/サクランボ/index.html",
      "./groups/ラズベリー/index.html",
    ]);
  });

  it("PCでもスマートフォンと同じ幅と2列配置を使う", () => {
    const css = fs.readFileSync("shared/entry.css", "utf8");
    expect(css).toContain("width: min(100%, 390px)");
    expect(css).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
  });
});
