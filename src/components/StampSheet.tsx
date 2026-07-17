import { eventContent } from "../config/content";

interface StampSheetProps {
  variant: "stamp" | "complete";
}

export const StampSheet = ({ variant }: StampSheetProps) => {
  const isComplete = variant === "complete";

  return (
    <div className={`stamp-sheet stamp-sheet--${variant}`} aria-hidden="true">
      <p className="stamp-sheet__caption">STAMP CARD</p>
      <div className="stamp-sheet__mount">
        <span className="stamp-sheet__guide">STAMP SPACE</span>
        <div className="stamp-sheet__imprint">
          <span>NRI OFFICE TOUR</span>
          <strong>
            {isComplete
              ? eventContent.stampImpactComplete
              : eventContent.stampImpactGet}
          </strong>
          <span>{isComplete ? "ALL STAMPS" : "STAMP ACQUIRED"}</span>
        </div>
      </div>
    </div>
  );
};
