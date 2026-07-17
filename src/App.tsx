import { useEffect, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { CelebrationModal } from "./components/CelebrationModal";
import { CheckpointGrid } from "./components/CheckpointGrid";
import { CompletionPanel } from "./components/CompletionPanel";
import { NoticeBanner } from "./components/NoticeBanner";
import { ProgressPanel } from "./components/ProgressPanel";
import { QrScanner } from "./components/QrScanner";
import { ResetPanel } from "./components/ResetPanel";
import { checkpoints } from "./config/checkpoints";
import { eventContent } from "./config/content";
import { isStampRallyComplete } from "./core/completionService";
import { useStampRally } from "./core/useStampRally";
import type { StampNotice } from "./types";

const getNoticePresentation = (notice: StampNotice) => {
  if (!notice) return null;

  if (notice.kind === "invalid") {
    return { message: eventContent.invalidMessage, tone: "error" as const };
  }

  if (notice.kind === "reset") {
    return { message: eventContent.resetMessage, tone: "info" as const };
  }

  if (notice.kind === "duplicate") {
    return { message: eventContent.duplicateMessage, tone: "info" as const };
  }

  const checkpoint = checkpoints.find(
    (candidate) => candidate.id === notice.checkpointId,
  );
  return {
    message: `${checkpoint?.name ?? "チェックポイント"}のスタンプをゲットしました！`,
    tone: "success" as const,
  };
};

export const App = () => {
  const { stamps, notice, collectStamp, reportInvalidQr, resetAll } =
    useStampRally();
  const [celebration, setCelebration] = useState<
    "stamp" | "complete" | "duplicate" | null
  >(null);
  const completed = isStampRallyComplete(stamps);
  const noticePresentation = getNoticePresentation(notice);
  const notifiedCheckpoint =
    notice?.kind === "acquired" || notice?.kind === "duplicate"
      ? checkpoints.find((checkpoint) => checkpoint.id === notice.checkpointId)
      : undefined;

  useEffect(() => {
    if (notice?.kind === "acquired") {
      setCelebration(completed ? "complete" : "stamp");
    }
    if (notice?.kind === "duplicate") {
      setCelebration("duplicate");
    }
  }, [completed, notice]);

  const handleReset = () => {
    if (window.confirm(eventContent.resetConfirm)) resetAll();
  };

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__copy">
            <p className="hero__eyebrow">
              <span aria-hidden="true" />
              {eventContent.explorationLabel}
            </p>
            <h2 id="hero-title">{eventContent.introduction}</h2>
            <p className="hero__subtitle">{eventContent.subtitle}</p>
            <QrScanner
              onDetected={collectStamp}
              onInvalid={reportInvalidQr}
            />
          </div>
          <div className="hero__route" aria-hidden="true">
            <span className="hero__route-line" />
            <span className="hero__route-point hero__route-point--one" />
            <span className="hero__route-point hero__route-point--two" />
            <span className="hero__route-point hero__route-point--three" />
          </div>
        </section>

        {noticePresentation && !notifiedCheckpoint ? (
          <NoticeBanner
            message={noticePresentation.message}
            tone={noticePresentation.tone}
          />
        ) : null}

        <ProgressPanel
          collected={stamps.length}
          total={checkpoints.length}
          isCelebrating={notice?.kind === "acquired"}
        />

        {completed && <CompletionPanel />}

        <section className="checkpoint-section" aria-labelledby="checkpoint-title">
          <div className="section-heading">
            <div>
              <p className="section-heading__eyebrow">CHECKPOINTS</p>
              <h2 id="checkpoint-title">探検する場所</h2>
            </div>
            <span>{checkpoints.length} SPOTS</span>
          </div>
          <CheckpointGrid stamps={stamps} />
        </section>
      </main>

      <footer className="app-footer">
        <div className="app-footer__inner">
          <div>
            <strong>{eventContent.footerLabel}</strong>
            <p>{eventContent.privacyNote}</p>
          </div>
          <ResetPanel onReset={handleReset} />
        </div>
      </footer>

      {celebration && notifiedCheckpoint && (
        <CelebrationModal
          kind={celebration}
          checkpointName={notifiedCheckpoint.name}
          collected={stamps.length}
          total={checkpoints.length}
          onClose={() => setCelebration(null)}
        />
      )}
    </div>
  );
};
