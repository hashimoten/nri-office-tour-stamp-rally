import { describe, expect, it } from "vitest";
import { parsePointFromSearch } from "../shared/point-parser.js";

describe("pointパラメータ", () => {
  it("正しいチェックポイントIDを返す", () => {
    expect(parsePointFromSearch("?point=meeting-room")).toEqual({
      kind: "valid",
      checkpointId: "meeting-room",
    });
  });

  it("不正なIDを無効として扱う", () => {
    expect(parsePointFromSearch("?point=unknown")).toEqual({ kind: "invalid" });
  });
});
