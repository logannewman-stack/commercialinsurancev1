import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "./Logo.jsx";
import { COMPANY } from "../config.js";

const LINKS = [
  { id: "how", label: "How it works" },
  { id: "industries", label: "Industries" },
  { id: "coverage", label: "Coverage" },
  { id: "faq", label: "FAQ" },
];

export function useSectionLink() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (id) => (e) => {
    e?.preventDefault();
    const go = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (pathname !== "/") { navigate("/"); setTimeout(go, 60); } else go();
  };
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const toSection = useSectionLink();
  const { pathname } = useLocation();
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      // Tuck the nav away while reading downward; bring it back on any upward scroll.
      if (y > 160 && y > last + 6) setHidden(true);
      else if (y < last - 6 || y < 160) setHidden(false);
      last = y;
    };
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const k = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  return (
    <header className={`site-header${scrolled ? " scrolled" : ""}${hidden && !open ? " tucked" : ""}`}>
      <div className="nav-pill">
        <Link to="/" className="logo-link" aria-label={`${COMPANY.name} home`}><Logo /></Link>
        <nav className="nav" aria-label="Main">
          {LINKS.map((l) => <a key={l.id} href={`#${l.id}`} onClick={toSection(l.id)}>{l.label}</a>)}
        </nav>
        <div className="header-actions">
          <Link to="/quote" className="btn btn-primary btn-sm">Get a quote</Link>
          <button type="button" className="icon-btn menu-btn" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav className="mobile-nav" aria-label="Mobile" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.2 }}>
            {LINKS.map((l) => <a key={l.id} href={`#${l.id}`} onClick={(e) => { setOpen(false); toSection(l.id)(e); }}>{l.label}</a>)}
            <Link to="/quote" className="btn btn-primary btn-block" onClick={() => setOpen(false)}>Get a quote</Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
