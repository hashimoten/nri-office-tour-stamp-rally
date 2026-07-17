import type { CheckpointId, StampRecord } from "../types";

export type AcquireStampResult =
  | { status: "acquired"; stamps: StampRecord[]; stamp: StampRecord }
  | { status: "duplicate"; stamps: StampRecord[]; stamp: StampRecord };

export const acquireStamp = (
  stamps: readonly StampRecord[],
  checkpointId: CheckpointId,
  now: () => Date = () => new Date(),
): AcquireStampResult => {
  const existing = stamps.find((stamp) => stamp.checkpointId === checkpointId);

  if (existing) {
    return { status: "duplicate", stamps: [...stamps], stamp: existing };
  }

  const stamp: StampRecord = {
    checkpointId,
    acquiredAt: now().toISOString(),
  };

  return {
    status: "acquired",
    stamps: [...stamps, stamp],
    stamp,
  };
};

