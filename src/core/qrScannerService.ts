import QrScanner from "qr-scanner";
import { parsePointFromSearch, type PointParseResult } from "./pointParser";

export interface CameraQrScanner {
  start(): Promise<void>;
  destroy(): void;
}

interface QrScannerRuntime {
  _disableBarcodeDetector: boolean;
}

const normalizePath = (path: string) => {
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
};

export const isCameraAccessSupported = () =>
  Boolean(navigator.mediaDevices?.getUserMedia);

export const requestRearCamera = () =>
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  });

export const createCameraQrScanner = (
  video: HTMLVideoElement,
  onDecode: (rawValue: string) => void,
  onError: () => void,
): CameraQrScanner => {
  // Safari may expose an incomplete BarcodeDetector implementation. Always use
  // qr-scanner's local Worker so that iPhone Safari and installed PWAs behave
  // consistently. The pinned qr-scanner version provides this runtime flag.
  (QrScanner as unknown as QrScannerRuntime)._disableBarcodeDetector = true;

  const scanner = new QrScanner(video, (result) => onDecode(result.data), {
    preferredCamera: "environment",
    maxScansPerSecond: 10,
    returnDetailedScanResult: true,
    calculateScanRegion: (source) => {
      const side = Math.floor(
        Math.min(source.videoWidth, source.videoHeight) * 0.9,
      );

      return {
        x: Math.floor((source.videoWidth - side) / 2),
        y: Math.floor((source.videoHeight - side) / 2),
        width: side,
        height: side,
        downScaledWidth: 800,
        downScaledHeight: 800,
      };
    },
    onDecodeError: (error) => {
      if (error !== QrScanner.NO_QR_CODE_FOUND) onError();
    },
  });

  scanner.setInversionMode("both");
  return scanner;
};

export const parseScannedQrValue = (
  rawValue: string,
  currentUrl: string = window.location.href,
  basePath: string = import.meta.env.BASE_URL,
): PointParseResult => {
  try {
    const current = new URL(currentUrl);
    const scanned = new URL(rawValue.trim(), current);

    if (
      scanned.origin !== current.origin ||
      normalizePath(scanned.pathname) !== normalizePath(basePath)
    ) {
      return { kind: "invalid" };
    }

    const parsed = parsePointFromSearch(scanned.search);
    return parsed.kind === "none" ? { kind: "invalid" } : parsed;
  } catch {
    return { kind: "invalid" };
  }
};
