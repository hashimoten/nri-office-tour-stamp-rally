import { eventContent } from "../content";

interface ResetPanelProps {
  onReset: () => void;
}

export const ResetPanel = ({ onReset }: ResetPanelProps) => (
  <div className="reset-panel">
    <span>{eventContent.resetDescription}</span>
    <button type="button" className="reset-button" onClick={onReset}>
      {eventContent.resetButton}
    </button>
  </div>
);
