export const checkpoints = Object.freeze([
  Object.freeze({
    id: "entrance",
    name: "エントランス",
    icon: "🚪",
    description: "NRIオフィス探検のスタート地点",
  }),
  Object.freeze({
    id: "meeting-room",
    name: "会議室",
    icon: "💬",
    description: "アイデアを話し合う場所",
  }),
  Object.freeze({
    id: "office",
    name: "執務エリア",
    icon: "🏢",
    description: "社員のみなさんが働く場所",
  }),
  Object.freeze({
    id: "cafeteria",
    name: "カフェテリア",
    icon: "☕",
    description: "ほっとひと息つく場所",
  }),
  Object.freeze({
    id: "training-room",
    name: "研修室",
    icon: "✏️",
    description: "新しいことを学ぶ場所",
  }),
]);

export const checkpointIds = Object.freeze(
  checkpoints.map((checkpoint) => checkpoint.id),
);

const checkpointIdSet = new Set(checkpointIds);

export const isCheckpointId = (value) => checkpointIdSet.has(value);

