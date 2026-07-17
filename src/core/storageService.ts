import { checkpointIds } from "../config/checkpoints";
import type { StampRecord } from "../types";
import { isCheckpointId } from "./pointParser";

export const STORAGE_KEY = "nri-office-tour-stamps-v1";

const isValidTimestamp = (value: unknown): value is string =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));

const isStampRecord = (value: unknown): value is StampRecord => {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;
  return (
    typeof record.checkpointId === "string" &&
    isCheckpointId(record.checkpointId) &&
    isValidTimestamp(record.acquiredAt)
  );
};

const normalizeStamps = (value: unknown): StampRecord[] => {
  if (!Array.isArray(value)) return [];

  const uniqueStamps = new Map<StampRecord["checkpointId"], StampRecord>();
  for (const candidate of value) {
    if (isStampRecord(candidate) && !uniqueStamps.has(candidate.checkpointId)) {
      uniqueStamps.set(candidate.checkpointId, {
        checkpointId: candidate.checkpointId,
        acquiredAt: candidate.acquiredAt,
      });
    }
  }

  return checkpointIds.flatMap((checkpointId) => {
    const stamp = uniqueStamps.get(checkpointId);
    return stamp ? [stamp] : [];
  });
};

export const loadStamps = (storage: Storage = window.localStorage): StampRecord[] => {
  try {
    const savedValue = storage.getItem(STORAGE_KEY);
    return savedValue ? normalizeStamps(JSON.parse(savedValue)) : [];
  } catch {
    return [];
  }
};

export const saveStamps = (
  stamps: readonly StampRecord[],
  storage: Storage = window.localStorage,
): boolean => {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(normalizeStamps(stamps)));
    return true;
  } catch {
    return false;
  }
};

export const clearStamps = (storage: Storage = window.localStorage): boolean => {
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
};

