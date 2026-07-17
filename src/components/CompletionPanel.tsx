import { eventContent } from "../config/content";
import { StampSheet } from "./StampSheet";

interface CompletionPanelProps {
  headingId?: string;
}

export const CompletionPanel = ({
  headingId = "completion-title",
}: CompletionPanelProps) => (
  <section className="completion-panel" aria-labelledby={headingId}>
    <div className="completion-panel__orbit" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
    <div className="completion-panel__confetti" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
    <StampSheet variant="complete" />
    <div className="completion-panel__content">
      <p className="completion-panel__eyebrow">{eventContent.completeLabel}</p>
      <h2 id={headingId}>{eventContent.completeTitle}</h2>
      <p className="completion-panel__cheer">{eventContent.completeCheer}</p>
      <p>{eventContent.completeMessage}</p>
    </div>
  </section>
);
