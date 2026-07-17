interface ProgressPanelProps {
  collected: number;
  total: number;
  isCelebrating?: boolean;
}

export const ProgressPanel = ({
  collected,
  total,
  isCelebrating = false,
}: ProgressPanelProps) => {
  const percentage = total === 0 ? 0 : Math.round((collected / total) * 100);

  return (
    <section
      className={`progress-panel${isCelebrating ? " progress-panel--celebrating" : ""}`}
      aria-labelledby="progress-title"
    >
      <div className="progress-panel__topline">
        <div>
          <p className="progress-panel__eyebrow" id="progress-title">
            STAMP PROGRESS
          </p>
          <p className="progress-panel__count" aria-live="polite">
            {collected} / {total}個のスタンプを集めました
          </p>
        </div>
        <div className="progress-panel__percent" aria-hidden="true">
          {percentage}%
        </div>
      </div>
      <div
        className="progress-bar"
        role="progressbar"
        aria-label="スタンプの取得進捗"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={collected}
      >
        <div
          className="progress-bar__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </section>
  );
};
