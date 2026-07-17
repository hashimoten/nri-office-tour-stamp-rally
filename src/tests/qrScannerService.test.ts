import { describe, expect, it } from "vitest";
import { parseScannedQrValue } from "../core/qrScannerService";

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
});
