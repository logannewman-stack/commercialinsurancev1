import { useEffect } from "react";

const DEFAULT_TITLE = "Keel · Commercial insurance, compared";
const DEFAULT_DESC = "Compare commercial insurance quotes from top-rated carriers with one application.";

/* Sets the browser tab title and meta description for the current page. */
export function useTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} · Keel` : DEFAULT_TITLE;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description || DEFAULT_DESC);
  }, [title, description]);
}
