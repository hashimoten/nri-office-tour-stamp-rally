/*
 * チェックポイントはこのファイルだけで管理します。
 * 項目を追加・削除すると、全チームのカード枚数、進捗、QR判定へ反映されます。
 * id: QRコードの ?point= に使う、重複しない半角英数字とハイフンの値
 * name: 画面に表示する場所の名前
 * icon: カードに表示する絵文字
 * description: 場所の短い説明
 */
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
    Object.freeze({
    id: "roundge",
    name: "ステアラウンジ",
    icon: "✏️",
    description: "みんなの憩いの場所",
  }),
]);

export const checkpointIds = Object.freeze(
  checkpoints.map((checkpoint) => checkpoint.id),
);

const checkpointIdSet = new Set(checkpointIds);

export const isCheckpointId = (value) => checkpointIdSet.has(value);

