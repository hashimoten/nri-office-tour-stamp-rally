import { eventContent } from "../config/content";

interface StampCelebrationProps {
  checkpointName: string;
  collected: number;
  total: number;
}

export const StampCelebration = ({
  checkpointName,
  collected,
  total,
}: StampCelebrationProps) => {
  const remaining = Math.max(total - collected, 0);

  return (
    <section className="stamp-celebration" aria-live="polite" aria-atomic="true">
      <div className="stamp-celebration__sparkles" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="stamp-celebration__seal" aria-hidden="true">
        <span>★</span>
      </div>
      <div className="stamp-celebration__content">
        <p className="stamp-celebration__eyebrow">
          {eventContent.stampCelebrationLabel}
        </p>
        <h2>{eventContent.stampCelebrationTitle}</h2>
        <p className="stamp-celebration__message">
          {checkpointName}のスタンプをゲットしました！
        </p>
        <p className="stamp-celebration__next">
          {remaining > 0
            ? `あと${remaining}か所。${eventContent.stampCelebrationNext}`
            : eventContent.allStampsCollected}
        </p>
      </div>
      <p className="stamp-celebration__count" aria-hidden="true">
        <strong>{collected}</strong> / {total}
      </p>
    </section>
  );
};
