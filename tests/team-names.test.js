import { describe, expect, it } from "vitest";

describe("家族名の表示設定", () => {
  it("HTMLを直接開く場合も入口とグループページへ表示名を反映する", async () => {
    document.body.innerHTML = `
      <a data-select-group="team-a">変更前</a>
      <p data-role="team-name">変更前</p>
    `;
    document.body.dataset.group = "team-a";

    await import("../team-names.js?team-names-test");
    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(Object.keys(window.NriTeamNames.teamNames)).toHaveLength(23);
    expect(window.NriTeamNames.getTeamName("team-a")).toBe("テスト A");
    expect(document.querySelector("[data-select-group]").textContent).toBe("テスト A");
    expect(document.querySelector("[data-role='team-name']").textContent).toBe("テスト A");
  });
});
