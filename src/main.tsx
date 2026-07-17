import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { App } from "./App";
import "./theme/theme.css";
import "./theme/animations.css";
import { applyEventTheme } from "./theme/eventTheme";

applyEventTheme();
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
