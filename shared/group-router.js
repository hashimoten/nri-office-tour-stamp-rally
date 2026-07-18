import { ACTIVE_GROUP_KEY } from "./storage.js";
import { registerPwa } from "./pwa.js";

export const groupIds = Object.freeze(["team-a", "team-b", "team-c", "team-d"]);
const groupIdSet = new Set(groupIds);

export const isGroupId = (value) => groupIdSet.has(value);

export const loadActiveGroup = (storage = window.localStorage) => {
  try {
    const groupId = storage.getItem(ACTIVE_GROUP_KEY);
    if (isGroupId(groupId)) return groupId;
    if (groupId !== null) storage.removeItem(ACTIVE_GROUP_KEY);
  } catch {
    // Storage may be disabled. The selection page remains usable.
  }
  return null;
};

export const saveActiveGroup = (groupId, storage = window.localStorage) => {
  if (!isGroupId(groupId)) return false;
  try {
    storage.setItem(ACTIVE_GROUP_KEY, groupId);
    return true;
  } catch {
    return false;
  }
};

export const buildGroupUrl = (groupId, currentUrl = window.location.href) => {
  if (!isGroupId(groupId)) return null;

  const current = new URL(currentUrl);
  const base = new URL("./", current);
  const target = new URL(`groups/${groupId}/`, base);
  const point = current.searchParams.get("point");
  if (point !== null) target.searchParams.set("point", point);
  return target;
};

export const startGroupRouter = ({
  documentRef = document,
  locationRef = window.location,
  storage = window.localStorage,
  navigate = (url) => locationRef.replace(url.href),
} = {}) => {
  void registerPwa();
  const savedGroup = loadActiveGroup(storage);
  if (savedGroup) {
    const target = buildGroupUrl(savedGroup, locationRef.href);
    if (target) navigate(target);
    return { redirected: true, groupId: savedGroup };
  }

  for (const choice of documentRef.querySelectorAll("[data-select-group]")) {
    choice.addEventListener("click", (event) => {
      const groupId = choice.dataset.selectGroup;
      if (!isGroupId(groupId)) return;
      event.preventDefault();
      saveActiveGroup(groupId, storage);
      const target = buildGroupUrl(groupId, locationRef.href);
      if (target) navigate(target);
    });
  }

  return { redirected: false, groupId: null };
};

if (typeof document !== "undefined" && document.querySelector("[data-role='group-list']")) {
  startGroupRouter();
}
