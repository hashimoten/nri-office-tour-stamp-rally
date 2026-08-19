(function () {
  // 右側が画面に表示するグループ名です。
  // 左側の team-a などはスタンプ保存用の内部IDなので変更しないでください。
  const teamNames = Object.freeze({
    "team-a": "イチゴ",
    "team-b": "ブドウ",
    "team-c": "ミカン",
    "team-d": "レモン",
    "team-e": "リンゴ",
    "team-f": "バナナ",
    "team-g": "メロン",
    "team-h": "キウイ",
    "team-i": "スイカ",
    "team-j": "パイン",
    "team-k": "ライチ",
    "team-l": "ザクロ",
    "team-m": "アンズ",
    "team-n": "ビワ",
    "team-o": "モモ",
    "team-p": "カキ",
    "team-q": "ナシ",
    "team-r": "ユズ",
    "team-s": "イチジク",
    "team-t": "マンゴー",
    "team-u": "パパイヤ",
    "team-v": "サクランボ",
    "team-w": "ラズベリー",
  });

  const getTeamName = (groupId) => teamNames[groupId] ?? "";

  const applyTeamNames = (documentRef = document) => {
    documentRef.querySelectorAll("[data-select-group]").forEach((element) => {
      const name = getTeamName(element.dataset.selectGroup);
      if (name) element.textContent = name;
    });

    const currentName = getTeamName(documentRef.body?.dataset.group);
    if (!currentName) return;

    documentRef.querySelectorAll("[data-role='team-name']").forEach((element) => {
      element.textContent = currentName;
    });
  };

  window.NriTeamNames = Object.freeze({ teamNames, getTeamName, applyTeamNames });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => applyTeamNames());
  } else {
    applyTeamNames();
  }
})();
