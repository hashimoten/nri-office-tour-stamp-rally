import type { Checkpoint, CheckpointId } from "../types";

/**
 * 名前・アイコン・説明は実際の会場に合わせて変更できます。
 * id はQRコードと保存データに使うため変更しないでください。
 */
export const checkpoints: readonly Checkpoint[] = [
  {
    id: "entrance",
    name: "エントランス",
    icon: "🚪",
    description: "NRIオフィス探検のスタート地点",
  },
  {
    id: "meeting-room",
    name: "会議室",
    icon: "💬",
    description: "アイデアを話し合う場所",
  },
  {
    id: "office",
    name: "執務エリア",
    icon: "🏢",
    description: "社員のみなさんが働く場所",
  },
  {
    id: "cafeteria",
    name: "カフェテリア",
    icon: "☕",
    description: "ほっとひと息つく場所",
  },
  {
    id: "training-room",
    name: "研修室",
    icon: "✏️",
    description: "新しいことを学ぶ場所",
  },
];

export const checkpointIds = checkpoints.map(
  (checkpoint) => checkpoint.id,
) as readonly CheckpointId[];

