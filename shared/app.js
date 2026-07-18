import { checkpoints, isCheckpointId } from "./checkpoints.js";
import { isGroupId, saveActiveGroup } from "./group-router.js";
import { parsePointFromSearch } from "./point-parser.js";
import { registerPwa } from "./pwa.js";
import { openQrScanner } from "./qr-scanner.js";
import { acquireStamp, clearStamps, loadStamps } from "./storage.js";

const previewTimestamp = "2026-07-18T00:00:00.000Z";

export const createPreviewStamps = (mode) => {
  const selected =
    mode === "empty"
      ? []
      : mode === "partial"
        ? checkpoints.slice(0, 2)
        : mode === "complete"
          ? checkpoints
          : null;

  return selected?.map((checkpoint) => ({
    checkpointId: checkpoint.id,
    acquiredAt: previewTimestamp,
  })) ?? null;
};

const formatDate = (timestamp) =>
  new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));

export const renderStampRally = ({ documentRef = document, stamps }) => {
  const progress = documentRef.querySelector("[data-role='progress']");
  const list = documentRef.querySelector("[data-role='stamp-list']");
  const completePanel = documentRef.querySelector("[data-role='complete-panel']");
  if (!progress || !list || !completePanel) {
    throw new Error("スタンプラリーに必要なdata-role要素がありません");
  }

  const collected = stamps.length;
  const total = checkpoints.length;
  const percentage = Math.round((collected / total) * 100);
  const progressCount = progress.querySelector(".progress-copy strong");
  const progressPercent = progress.querySelector(".progress-copy span");
  const progressBar = progress.querySelector(".progress-bar");
  const progressFill = progress.querySelector(".progress-fill");
  if (!progressCount || !progressPercent || !progressBar || !progressFill) {
    throw new Error("進捗表示に必要な固定クラスがありません");
  }
  progressCount.textContent = `${collected} / ${total}個`;
  progressPercent.textContent = `${percentage}%`;
  progressBar.setAttribute("aria-valuemax", String(total));
  progressBar.setAttribute("aria-valuenow", String(collected));
  progressFill.style.width = `${percentage}%`;

  const stampsById = new Map(stamps.map((stamp) => [stamp.checkpointId, stamp]));
  const cards = [...list.querySelectorAll(".stamp-card")];
  if (cards.length !== checkpoints.length) {
    throw new Error("スタンプカードの枚数がチェックポイント数と一致しません");
  }
  cards.forEach((card, index) => {
    const checkpoint = checkpoints[index];
    const stamp = stampsById.get(checkpoint.id);
    const isCollected = Boolean(stamp);
    card.classList.toggle("stamp-card--collected", isCollected);
    card.classList.toggle("stamp-card--uncollected", !isCollected);
    card.setAttribute(
      "aria-label",
      `${checkpoint.name} ${isCollected ? "取得済み" : "未取得"}`,
    );

    const fields = {
      sequence: card.querySelector(".stamp-sequence"),
      icon: card.querySelector(".stamp-icon"),
      name: card.querySelector(".stamp-name"),
      status: card.querySelector(".stamp-status"),
      description: card.querySelector(".stamp-description"),
      date: card.querySelector(".stamp-date"),
      imprint: card.querySelector(".stamp-imprint"),
    };
    if (Object.values(fields).some((field) => !field)) {
      throw new Error("スタンプカードに必要な固定クラスがありません");
    }
    fields.sequence.textContent = String(index + 1).padStart(2, "0");
    fields.icon.textContent = checkpoint.icon;
    fields.name.textContent = checkpoint.name;
    fields.status.textContent = isCollected ? "ゲット！" : "まだだよ";
    fields.description.textContent = checkpoint.description;
    fields.date.textContent = stamp
      ? `取得日時 ${formatDate(stamp.acquiredAt)}`
      : "QRコードを見つけて読み取ろう";
    fields.imprint.hidden = !isCollected;
  });
  completePanel.hidden = collected !== total;
};

const showNotice = (message, tone = "info", documentRef = document) => {
  const notice = documentRef.querySelector("[data-role='notice']");
  if (!notice) return;
  notice.hidden = false;
  notice.className = `notice notice--${tone}`;
  notice.textContent = message;
};

const createResultModal = ({ kind, checkpointName, collected, total }) => {
  const isComplete = kind === "complete";
  const isDuplicate = kind === "duplicate";
  const title = isComplete
    ? "スタンプラリークリア！"
    : isDuplicate
      ? "このスタンプはすでに取得しています"
      : "やったね！スタンプゲット！";
  const message = isComplete
    ? "NRIのオフィス探検、おつかれさまでした！"
    : isDuplicate
      ? `${checkpointName}のスタンプは、もうスタンプカードに押されているよ！`
      : `${checkpointName}のスタンプをゲットしました！`;

  const modal = document.createElement("div");
  modal.className = "result-modal";
  modal.innerHTML = `
    <section class="result-dialog result-dialog--${kind}" role="dialog" aria-modal="true" aria-label="${title}">
      <button type="button" class="result-close" data-action="close-result" aria-label="閉じる">×</button>
      <div class="result-stamp-card" aria-hidden="true">
        <span>STAMP CARD</span>
        <div class="result-stamp-space">
          <span>STAMP SPACE</span>
          <div class="result-stamp-imprint ${isComplete ? "result-stamp-imprint--complete" : ""}">
            <small>NRI OFFICE TOUR</small>
            <strong>${isComplete ? "COMPLETE" : "GET!"}</strong>
            <small>${isComplete ? "ALL STAMPS" : "STAMP ACQUIRED"}</small>
          </div>
        </div>
      </div>
      <div class="result-copy">
        <p class="result-label">${isComplete ? "MISSION COMPLETE" : isDuplicate ? "ALREADY COLLECTED" : "STAMP GET!"}</p>
        <h2>${title}</h2>
        <p>${message}</p>
        ${!isComplete ? `<p>現在 ${collected} / ${total}個</p>` : ""}
      </div>
      <button type="button" class="result-action" data-action="close-result">${isComplete ? "スタンプラリーを見る" : "探検を続ける"}</button>
    </section>`;

  const close = () => modal.remove();
  modal.querySelectorAll("[data-action='close-result']").forEach((button) =>
    button.addEventListener("click", close),
  );
  document.body.append(modal);
  modal.querySelector(".result-action").focus();
};

const removePointFromUrl = () => {
  const current = new URL(window.location.href);
  current.searchParams.delete("point");
  window.history.replaceState({}, "", current);
};

export const initStampRally = ({
  documentRef = document,
  storage = window.localStorage,
  locationRef = window.location,
} = {}) => {
  const groupId = documentRef.body.dataset.group;
  if (!isGroupId(groupId)) throw new Error("正しいdata-groupが設定されていません");

  const previewMode = new URL(locationRef.href).searchParams.get("preview");
  const previewStamps = createPreviewStamps(previewMode);
  if (!previewStamps) saveActiveGroup(groupId, storage);
  let stamps = previewStamps ?? loadStamps(groupId, storage);
  renderStampRally({ documentRef, stamps });

  const collect = (checkpointId) => {
    if (!isCheckpointId(checkpointId)) {
      showNotice("このQRコードはスタンプラリーでは使えないようです", "error", documentRef);
      return;
    }
    if (previewStamps) {
      showNotice("プレビューモードではスタンプを保存しません", "info", documentRef);
      return;
    }
    const result = acquireStamp(groupId, checkpointId, storage);
    stamps = result.stamps;
    renderStampRally({ documentRef, stamps });
    const checkpoint = checkpoints.find((candidate) => candidate.id === checkpointId);
    createResultModal({
      kind: result.status === "duplicate"
        ? "duplicate"
        : stamps.length === checkpoints.length
          ? "complete"
          : "stamp",
      checkpointName: checkpoint?.name ?? "チェックポイント",
      collected: stamps.length,
      total: checkpoints.length,
    });
  };

  if (!previewStamps) {
    const parsed = parsePointFromSearch(locationRef.search);
    if (parsed.kind === "valid") {
      collect(parsed.checkpointId);
      removePointFromUrl();
    } else if (parsed.kind === "invalid") {
      showNotice("このQRコードはスタンプラリーでは使えないようです", "error", documentRef);
      removePointFromUrl();
    }
  }

  documentRef.querySelector("[data-action='reset-stamps']")?.addEventListener("click", () => {
    if (previewStamps) {
      showNotice("プレビューモードでは保存データを変更しません", "info", documentRef);
      return;
    }
    if (!window.confirm("このグループのスタンプをすべて削除します。よろしいですか？")) return;
    clearStamps(groupId, storage);
    stamps = [];
    renderStampRally({ documentRef, stamps });
    showNotice("このグループのスタンプをリセットしました", "info", documentRef);
  });

  documentRef.querySelector("[data-action='scan-qr']")?.addEventListener("click", () => {
    void openQrScanner({
      onDetected: collect,
      onInvalid: () =>
        showNotice("このQRコードはスタンプラリーでは使えないようです", "error", documentRef),
    });
  });

  void registerPwa();
  return { groupId, previewMode, stamps: () => [...stamps] };
};

if (typeof document !== "undefined" && document.body?.dataset.group) {
  initStampRally();
}
