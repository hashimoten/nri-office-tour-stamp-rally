(function () {
  // 家族名が決まったら、右側の "TEAM A" などだけを書き換えてください。
  // 左側の team-a などは、スタンプ保存に使うため変更しないでください。
  const teamNames = Object.freeze({
    "team-a": "テスト A",
    "team-b": "TEAM B",
    "team-c": "TEAM C",
    "team-d": "TEAM D",
    "team-e": "TEAM E",
    "team-f": "TEAM F",
    "team-g": "TEAM G",
    "team-h": "TEAM H",
    "team-i": "TEAM I",
    "team-j": "TEAM J",
    "team-k": "TEAM K",
    "team-l": "TEAM L",
    "team-m": "TEAM M",
    "team-n": "TEAM N",
    "team-o": "TEAM O",
    "team-p": "TEAM P",
    "team-q": "TEAM Q",
    "team-r": "TEAM R",
    "team-s": "TEAM S",
    "team-t": "TEAM T",
    "team-u": "TEAM U",
    "team-v": "TEAM V",
    "team-w": "TEAM W",
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
