interface NoticeBannerProps {
  message: string;
  tone: "success" | "info" | "error";
}

export const NoticeBanner = ({ message, tone }: NoticeBannerProps) => (
  <div
    className={`notice-banner notice-banner--${tone}`}
    role={tone === "error" ? "alert" : "status"}
  >
    <span className="notice-banner__icon" aria-hidden="true">
      {tone === "success" ? "✓" : tone === "error" ? "!" : "i"}
    </span>
    <span>{message}</span>
  </div>
);

