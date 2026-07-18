import { prepareZXingModule, readBarcodes } from "zxing-wasm/reader";
import readerWasmUrl from "zxing-wasm/reader/zxing_reader.wasm?url";
import { parsePointFromSearch } from "./point-parser.js";

const decoderOptions = {
  formats: ["QRCode"],
  maxNumberOfSymbols: 1,
  tryHarder: true,
  tryInvert: true,
  tryRotate: true,
  tryDenoise: true,
  tryDownscale: false,
};

let decoderPreparation;

const normalizePath = (path) => {
  const leading = path.startsWith("/") ? path : `/${path}`;
  return leading.endsWith("/") ? leading : `${leading}/`;
};

export const parseScannedQrValue = (
  rawValue,
  currentUrl = window.location.href,
  basePath = import.meta.env.BASE_URL,
) => {
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

const prepareDecoder = () => {
  if (!decoderPreparation) {
    decoderPreparation = prepareZXingModule({
      fireImmediately: true,
      overrides: {
        locateFile: (path, prefix) =>
          path.endsWith(".wasm") ? readerWasmUrl : `${prefix}${path}`,
      },
    }).then(() => undefined);
  }
  return decoderPreparation;
};

const requestRearCamera = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 },
    },
  });

  const track = stream.getVideoTracks()[0];
  if (track) {
    try {
      await track.applyConstraints({ advanced: [{ focusMode: "continuous" }] });
    } catch {
      // Focus controls are not available on every mobile browser.
    }
  }
  return stream;
};

const createDialog = () => {
  const modal = document.createElement("div");
  modal.className = "scanner-modal";
  modal.innerHTML = `
    <section class="scanner-dialog" role="dialog" aria-modal="true" aria-labelledby="scanner-title">
      <button class="scanner-close" type="button" data-action="close-scanner" aria-label="閉じる">×</button>
      <p class="scanner-label">QR SCANNER</p>
      <h2 id="scanner-title">QRコードを読み取る</h2>
      <div class="scanner-view">
        <video muted playsinline></video>
        <div class="scanner-frame" aria-hidden="true"></div>
      </div>
      <p class="scanner-status" role="status">カメラを準備しています…</p>
      <p class="scanner-hint">QRコード全体と、まわりの白い余白まで枠内に入れてください。</p>
    </section>`;
  document.body.append(modal);
  return modal;
};

export const openQrScanner = async ({ onDetected, onInvalid }) => {
  const modal = createDialog();
  const video = modal.querySelector("video");
  const status = modal.querySelector(".scanner-status");
  let stream;
  let stopped = false;
  let timer;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  const close = () => {
    stopped = true;
    if (timer) window.clearTimeout(timer);
    stream?.getTracks().forEach((track) => track.stop());
    modal.remove();
  };

  modal.querySelector("[data-action='close-scanner']").addEventListener("click", close);
  const handleEscape = (event) => {
    if (event.key === "Escape") close();
  };
  window.addEventListener("keydown", handleEscape, { once: true });

  if (!navigator.mediaDevices?.getUserMedia || !context) {
    status.textContent = "この端末ではアプリ内読取を利用できません。標準カメラをご利用ください。";
    return { close };
  }

  const scan = async () => {
    if (stopped) return;
    try {
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (width && height) {
        const scale = Math.min(1, 1440 / Math.max(width, height));
        canvas.width = Math.floor(width * scale);
        canvas.height = Math.floor(height * scale);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const [result] = await readBarcodes(
          context.getImageData(0, 0, canvas.width, canvas.height),
          decoderOptions,
        );
        if (result?.text && !stopped) {
          const parsed = parseScannedQrValue(result.text);
          close();
          parsed.kind === "valid" ? onDetected(parsed.checkpointId) : onInvalid();
          return;
        }
      }
    } catch {
      status.textContent = "読み取り中です。QRコードを明るい場所で枠内に映してください。";
    }
    timer = window.setTimeout(scan, 80);
  };

  try {
    await prepareDecoder();
    stream = await requestRearCamera();
    if (stopped) return { close };
    video.srcObject = stream;
    await video.play();
    status.textContent = "枠の中にQRコードを映してください";
    void scan();
  } catch (error) {
    status.textContent =
      error instanceof DOMException && error.name === "NotAllowedError"
        ? "カメラが許可されていません。ブラウザー設定でカメラを許可してください。"
        : "カメラを開始できませんでした。標準カメラをご利用ください。";
  }

  return { close };
};

