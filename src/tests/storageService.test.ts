import { beforeEach, describe, expect, it } from "vitest";
import {
  clearStamps,
  loadStamps,
  saveStamps,
  STORAGE_KEY,
} from "../core/storageService";
import type { StampRecord } from "../types";

describe("storageService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("保存後に再読み込みしても取得状況が残る", () => {
    const stamps: StampRecord[] = [
      {
        checkpointId: "office",
        acquiredAt: "2026-07-17T03:04:05.000Z",
      },
    ];

    expect(saveStamps(stamps)).toBe(true);
    expect(loadStamps()).toEqual(stamps);
  });

  it("壊れたlocalStorageデータでもクラッシュしない", () => {
    localStorage.setItem(STORAGE_KEY, "{broken-json");
    expect(() => loadStamps()).not.toThrow();
    expect(loadStamps()).toEqual([]);
  });

  it("不正な項目と重複項目を安全に取り除く", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { checkpointId: "entrance", acquiredAt: "2026-07-17T00:00:00.000Z" },
        { checkpointId: "entrance", acquiredAt: "2026-07-18T00:00:00.000Z" },
        { checkpointId: "invalid", acquiredAt: "2026-07-17T00:00:00.000Z" },
        { checkpointId: "office", acquiredAt: "not-a-date" },
      ]),
    );

    expect(loadStamps()).toEqual([
      { checkpointId: "entrance", acquiredAt: "2026-07-17T00:00:00.000Z" },
    ]);
  });

  it("リセットですべての取得状況を削除する", () => {
    saveStamps([
      {
        checkpointId: "cafeteria",
        acquiredAt: "2026-07-17T03:04:05.000Z",
      },
    ]);

    expect(clearStamps()).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(loadStamps()).toEqual([]);
  });
});

