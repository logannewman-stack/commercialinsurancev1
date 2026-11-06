import { COMPANY } from "../config.js";

/*
  The company's logo from src/brand.js, or a "Your logo here" placeholder until one is set.
  compact: the short placeholder used inside the small product screens.
*/
export function LogoMark({ className = "", compact = false }) {
  if (COMPANY.logo) return <img className={`logo-img ${className}`} src={COMPANY.logo} alt="" />;
  return (
    <span className={`logo-slot ${compact ? "compact " : ""}${className}`} aria-hidden="true">
      {compact ? "Logo" : <><span className="ls-long">Your logo here</span><span className="ls-short">Logo</span></>}
    </span>
  );
}

export default function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      {!(COMPANY.logo && COMPANY.logoHasName) && <span className="wordmark">{COMPANY.name}</span>}
    </span>
  );
}
