import { describe, expect, it, vi } from "vitest";
import {
  buildGroupUrl,
  clearActiveGroup,
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

  it("保存済みグループだけを解除する", () => {
    saveActiveGroup("team-a", localStorage);
    localStorage.setItem("nri-office-tour-stamps-v1:team-a", '[{"checkpointId":"entrance"}]');
    expect(clearActiveGroup(localStorage)).toBe(true);
    expect(loadActiveGroup(localStorage)).toBeNull();
    expect(localStorage.getItem("nri-office-tour-stamps-v1:team-a")).not.toBeNull();
  });

  it("pointとGitHub Pagesのサブパスを維持する", () => {
    const target = buildGroupUrl(
      "team-b",
      "https://hashimoten.github.io/nri-office-tour-stamp-rally/?point=entrance",
    );
    expect(target.href).toBe(
      "https://hashimoten.github.io/nri-office-tour-stamp-rally/groups/%E3%83%96%E3%83%89%E3%82%A6/?point=entrance",
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
      "https://example.com/app/groups/%E3%83%9F%E3%82%AB%E3%83%B3/?point=office",
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

  it("change-group=1で自動移動せず選択画面を表示する", () => {
    saveActiveGroup("team-d", localStorage);
    const navigate = vi.fn();
    const result = startGroupRouter({
      documentRef: document,
      locationRef: { href: "https://example.com/app/?change-group=1" },
      storage: localStorage,
      navigate,
    });
    expect(result).toEqual({ redirected: false, groupId: null });
    expect(loadActiveGroup(localStorage)).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("選択リンクからグループを保存して移動する", () => {
    document.body.innerHTML = `
      <div data-role="group-list">
        <a href="./groups/ブドウ/" data-select-group="team-b">ブドウ</a>
      </div>`;
    const navigate = vi.fn();
    startGroupRouter({
      documentRef: document,
      locationRef: { href: "https://example.com/app/" },
      storage: localStorage,
      navigate,
    });
    document.querySelector("[data-select-group='team-b']").click();
    expect(loadActiveGroup(localStorage)).toBe("team-b");
    expect(navigate.mock.calls[0][0].href).toBe(
      "https://example.com/app/groups/%E3%83%96%E3%83%89%E3%82%A6/",
    );
  });
});
