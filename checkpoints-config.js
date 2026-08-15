(function () {
  // チェックポイントの追加・削除は、この配列だけを編集してください。
  const checkpoints = [
    {
      id: "entrance",
      name: "エントランス",
      icon: "🚪",
      description: "NRIオフィス探検のスタート地点",
    },
    {
      id: "meeting-room",
      name: "会議室",
      icon: "💬",
      description: "アイデアを話し合う場所",
    },
    {
      id: "office",
      name: "執務エリア",
      icon: "🏢",
      description: "社員のみなさんが働く場所",
    },
    {
      id: "cafeteria",
      name: "カフェテリア",
      icon: "☕",
      description: "ほっとひと息つく場所",
    },
    {
      id: "training-room",
      name: "研修室",
      icon: "✏️",
      description: "新しいことを学ぶ場所",
    },
  ];

  const applyDirectFilePreview = (documentRef = document, checkpointList = checkpoints) => {
    const list = documentRef.querySelector("[data-role='stamp-list']");
    const progress = documentRef.querySelector("[data-role='progress']");
    if (!list || !progress) return;

    const cards = [...list.querySelectorAll(".stamp-card")];
    const template = cards[0];
    if (!template && checkpointList.length > 0) return;

    while (cards.length > checkpointList.length) cards.pop().remove();
    while (cards.length < checkpointList.length) {
      const card = template.cloneNode(true);
      list.append(card);
      cards.push(card);
    }

    cards.forEach((card, index) => {
      const checkpoint = checkpointList[index];
      card.classList.remove("stamp-card--collected");
      card.classList.add("stamp-card--uncollected");
      card.setAttribute("aria-label", `${checkpoint.name} 未取得`);
      card.querySelector(".stamp-sequence").textContent = String(index + 1).padStart(2, "0");
      card.querySelector(".stamp-icon").textContent = checkpoint.icon;
      card.querySelector(".stamp-name").textContent = checkpoint.name;
      card.querySelector(".stamp-status").textContent = "まだだよ";
      card.querySelector(".stamp-description").textContent = checkpoint.description;
      card.querySelector(".stamp-date").textContent = "QRコードを見つけて読み取ろう";
      card.querySelector(".stamp-imprint").hidden = true;
    });

    progress.querySelector(".progress-copy strong").textContent = `0 / ${checkpointList.length}個`;
    progress.querySelector(".progress-copy span").textContent = "0%";
    const progressBar = progress.querySelector(".progress-bar");
    progressBar.setAttribute("aria-valuemax", String(checkpointList.length));
    progressBar.setAttribute("aria-valuenow", "0");
    progress.querySelector(".progress-fill").style.width = "0%";
  };

  globalThis.NriCheckpointConfig = Object.freeze({
    checkpoints: Object.freeze(checkpoints.map((checkpoint) => Object.freeze(checkpoint))),
    applyDirectFilePreview,
  });

  if (typeof document !== "undefined") applyDirectFilePreview();
})();
