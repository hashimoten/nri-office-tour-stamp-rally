import { describe, expect, it, vi } from "vitest";
import {
  parseScannedQrValue,
  requestRearCamera,
} from "../core/qrScannerService";

describe("parseScannedQrValue", () => {
  const currentUrl =
    "https://hashimoten.github.io/nri-office-tour-stamp-rally/";
  const basePath = "/nri-office-tour-stamp-rally/";

  it("同じアプリのQR URLからチェックポイントを読み取る", () => {
    expect(
      parseScannedQrValue(
        `${currentUrl}?point=entrance`,
        currentUrl,
        basePath,
      ),
    ).toEqual({ kind: "valid", checkpointId: "entrance" });
  });

  it("クエリパラメータだけのQRも読み取る", () => {
    expect(
      parseScannedQrValue("?point=meeting-room", currentUrl, basePath),
    ).toEqual({ kind: "valid", checkpointId: "meeting-room" });
  });

  it("不正なID、別サイト、別パスのQRを拒否する", () => {
    expect(
      parseScannedQrValue("?point=secret-room", currentUrl, basePath),
    ).toEqual({ kind: "invalid" });
    expect(
      parseScannedQrValue(
        "https://example.com/?point=entrance",
        currentUrl,
        basePath,
      ),
    ).toEqual({ kind: "invalid" });
    expect(
      parseScannedQrValue(
        "https://hashimoten.github.io/other-app/?point=entrance",
        currentUrl,
        basePath,
      ),
    ).toEqual({ kind: "invalid" });
  });

  it("高解像度の背面カメラを優先し、利用できる場合は連続フォーカスを求める", async () => {
    const originalMediaDevices = Object.getOwnPropertyDescriptor(
      navigator,
      "mediaDevices",
    );
    const applyConstraints = vi.fn().mockResolvedValue(undefined);
    const stream = {
      getVideoTracks: () => [{ applyConstraints }],
    } as unknown as MediaStream;
    const getUserMedia = vi.fn().mockResolvedValue(stream);

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });

    try {
      await expect(requestRearCamera()).resolves.toBe(stream);
      expect(getUserMedia).toHaveBeenCalledWith({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
      });
      expect(applyConstraints).toHaveBeenCalledWith({
        advanced: [{ focusMode: "continuous" }],
      });
    } finally {
      if (originalMediaDevices) {
        Object.defineProperty(navigator, "mediaDevices", originalMediaDevices);
      } else {
        delete (navigator as { mediaDevices?: MediaDevices }).mediaDevices;
      }
    }
  });
});
