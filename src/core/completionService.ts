import { checkpointIds } from "../config/checkpoints";
import type { StampRecord } from "../types";

export const countCollectedStamps = (stamps: readonly StampRecord[]): number =>
  new Set(stamps.map((stamp) => stamp.checkpointId)).size;

export const isStampRallyComplete = (stamps: readonly StampRecord[]): boolean => {
  const collectedIds = new Set(stamps.map((stamp) => stamp.checkpointId));
  return checkpointIds.every((checkpointId) => collectedIds.has(checkpointId));
};

