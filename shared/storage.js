import { checkpointIds, isCheckpointId } from "./checkpoints.js";

export const ACTIVE_GROUP_KEY = "nri-office-tour-active-group-v1";
export const STAMP_STORAGE_PREFIX = "nri-office-tour-stamps-v1";

const isValidTimestamp = (value) =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));

export const getStampStorageKey = (groupId) =>
  `${STAMP_STORAGE_PREFIX}:${groupId}`;

export const normalizeStamps = (value) => {
  if (!Array.isArray(value)) return [];

  const unique = new Map();
  for (const candidate of value) {
    if (
      candidate &&
      typeof candidate === "object" &&
      isCheckpointId(candidate.checkpointId) &&
      isValidTimestamp(candidate.acquiredAt) &&
      !unique.has(candidate.checkpointId)
    ) {
      unique.set(candidate.checkpointId, {
        checkpointId: candidate.checkpointId,
        acquiredAt: candidate.acquiredAt,
      });
    }
  }

  return checkpointIds.flatMap((checkpointId) => {
    const stamp = unique.get(checkpointId);
    return stamp ? [stamp] : [];
  });
};

export const loadStamps = (groupId, storage = window.localStorage) => {
  try {
    const saved = storage.getItem(getStampStorageKey(groupId));
    return saved ? normalizeStamps(JSON.parse(saved)) : [];
  } catch {
    return [];
  }
};

export const saveStamps = (groupId, stamps, storage = window.localStorage) => {
  try {
    storage.setItem(
      getStampStorageKey(groupId),
      JSON.stringify(normalizeStamps(stamps)),
    );
    return true;
  } catch {
    return false;
  }
};

export const clearStamps = (groupId, storage = window.localStorage) => {
  try {
    storage.removeItem(getStampStorageKey(groupId));
    return true;
  } catch {
    return false;
  }
};

export const acquireStamp = (
  groupId,
  checkpointId,
  storage = window.localStorage,
  now = () => new Date(),
) => {
  const stamps = loadStamps(groupId, storage);
  if (!isCheckpointId(checkpointId)) {
    return { status: "invalid", stamps, stamp: null };
  }
  const existing = stamps.find((stamp) => stamp.checkpointId === checkpointId);
  if (existing) return { status: "duplicate", stamps, stamp: existing };

  const stamp = { checkpointId, acquiredAt: now().toISOString() };
  const nextStamps = normalizeStamps([...stamps, stamp]);
  saveStamps(groupId, nextStamps, storage);
  return { status: "acquired", stamps: nextStamps, stamp };
};
