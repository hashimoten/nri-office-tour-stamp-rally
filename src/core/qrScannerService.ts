import { parsePointFromSearch, type PointParseResult } from "./pointParser";

interface DetectedBarcode {
  rawValue: string;
}

export interface QrDetector {
  detect(source: HTMLVideoElement): Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): QrDetector;
  getSupportedFormats?: () => Promise<string[]>;
}

const getBarcodeDetectorConstructor = () =>
  (
    globalThis as typeof globalThis & {
      BarcodeDetector?: BarcodeDetectorConstructor;
    }
  ).BarcodeDetector;

const normalizePath = (path: string) => {
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
};

export const isQrScannerSupported = async () => {
  const Detector = getBarcodeDetectorConstructor();
  if (!Detector || !navigator.mediaDevices?.getUserMedia) return false;

  if (!Detector.getSupportedFormats) return true;

  try {
    const formats = await Detector.getSupportedFormats();
    return formats.includes("qr_code");
  } catch {
    return false;
  }
};

export const createQrDetector = (): QrDetector => {
  const Detector = getBarcodeDetectorConstructor();
  if (!Detector) throw new Error("QR detector is unavailable");
  return new Detector({ formats: ["qr_code"] });
};

export const requestRearCamera = () =>
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  });

export const detectQrValue = async (
  detector: QrDetector,
  video: HTMLVideoElement,
) => {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;
  const barcodes = await detector.detect(video);
  return barcodes.find((barcode) => barcode.rawValue.trim())?.rawValue ?? null;
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
