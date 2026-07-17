import { useState } from "react";
import { eventContent } from "../content";

export const BrandMark = () => {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const logoSource = `${import.meta.env.BASE_URL}brand/nri-logo.svg`;

  return (
    <div className="brand-mark">
      <img
        className={`brand-mark__image${logoLoaded ? " brand-mark__image--visible" : ""}`}
        src={logoSource}
        alt={logoLoaded ? eventContent.brandLabel : ""}
        aria-hidden={!logoLoaded}
        onLoad={() => setLogoLoaded(true)}
        onError={() => setLogoLoaded(false)}
      />
      {!logoLoaded && (
        <span className="brand-mark__text">{eventContent.brandLabel}</span>
      )}
    </div>
  );
};
