import { describe, expect, it, vi } from "vitest";
import {
  acquireStamp,
  clearStamps,
  getStampStorageKey,
  loadStamps,
} from "../shared/storage.js";

describe("グループ別スタンプ保存", () => {
  it("グループごとにデータを分離し、片方だけをリセットする", () => {
    acquireStamp("team-a", "entrance", localStorage);
    acquireStamp("team-b", "office", localStorage);
    clearStamps("team-a", localStorage);
    expect(loadStamps("team-a", localStorage)).toEqual([]);
    expect(loadStamps("team-b", localStorage)).toHaveLength(1);
  });

  it("同じスタンプを重複保存せず取得日時を維持する", () => {
    const now = vi.fn(() => new Date("2026-07-18T01:23:45.000Z"));
    const first = acquireStamp("team-a", "entrance", localStorage, now);
    const second = acquireStamp("team-a", "entrance", localStorage, now);
    expect(first.stamp.acquiredAt).toBe("2026-07-18T01:23:45.000Z");
    expect(second.status).toBe("duplicate");
    expect(loadStamps("team-a", localStorage)).toHaveLength(1);
  });

  it("不正なpointを保存しない", () => {
    const result = acquireStamp("team-a", "unknown", localStorage);
    expect(result.status).toBe("invalid");
    expect(loadStamps("team-a", localStorage)).toEqual([]);
  });

  it("再読み込み相当の読み出しと壊れたデータを安全に扱う", () => {
    acquireStamp("team-a", "cafeteria", localStorage);
    expect(loadStamps("team-a", localStorage)[0].checkpointId).toBe("cafeteria");
    localStorage.setItem(getStampStorageKey("team-a"), "{broken");
    expect(loadStamps("team-a", localStorage)).toEqual([]);
  });
});
