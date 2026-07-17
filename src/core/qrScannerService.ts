import {
  prepareZXingModule,
  readBarcodes,
  type ReaderOptions,
} from "zxing-wasm/reader";
import readerWasmUrl from "zxing-wasm/reader/zxing_reader.wasm?url";
import { parsePointFromSearch, type PointParseResult } from "./pointParser";

export interface CameraQrScanner {
  start(): Promise<void>;
  destroy(): void;
}

const decoderOptions: ReaderOptions = {
  formats: ["QRCode"],
  maxNumberOfSymbols: 1,
  tryHarder: true,
  tryInvert: true,
  tryRotate: true,
  tryDenoise: true,
  tryDownscale: false,
};

const maximumScanDimension = 1440;
let decoderPreparation: Promise<void> | undefined;

const normalizePath = (path: string) => {
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
};

export const isCameraAccessSupported = () =>
  Boolean(navigator.mediaDevices?.getUserMedia);

const optimizeCameraForQr = async (stream: MediaStream) => {
  const track = stream.getVideoTracks()[0];
  if (!track) return;

  try {
    await track.applyConstraints({
      advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet],
    });
  } catch {
    // Focus controls are not exposed by every mobile browser.
  }
};

export const requestRearCamera = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 },
    },
  });
  await optimizeCameraForQr(stream);
  return stream;
};

const prepareDecoder = () => {
  if (!decoderPreparation) {
    decoderPreparation = prepareZXingModule({
      fireImmediately: true,
      overrides: {
        locateFile: (path: string, prefix: string) =>
          path.endsWith(".wasm") ? readerWasmUrl : `${prefix}${path}`,
      },
    }).then(() => undefined);
  }

  return decoderPreparation;
};

class ZxingCameraQrScanner implements CameraQrScanner {
  private isDestroyed = false;
  private timer: number | undefined;
  private readonly canvas = document.createElement("canvas");
  private readonly context = this.canvas.getContext("2d", {
    willReadFrequently: true,
  });

  constructor(
    private readonly video: HTMLVideoElement,
    private readonly onDecode: (rawValue: string) => void,
    private readonly onError: () => void,
  ) {}

  async start() {
    if (!this.context) throw new Error("QR scanner canvas is unavailable");

    await prepareDecoder();
    await this.video.play();
    this.scanNextFrame();
  }

  destroy() {
    this.isDestroyed = true;
    if (this.timer !== undefined) window.clearTimeout(this.timer);
  }

  private scanNextFrame = () => {
    if (this.isDestroyed) return;
    this.timer = window.setTimeout(() => void this.scanFrame(), 80);
  };

  private async scanFrame() {
    if (this.isDestroyed || !this.context) return;

    try {
      const { videoWidth, videoHeight } = this.video;
      if (!videoWidth || !videoHeight) return;

      const scale = Math.min(
        1,
        maximumScanDimension / Math.max(videoWidth, videoHeight),
      );
      const width = Math.floor(videoWidth * scale);
      const height = Math.floor(videoHeight * scale);

      this.canvas.width = width;
      this.canvas.height = height;
      this.context.drawImage(this.video, 0, 0, width, height);

      const [result] = await readBarcodes(
        this.context.getImageData(0, 0, width, height),
        decoderOptions,
      );
      if (!this.isDestroyed && result?.text) {
        this.onDecode(result.text);
        return;
      }
    } catch {
      if (!this.isDestroyed) this.onError();
    }

    this.scanNextFrame();
  }
}

export const createCameraQrScanner = (
  video: HTMLVideoElement,
  onDecode: (rawValue: string) => void,
  onError: () => void,
): CameraQrScanner => new ZxingCameraQrScanner(video, onDecode, onError);

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
