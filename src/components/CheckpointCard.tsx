import { eventContent } from "../config/content";
import type { Checkpoint, StampRecord } from "../types";

interface CheckpointCardProps {
  checkpoint: Checkpoint;
  stamp?: StampRecord;
  index: number;
}

const formatAcquiredAt = (timestamp: string) =>
  new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));

export const CheckpointCard = ({
  checkpoint,
  stamp,
  index,
}: CheckpointCardProps) => {
  const isCollected = Boolean(stamp);

  return (
    <article
      className={`checkpoint-card${isCollected ? " checkpoint-card--collected" : ""}`}
      aria-label={`${checkpoint.name} ${isCollected ? "取得済み" : "未取得"}`}
    >
      <div className="checkpoint-card__sequence" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="checkpoint-card__icon" aria-hidden="true">
        {checkpoint.icon}
      </div>
      <div className="checkpoint-card__content">
        <div className="checkpoint-card__heading">
          <h3>{checkpoint.name}</h3>
          <span
            className={`status-pill${isCollected ? " status-pill--collected" : ""}`}
          >
            <span className="status-pill__dot" aria-hidden="true" />
            {isCollected
              ? eventContent.collectedLabel
              : eventContent.uncollectedLabel}
          </span>
        </div>
        <p className="checkpoint-card__description">{checkpoint.description}</p>
        <div className="checkpoint-card__time">
          {stamp ? (
            <>
              <span>{eventContent.acquiredAtLabel}</span>
              <time dateTime={stamp.acquiredAt}>
                {formatAcquiredAt(stamp.acquiredAt)}
              </time>
            </>
          ) : (
            <span>{eventContent.waitingForScan}</span>
          )}
        </div>
      </div>
      {isCollected && (
        <div className="checkpoint-card__stamp" aria-hidden="true">
          <span>✓</span>
        </div>
      )}
    </article>
  );
};

