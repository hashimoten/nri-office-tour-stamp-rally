import { checkpointIds } from "../config/checkpoints";
import type { CheckpointId } from "../types";

export const POINT_PARAMETER_NAME = "point";

const checkpointIdSet = new Set<string>(checkpointIds);

export const isCheckpointId = (value: string): value is CheckpointId =>
  checkpointIdSet.has(value);

export type PointParseResult =
  | { kind: "none" }
  | { kind: "valid"; checkpointId: CheckpointId }
  | { kind: "invalid" };

export const parsePointFromSearch = (search: string): PointParseResult => {
  const params = new URLSearchParams(search);

  if (!params.has(POINT_PARAMETER_NAME)) {
    return { kind: "none" };
  }

  const point = params.get(POINT_PARAMETER_NAME);
  if (point && isCheckpointId(point)) {
    return { kind: "valid", checkpointId: point };
  }

  return { kind: "invalid" };
};

