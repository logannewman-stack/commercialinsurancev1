import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "./Logo.jsx";

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
  const [open, setOpen] = useState(false);
  const toSection = useSectionLink();
  const { pathname } = useLocation();
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
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
    <header className={`site-header${scrolled ? " scrolled" : ""}`}>
      <div className="wrap header-row">
        <Link to="/" className="logo-link" aria-label="Keel home"><Logo /></Link>
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
          <motion.nav className="mobile-nav" aria-label="Mobile" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <div className="wrap">
              {LINKS.map((l) => <a key={l.id} href={`#${l.id}`} onClick={(e) => { setOpen(false); toSection(l.id)(e); }}>{l.label}</a>)}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
