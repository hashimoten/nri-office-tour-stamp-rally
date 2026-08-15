import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("グループ選択ページ", () => {
  it("JavaScriptなしでも移動できる23個の通常リンクを持つ", () => {
    const page = new DOMParser().parseFromString(
      fs.readFileSync("index.html", "utf8"),
      "text/html",
    );
    const links = [...page.querySelectorAll("a[data-select-group]")];
    expect(links).toHaveLength(23);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "./groups/team-a/",
      "./groups/team-b/",
      "./groups/team-c/",
      "./groups/team-d/",
      "./groups/team-e/",
      "./groups/team-f/",
      "./groups/team-g/",
      "./groups/team-h/",
      "./groups/team-i/",
      "./groups/team-j/",
      "./groups/team-k/",
      "./groups/team-l/",
      "./groups/team-m/",
      "./groups/team-n/",
      "./groups/team-o/",
      "./groups/team-p/",
      "./groups/team-q/",
      "./groups/team-r/",
      "./groups/team-s/",
      "./groups/team-t/",
      "./groups/team-u/",
      "./groups/team-v/",
      "./groups/team-w/",
    ]);
  });
});
