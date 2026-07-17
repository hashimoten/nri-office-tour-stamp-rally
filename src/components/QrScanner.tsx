import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { eventContent } from "../config/content";
import {
  createCameraQrScanner,
  isCameraAccessSupported,
  parseScannedQrValue,
  requestRearCamera,
  type CameraQrScanner,
} from "../core/qrScannerService";
import type { CheckpointId } from "../types";

type ScannerStatus =
  | "starting"
  | "active"
  | "unsupported"
  | "permission-denied"
  | "camera-unavailable"
  | "error";

interface QrScannerProps {
  onDetected: (checkpointId: CheckpointId) => void;
  onInvalid: () => void;
}

const getStatusMessage = (status: ScannerStatus) => {
  switch (status) {
    case "active":
      return eventContent.scannerActive;
    case "unsupported":
      return eventContent.scannerUnsupported;
    case "permission-denied":
      return eventContent.scannerPermissionDenied;
    case "camera-unavailable":
      return eventContent.scannerCameraUnavailable;
    case "error":
      return eventContent.scannerError;
    default:
      return eventContent.scannerStarting;
  }
};

export const QrScanner = ({ onDetected, onInvalid }: QrScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ScannerStatus>("starting");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannerRef = useRef<CameraQrScanner | null>(null);

  const stopCamera = useCallback(() => {
    scannerRef.current?.destroy();
    scannerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const closeScanner = useCallback(() => {
    stopCamera();
    setIsOpen(false);
  }, [stopCamera]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    let handled = false;

    const startScanner = async () => {
      setStatus("starting");

      if (!isCameraAccessSupported()) {
        if (!cancelled) setStatus("unsupported");
        return;
      }

      try {
        const stream = await requestRearCamera();
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const video = videoRef.current;
        if (!video) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const scanner = createCameraQrScanner(
          video,
          (rawValue) => {
            if (cancelled || handled) return;
            handled = true;
            const parsed = parseScannedQrValue(rawValue);
            closeScanner();

            if (parsed.kind === "valid") {
              onDetected(parsed.checkpointId);
            } else {
              onInvalid();
            }
          },
          () => {
            if (!cancelled && !handled) setStatus("error");
          },
        );

        streamRef.current = stream;
        scannerRef.current = scanner;
        video.srcObject = stream;
        await scanner.start();

        if (cancelled || handled) return;
        setStatus("active");
      } catch (error) {
        if (cancelled) return;

        if (error instanceof DOMException && error.name === "NotAllowedError") {
          setStatus("permission-denied");
        } else if (
          error instanceof DOMException &&
          (error.name === "NotFoundError" || error.name === "OverconstrainedError")
        ) {
          setStatus("camera-unavailable");
        } else {
          setStatus("error");
        }
        stopCamera();
      }
    };

    void startScanner();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeScanner();
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", handleEscape);
      stopCamera();
    };
  }, [closeScanner, isOpen, onDetected, onInvalid, stopCamera]);

  const openScanner = () => {
    setStatus("starting");
    setIsOpen(true);
  };

  return (
    <>
      <button className="qr-scan-button" type="button" onClick={openScanner}>
        <span className="qr-scan-button__icon" aria-hidden="true">
          <span />
        </span>
        {eventContent.scannerButton}
      </button>

      {isOpen &&
        createPortal(
          <div className="scanner-modal" role="presentation">
            <section
              className="scanner-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="scanner-title"
              aria-describedby="scanner-status"
            >
              <div className="scanner-dialog__header">
                <div>
                  <p>QR SCANNER</p>
                  <h2 id="scanner-title">{eventContent.scannerTitle}</h2>
                </div>
                <button
                  className="scanner-dialog__close"
                  type="button"
                  onClick={closeScanner}
                  aria-label={eventContent.scannerClose}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <div className={`scanner-view scanner-view--${status}`}>
                <video ref={videoRef} muted playsInline />
                {status === "active" && (
                  <div className="scanner-view__frame" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                )}
                {status !== "active" && status !== "starting" && (
                  <div className="scanner-view__fallback" aria-hidden="true">
                    <span>QR</span>
                  </div>
                )}
                {status === "starting" && (
                  <div className="scanner-view__loader" aria-hidden="true" />
                )}
              </div>

              <p id="scanner-status" className="scanner-dialog__status">
                {getStatusMessage(status)}
              </p>
              {status === "active" && (
                <p className="scanner-dialog__hint">
                  {eventContent.scannerHint}
                </p>
              )}
              <button
                className="scanner-dialog__cancel"
                type="button"
                onClick={closeScanner}
              >
                {eventContent.scannerClose}
              </button>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
};
