import { eventContent } from "../config/content";

interface CompletionPanelProps {
  headingId?: string;
}

export const CompletionPanel = ({
  headingId = "completion-title",
}: CompletionPanelProps) => (
  <section className="completion-panel" aria-labelledby="completion-title">
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
    <div className="completion-panel__badge" aria-hidden="true">
      ★
    </div>
    <div className="completion-panel__content">
      <p className="completion-panel__eyebrow">MISSION COMPLETE</p>
      <h2 id={headingId}>{eventContent.completeTitle}</h2>
      <p className="completion-panel__cheer">{eventContent.completeCheer}</p>
      <p>{eventContent.completeMessage}</p>
    </div>
  </section>
);
