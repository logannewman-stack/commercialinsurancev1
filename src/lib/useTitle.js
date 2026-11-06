import { useEffect } from "react";
import { COMPANY } from "../config.js";

const DEFAULT_TITLE = `${COMPANY.name} · ${COMPANY.tagline.replace(/\.$/, "")}`;
const DEFAULT_DESC = "Compare commercial insurance quotes from top-rated carriers with one application.";

/* Sets the browser tab title and meta description for the current page. */
export function useTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} · ${COMPANY.name}` : DEFAULT_TITLE;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description || DEFAULT_DESC);
  }, [title, description]);
}
