import { describe, expect, it } from "vitest";
import { parsePointFromSearch } from "../core/pointParser";

describe("parsePointFromSearch", () => {
  it("正しいチェックポイントIDを受け付ける", () => {
    expect(parsePointFromSearch("?point=meeting-room")).toEqual({
      kind: "valid",
      checkpointId: "meeting-room",
    });
  });

  it("不正なIDを無効として扱う", () => {
    expect(parsePointFromSearch("?point=unknown-room")).toEqual({
      kind: "invalid",
    });
  });

  it("pointパラメータがない場合は何もしない", () => {
    expect(parsePointFromSearch("?ref=event")).toEqual({ kind: "none" });
  });
});

