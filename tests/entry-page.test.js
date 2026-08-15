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
      "./groups/team-a/index.html",
      "./groups/team-b/index.html",
      "./groups/team-c/index.html",
      "./groups/team-d/index.html",
      "./groups/team-e/index.html",
      "./groups/team-f/index.html",
      "./groups/team-g/index.html",
      "./groups/team-h/index.html",
      "./groups/team-i/index.html",
      "./groups/team-j/index.html",
      "./groups/team-k/index.html",
      "./groups/team-l/index.html",
      "./groups/team-m/index.html",
      "./groups/team-n/index.html",
      "./groups/team-o/index.html",
      "./groups/team-p/index.html",
      "./groups/team-q/index.html",
      "./groups/team-r/index.html",
      "./groups/team-s/index.html",
      "./groups/team-t/index.html",
      "./groups/team-u/index.html",
      "./groups/team-v/index.html",
      "./groups/team-w/index.html",
    ]);
  });

  it("PCでもスマートフォンと同じ幅と2列配置を使う", () => {
    const css = fs.readFileSync("shared/entry.css", "utf8");
    expect(css).toContain("width: min(100%, 390px)");
    expect(css).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
  });
});
