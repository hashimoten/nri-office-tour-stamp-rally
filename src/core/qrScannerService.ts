import QrScanner from "qr-scanner";
import { parsePointFromSearch, type PointParseResult } from "./pointParser";

export interface CameraQrScanner {
  start(): Promise<void>;
  destroy(): void;
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
): CameraQrScanner =>
  new QrScanner(video, (result) => onDecode(result.data), {
    preferredCamera: "environment",
    maxScansPerSecond: 12,
    returnDetailedScanResult: true,
    onDecodeError: () => undefined,
  });

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
