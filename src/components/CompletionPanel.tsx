import { eventContent } from "../config/content";

export const CompletionPanel = () => (
  <section className="completion-panel" aria-labelledby="completion-title">
    <div className="completion-panel__orbit" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
    <div className="completion-panel__badge" aria-hidden="true">
      ★
    </div>
    <div className="completion-panel__content">
      <p className="completion-panel__eyebrow">MISSION COMPLETE</p>
      <h2 id="completion-title">{eventContent.completeTitle}</h2>
      <p>{eventContent.completeMessage}</p>
    </div>
  </section>
);

