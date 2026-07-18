import { afterEach } from "vitest";

afterEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
  document.body.removeAttribute("data-group");
  window.history.replaceState({}, "", "/");
});
