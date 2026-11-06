/*
  Company details shown across the site. Fill these in before launch.
  Anything left empty is hidden instead of showing a placeholder.
*/
export const COMPANY = {
  name: "Keel",
  legalName: "Keel Insurance Services",
  tagline: "Commercial insurance, compared.",
  supportEmail: "", // e.g. "hello@keel.insure"
  supportPhone: "", // e.g. "(512) 555-0123"
  licenseLine: "", // e.g. "Licensed insurance agency · TX License #1234567"
  domain: "", // e.g. "https://keel.insure"
};

/* True only in the claude.ai preview build, where there is no backend. */
export const IS_PREVIEW = import.meta.env.VITE_PREVIEW === "1";

/*
  Keep true while quotes come from the demo engine (src/lib/pricing.js).
  Set to false once real carrier quotes are connected; this removes the
  "sample estimates" labels across the site.
*/
export const DEMO_QUOTES = true;
