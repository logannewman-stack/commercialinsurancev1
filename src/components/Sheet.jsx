import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

/* Drawer (side on desktop, bottom on phones) or centered modal. */
export default function Sheet({ open, onClose, title, kind = "drawer", children, footer, wide = false }) {
  const panel = useRef(null);
  const last = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    last.current = document.activeElement;
    document.documentElement.classList.add("lock-scroll");
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    setTimeout(() => panel.current?.querySelector("[data-autofocus], button, a, input")?.focus(), 30);
    return () => { window.removeEventListener("keydown", k); document.documentElement.classList.remove("lock-scroll"); last.current?.focus?.(); };
  }, [open, onClose]);

  const desktopDrawer = { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } };
  const modal = { initial: { opacity: 0, y: 24, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 16, scale: 0.98 } };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className={`sheet sheet-${kind}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div
            ref={panel}
            className={`sheet-panel${wide ? " wide" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            {...(kind === "drawer" ? desktopDrawer : modal)}
            transition={{ type: "spring", stiffness: 420, damping: 40 }}
          >
            <div className="sheet-top">
              <p className="sheet-title">{title}</p>
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="sheet-body">{children}</div>
            {footer && <div className="sheet-foot">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
