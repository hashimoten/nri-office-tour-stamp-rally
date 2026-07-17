import { eventContent } from "../config/content";
import { BrandMark } from "./BrandMark";

export const AppHeader = () => (
  <header className="app-header">
    <div className="app-header__inner">
      <BrandMark />
      <div className="app-header__divider" aria-hidden="true" />
      <h1 className="app-header__title">{eventContent.appTitle}</h1>
    </div>
  </header>
);

