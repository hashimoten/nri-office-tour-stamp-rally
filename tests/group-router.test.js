import { describe, expect, it, vi } from "vitest";
import {
  buildGroupUrl,
  loadActiveGroup,
  saveActiveGroup,
  startGroupRouter,
} from "../shared/group-router.js";
import { ACTIVE_GROUP_KEY } from "../shared/storage.js";

describe("グループルーティング", () => {
  it("グループIDを保存して復元する", () => {
    expect(saveActiveGroup("team-a", localStorage)).toBe(true);
    expect(loadActiveGroup(localStorage)).toBe("team-a");
  });

  it("pointとGitHub Pagesのサブパスを維持する", () => {
    const target = buildGroupUrl(
      "team-b",
      "https://hashimoten.github.io/nri-office-tour-stamp-rally/?point=entrance",
    );
    expect(target.href).toBe(
      "https://hashimoten.github.io/nri-office-tour-stamp-rally/groups/team-b/?point=entrance",
    );
  });

  it("保存済みグループへ移動する", () => {
    saveActiveGroup("team-c", localStorage);
    const navigate = vi.fn();
    const result = startGroupRouter({
      documentRef: document,
      locationRef: { href: "https://example.com/app/?point=office" },
      storage: localStorage,
      navigate,
    });
    expect(result).toEqual({ redirected: true, groupId: "team-c" });
    expect(navigate.mock.calls[0][0].href).toBe(
      "https://example.com/app/groups/team-c/?point=office",
    );
  });

  it("不正な保存値を削除して選択画面を残す", () => {
    localStorage.setItem(ACTIVE_GROUP_KEY, "team-x");
    document.body.innerHTML = '<div data-role="group-list"></div>';
    const result = startGroupRouter({
      documentRef: document,
      locationRef: { href: "https://example.com/app/" },
      storage: localStorage,
      navigate: vi.fn(),
    });
    expect(result.redirected).toBe(false);
    expect(localStorage.getItem(ACTIVE_GROUP_KEY)).toBeNull();
  });
});
