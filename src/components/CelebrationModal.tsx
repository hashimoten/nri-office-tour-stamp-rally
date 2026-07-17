import { useEffect, useRef } from "react";
import { eventContent } from "../config/content";
import { CompletionPanel } from "./CompletionPanel";
import { StampCelebration } from "./StampCelebration";

interface CelebrationModalProps {
  kind: "stamp" | "complete";
  checkpointName: string;
  collected: number;
  total: number;
  onClose: () => void;
}

export const CelebrationModal = ({
  kind,
  checkpointName,
  collected,
  total,
  onClose,
}: CelebrationModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isComplete = kind === "complete";
  const dialogLabel = isComplete
    ? eventContent.completeTitle
    : eventContent.stampCelebrationTitle;
  const actionLabel = isComplete
    ? eventContent.completeModalClose
    : eventContent.stampModalClose;

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="celebration-modal" role="presentation">
      <div className="celebration-modal__backdrop" aria-hidden="true" />
      <section
        className="celebration-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={dialogLabel}
      >
        <div
          className={`stamp-impact${isComplete ? " stamp-impact--complete" : ""}`}
          aria-hidden="true"
        >
          <span>NRI OFFICE TOUR</span>
          <strong>
            {isComplete
              ? eventContent.stampImpactComplete
              : eventContent.stampImpactGet}
          </strong>
          <span>{isComplete ? "ALL STAMPS" : "STAMP ACQUIRED"}</span>
        </div>
        <button
          ref={closeButtonRef}
          className="celebration-modal__close"
          type="button"
          onClick={onClose}
          aria-label="お祝い表示を閉じる"
        >
          ×
        </button>
        {isComplete ? (
          <CompletionPanel headingId="completion-modal-title" />
        ) : (
          <StampCelebration
            checkpointName={checkpointName}
            collected={collected}
            total={total}
          />
        )}
        <button className="celebration-modal__action" type="button" onClick={onClose}>
          {actionLabel}
        </button>
      </section>
    </div>
  );
};
