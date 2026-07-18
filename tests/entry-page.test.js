import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("グループ選択ページ", () => {
  it("JavaScriptなしでも移動できる4つの通常リンクを持つ", () => {
    const page = new DOMParser().parseFromString(
      fs.readFileSync("index.html", "utf8"),
      "text/html",
    );
    const links = [...page.querySelectorAll("a[data-select-group]")];
    expect(links).toHaveLength(4);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "./groups/team-a/",
      "./groups/team-b/",
      "./groups/team-c/",
      "./groups/team-d/",
    ]);
  });
});
