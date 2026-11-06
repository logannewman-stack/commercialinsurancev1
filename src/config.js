/* Company name, logo and contact details live in src/brand.js. */
import { BRAND } from "./brand.js";
export const COMPANY = BRAND;

/* True only in the claude.ai preview build, where there is no backend. */
export const IS_PREVIEW = import.meta.env.VITE_PREVIEW === "1";

/*
  Keep true while quotes come from the demo engine (src/lib/pricing.js).
  Set to false once real carrier quotes are connected; this removes the
  "sample estimates" labels across the site.
*/
export const DEMO_QUOTES = true;
