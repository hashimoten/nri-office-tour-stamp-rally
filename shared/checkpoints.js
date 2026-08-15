import "../checkpoints-config.js";

export const checkpoints = globalThis.NriCheckpointConfig.checkpoints;

export const checkpointIds = Object.freeze(
  checkpoints.map((checkpoint) => checkpoint.id),
);

const checkpointIdSet = new Set(checkpointIds);

export const isCheckpointId = (value) => checkpointIdSet.has(value);

