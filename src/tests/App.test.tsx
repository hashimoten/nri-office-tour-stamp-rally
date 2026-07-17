import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../App";
import { checkpoints } from "../config/checkpoints";
import { eventContent } from "../content";
import { saveStamps, STORAGE_KEY } from "../core/storageService";

const cameraScannerMock = vi.hoisted(() => ({
  decodedValue: null as string | null,
  decodeError: null as string | null,
  destroy: vi.fn(),
  start: vi.fn(),
}));

vi.mock("../core/qrScannerService", () => ({
  isCameraAccessSupported: () => Boolean(navigator.mediaDevices?.getUserMedia),
  requestRearCamera: () => navigator.mediaDevices.getUserMedia({ video: true }),
  parseScannedQrValue: (value: string) =>
    value.includes("point=entrance")
      ? { kind: "valid", checkpointId: "entrance" }
      : { kind: "invalid" },
  createCameraQrScanner: (
    _video: HTMLVideoElement,
    onDecode: (value: string) => void,
    onError: () => void,
  ) => ({
    start: async () => {
      cameraScannerMock.start();
      if (cameraScannerMock.decodeError) {
        window.setTimeout(() => onError(), 0);
      }
      if (cameraScannerMock.decodedValue) {
        onDecode(cameraScannerMock.decodedValue);
      }
    },
    destroy: () => cameraScannerMock.destroy(),
  }),
}));

const setLocation = (search = "") => {
  window.history.replaceState({}, "", `${import.meta.env.BASE_URL}${search}`);
};

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    cameraScannerMock.decodedValue = null;
    cameraScannerMock.decodeError = null;
    cameraScannerMock.destroy.mockClear();
    cameraScannerMock.start.mockClear();
    setLocation();
  });

  it("初期状態で5つのチェックポイントと進捗を表示する", () => {
    render(<App />);

    for (const checkpoint of checkpoints) {
      expect(screen.getByText(checkpoint.name)).toBeInTheDocument();
    }
    expect(screen.getByText("0 / 5個のスタンプを集めました")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: eventContent.scannerButton }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("stamp-sheet-empty")).toHaveLength(5);
  });

  it("ホーム画面では取得済みの場所だけ押印済みの台紙を表示する", () => {
    saveStamps([
      {
        checkpointId: "entrance",
        acquiredAt: "2026-07-17T03:04:05.000Z",
      },
    ]);
    render(<App />);

    expect(
      within(
        screen.getByRole("article", { name: "エントランス 取得済み" }),
      ).getByTestId("stamp-sheet-stamped"),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("stamp-sheet-empty")).toHaveLength(4);
  });

  it("アプリ内読取に非対応でも標準カメラの案内を表示する", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: eventContent.scannerButton }),
    );

    expect(
      await screen.findByText(eventContent.scannerUnsupported),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: eventContent.scannerTitle }),
    ).toBeInTheDocument();
  });

  it("BarcodeDetectorがないiPhone相当でもQRからスタンプを取得する", async () => {
    const originalMediaDevices = Object.getOwnPropertyDescriptor(
      navigator,
      "mediaDevices",
    );
    const stopTrack = vi.fn();

    cameraScannerMock.decodedValue = "?point=entrance";
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: stopTrack }],
        }),
      },
    });

    try {
      const user = userEvent.setup();
      render(<App />);

      await user.click(
        screen.getByRole("button", { name: eventContent.scannerButton }),
      );

      expect(
        await screen.findByText("エントランスのスタンプをゲットしました！"),
      ).toBeInTheDocument();
      expect(screen.getByText(eventContent.stampCelebrationTitle)).toBeInTheDocument();
      const celebrationDialog = screen.getByRole("dialog", {
        name: eventContent.stampCelebrationTitle,
      });
      expect(celebrationDialog).toBeInTheDocument();
      expect(
        within(celebrationDialog).getByText(eventContent.stampImpactGet),
      ).toBeInTheDocument();
      expect(
        screen.getByText("あと4か所。気になる場所を探検してみよう！"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("1 / 5個のスタンプを集めました"),
      ).toBeInTheDocument();
      expect(stopTrack).toHaveBeenCalled();
      expect(cameraScannerMock.start).toHaveBeenCalledOnce();
      expect(cameraScannerMock.destroy).toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
      if (originalMediaDevices) {
        Object.defineProperty(
          navigator,
          "mediaDevices",
          originalMediaDevices,
        );
      } else {
        delete (navigator as { mediaDevices?: MediaDevices }).mediaDevices;
      }
    }
  });

  it("QR解析Workerの異常を利用者に案内する", async () => {
    const originalMediaDevices = Object.getOwnPropertyDescriptor(
      navigator,
      "mediaDevices",
    );
    const stopTrack = vi.fn();

    cameraScannerMock.decodeError = "Scanner error: worker failed";
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: stopTrack }],
        }),
      },
    });

    try {
      const user = userEvent.setup();
      render(<App />);

      await user.click(
        screen.getByRole("button", { name: eventContent.scannerButton }),
      );

      expect(
        await screen.findByText(eventContent.scannerError),
      ).toBeInTheDocument();
    } finally {
      if (originalMediaDevices) {
        Object.defineProperty(navigator, "mediaDevices", originalMediaDevices);
      } else {
        delete (navigator as { mediaDevices?: MediaDevices }).mediaDevices;
      }
    }
  });

  it("正しいQRのpointでスタンプを取得し進捗を更新する", async () => {
    setLocation("?point=meeting-room");
    render(<App />);

    expect(
      await screen.findByText("会議室のスタンプをゲットしました！"),
    ).toBeInTheDocument();
    expect(screen.getByText("1 / 5個のスタンプを集めました")).toBeInTheDocument();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ checkpointId: "meeting-room" });
    expect(Date.parse(saved[0].acquiredAt)).not.toBeNaN();
  });

  it("不正なQRではスタンプを取得しない", async () => {
    setLocation("?point=secret-room");
    render(<App />);

    expect(await screen.findByText(eventContent.invalidMessage)).toBeInTheDocument();
    expect(screen.getByText("0 / 5個のスタンプを集めました")).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("取得済みスタンプは重複取得のポップアップを表示する", async () => {
    saveStamps([
      {
        checkpointId: "office",
        acquiredAt: "2026-07-17T03:04:05.000Z",
      },
    ]);
    setLocation("?point=office");
    render(<App />);

    const dialog = await screen.findByRole("dialog", {
      name: eventContent.duplicateCelebrationTitle,
    });
    expect(
      within(dialog).getByText(eventContent.duplicateCelebrationTitle),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("執務エリアのスタンプは、もうスタンプカードに押されているよ！"),
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")).toHaveLength(1);
  });

  it("全取得時にクリア画面を表示する", () => {
    saveStamps(
      checkpoints.map((checkpoint) => ({
        checkpointId: checkpoint.id,
        acquiredAt: "2026-07-17T03:04:05.000Z",
      })),
    );
    render(<App />);

    expect(screen.getByText(eventContent.completeTitle)).toBeInTheDocument();
    expect(screen.getByText(eventContent.completeCheer)).toBeInTheDocument();
    expect(screen.getByText(eventContent.completeMessage)).toBeInTheDocument();
    expect(screen.getByText("5 / 5個のスタンプを集めました")).toBeInTheDocument();
  });

  it("最後のスタンプ取得時はクリアのポップアップを表示して閉じられる", async () => {
    saveStamps(
      checkpoints
        .filter((checkpoint) => checkpoint.id !== "training-room")
        .map((checkpoint) => ({
          checkpointId: checkpoint.id,
          acquiredAt: "2026-07-17T03:04:05.000Z",
        })),
    );
    setLocation("?point=training-room");
    const user = userEvent.setup();
    render(<App />);

    const dialog = await screen.findByRole("dialog", {
      name: eventContent.completeTitle,
    });
    expect(within(dialog).getByText(eventContent.completeCheer)).toBeInTheDocument();
    expect(
      within(dialog).getByText(eventContent.stampImpactComplete),
    ).toBeInTheDocument();

    await user.click(
      within(dialog).getByRole("button", { name: eventContent.completeModalClose }),
    );
    expect(
      screen.queryByRole("dialog", { name: eventContent.completeTitle }),
    ).not.toBeInTheDocument();
  });

  it("確認後のリセットですべてのスタンプを削除する", async () => {
    saveStamps([
      {
        checkpointId: "entrance",
        acquiredAt: "2026-07-17T03:04:05.000Z",
      },
    ]);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: eventContent.resetButton }),
    );

    await waitFor(() => {
      expect(screen.getByText("0 / 5個のスタンプを集めました")).toBeInTheDocument();
    });
    expect(window.confirm).toHaveBeenCalledWith(eventContent.resetConfirm);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("壊れた保存データやロゴ画像がなくても表示できる", () => {
    localStorage.setItem(STORAGE_KEY, "not-json");

    expect(() => render(<App />)).not.toThrow();
    expect(screen.getByText(eventContent.brandLabel)).toBeInTheDocument();
    expect(screen.getByText(eventContent.appTitle)).toBeInTheDocument();
  });
});
