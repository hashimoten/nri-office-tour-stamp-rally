import { eventContent } from "../config/content";

interface StampSheetProps {
  variant: "stamp" | "complete";
  isStamped?: boolean;
  className?: string;
}

export const StampSheet = ({
  variant,
  isStamped = true,
  className,
}: StampSheetProps) => {
  const isComplete = variant === "complete";

  return (
    <div
      className={`stamp-sheet stamp-sheet--${variant}${className ? ` ${className}` : ""}`}
      data-testid={isStamped ? "stamp-sheet-stamped" : "stamp-sheet-empty"}
      aria-hidden="true"
    >
      <p className="stamp-sheet__caption">STAMP CARD</p>
      <div className="stamp-sheet__mount">
        <span className="stamp-sheet__guide">STAMP SPACE</span>
        {isStamped && (
          <div className="stamp-sheet__imprint">
            <span>NRI OFFICE TOUR</span>
            <strong>
              {isComplete
                ? eventContent.stampImpactComplete
                : eventContent.stampImpactGet}
            </strong>
            <span>{isComplete ? "ALL STAMPS" : "STAMP ACQUIRED"}</span>
          </div>
        )}
      </div>
    </div>
  );
};
