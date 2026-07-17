import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../App";
import { checkpoints } from "../config/checkpoints";
import { eventContent } from "../config/content";
import { saveStamps, STORAGE_KEY } from "../core/storageService";

const setLocation = (search = "") => {
  window.history.replaceState({}, "", `/${search}`);
};

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
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

  it("アプリ内で読み取ったQRからスタンプを取得する", async () => {
    const originalMediaDevices = Object.getOwnPropertyDescriptor(
      navigator,
      "mediaDevices",
    );
    const originalReadyState = Object.getOwnPropertyDescriptor(
      HTMLMediaElement.prototype,
      "readyState",
    );
    const stopTrack = vi.fn();
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue();

    class FakeBarcodeDetector {
      static getSupportedFormats = async () => ["qr_code"];

      async detect() {
        return [{ rawValue: "?point=entrance" }];
      }
    }

    vi.stubGlobal("BarcodeDetector", FakeBarcodeDetector);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: stopTrack }],
        }),
      },
    });
    Object.defineProperty(HTMLMediaElement.prototype, "readyState", {
      configurable: true,
      get: () => HTMLMediaElement.HAVE_CURRENT_DATA,
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
      expect(
        screen.getByText("1 / 5個のスタンプを集めました"),
      ).toBeInTheDocument();
      expect(stopTrack).toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
      play.mockRestore();
      if (originalMediaDevices) {
        Object.defineProperty(
          navigator,
          "mediaDevices",
          originalMediaDevices,
        );
      } else {
        delete (navigator as { mediaDevices?: MediaDevices }).mediaDevices;
      }
      if (originalReadyState) {
        Object.defineProperty(
          HTMLMediaElement.prototype,
          "readyState",
          originalReadyState,
        );
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

  it("取得済みスタンプには重複メッセージを表示する", async () => {
    saveStamps([
      {
        checkpointId: "office",
        acquiredAt: "2026-07-17T03:04:05.000Z",
      },
    ]);
    setLocation("?point=office");
    render(<App />);

    expect(
      await screen.findByText(eventContent.duplicateMessage),
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
    expect(screen.getByText(eventContent.completeMessage)).toBeInTheDocument();
    expect(screen.getByText("5 / 5個のスタンプを集めました")).toBeInTheDocument();
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
