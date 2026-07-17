import { checkpoints } from "../config/checkpoints";
import type { StampRecord } from "../types";
import { CheckpointCard } from "./CheckpointCard";

interface CheckpointGridProps {
  stamps: readonly StampRecord[];
}

export const CheckpointGrid = ({ stamps }: CheckpointGridProps) => {
  const stampsById = new Map(stamps.map((stamp) => [stamp.checkpointId, stamp]));

  return (
    <div className="checkpoint-grid">
      {checkpoints.map((checkpoint, index) => (
        <CheckpointCard
          key={checkpoint.id}
          checkpoint={checkpoint}
          stamp={stampsById.get(checkpoint.id)}
          index={index}
        />
      ))}
    </div>
  );
};

