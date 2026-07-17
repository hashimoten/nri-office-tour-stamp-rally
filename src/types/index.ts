export type CheckpointId =
  | "entrance"
  | "meeting-room"
  | "office"
  | "cafeteria"
  | "training-room";

export interface Checkpoint {
  id: CheckpointId;
  name: string;
  icon: string;
  description: string;
}

export interface StampRecord {
  checkpointId: CheckpointId;
  acquiredAt: string;
}

export type StampNotice =
  | { kind: "acquired"; checkpointId: CheckpointId }
  | { kind: "duplicate"; checkpointId: CheckpointId }
  | { kind: "invalid" }
  | { kind: "reset" }
  | null;

