import { eventContent } from "../config/content";
import { StampSheet } from "./StampSheet";

interface StampCelebrationProps {
  checkpointName: string;
  collected: number;
  total: number;
  mode?: "acquired" | "duplicate";
}

export const StampCelebration = ({
  checkpointName,
  collected,
  total,
  mode = "acquired",
}: StampCelebrationProps) => {
  const remaining = Math.max(total - collected, 0);
  const isDuplicate = mode === "duplicate";

  return (
    <section
      className={`stamp-celebration${isDuplicate ? " stamp-celebration--duplicate" : ""}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="stamp-celebration__sparkles" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <StampSheet variant="stamp" />
      <div className="stamp-celebration__content">
        <p className="stamp-celebration__eyebrow">
          {isDuplicate
            ? eventContent.duplicateCelebrationLabel
            : eventContent.stampCelebrationLabel}
        </p>
        <h2>
          {isDuplicate
            ? eventContent.duplicateCelebrationTitle
            : eventContent.stampCelebrationTitle}
        </h2>
        <p className="stamp-celebration__message">
          {isDuplicate
            ? `${checkpointName}のスタンプは、もうスタンプカードに押されているよ！`
            : `${checkpointName}のスタンプをゲットしました！`}
        </p>
        <p className="stamp-celebration__next">
          {isDuplicate
            ? eventContent.duplicateCelebrationNext
            : remaining > 0
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
