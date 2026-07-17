import { describe, expect, it } from "vitest";
import { checkpoints } from "../config/checkpoints";
import { isStampRallyComplete } from "../core/completionService";
import { acquireStamp } from "../core/stampService";
import type { StampRecord } from "../types";

describe("stampService", () => {
  it("スタンプと取得日時を追加する", () => {
    const acquiredAt = new Date("2026-07-17T01:02:03.000Z");
    const result = acquireStamp([], "entrance", () => acquiredAt);

    expect(result.status).toBe("acquired");
    expect(result.stamps).toEqual([
      {
        checkpointId: "entrance",
        acquiredAt: acquiredAt.toISOString(),
      },
    ]);
  });

  it("同じスタンプを重複して追加しない", () => {
    const original: StampRecord[] = [
      {
        checkpointId: "entrance",
        acquiredAt: "2026-07-17T01:02:03.000Z",
      },
    ];
    const result = acquireStamp(original, "entrance");

    expect(result.status).toBe("duplicate");
    expect(result.stamps).toHaveLength(1);
    expect(result.stamps).toEqual(original);
  });

  it("全チェックポイント取得を正しく判定する", () => {
    const completeStamps: StampRecord[] = checkpoints.map((checkpoint) => ({
      checkpointId: checkpoint.id,
      acquiredAt: "2026-07-17T01:02:03.000Z",
    }));

    expect(isStampRallyComplete(completeStamps)).toBe(true);
    expect(isStampRallyComplete(completeStamps.slice(0, -1))).toBe(false);
  });
});

