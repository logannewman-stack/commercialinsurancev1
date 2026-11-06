import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import { useSectionLink } from "./Header.jsx";
import { COMPANY, DEMO_QUOTES } from "../config.js";
import { INDUSTRY_PAGES } from "../data/industryPages.js";

export default function Footer() {
  const toSection = useSectionLink();
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Logo />
          <p className="footer-tag">{COMPANY.tagline}</p>
          {(COMPANY.supportEmail || COMPANY.supportPhone) && (
            <p className="footer-contact">{[COMPANY.supportPhone, COMPANY.supportEmail].filter(Boolean).join(" · ")}</p>
          )}
        </div>
        <nav className="footer-col" aria-label="Product">
          <p className="col-title">Product</p>
          <Link to="/quote">Get a quote</Link>
          <a href="#how" onClick={toSection("how")}>How it works</a>
        </nav>
        <nav className="footer-col" aria-label="Industries">
          <p className="col-title">Industries</p>
          {INDUSTRY_PAGES.slice(0, 6).map((p) => <Link key={p.slug} to={`/insurance/${p.slug}`}>{p.name.replace(" insurance", "")}</Link>)}
          <a href="#industries" onClick={toSection("industries")}>All industries</a>
        </nav>
        <nav className="footer-col" aria-label="Learn">
          <p className="col-title">Learn</p>
          <a href="#coverage" onClick={toSection("coverage")}>Coverage guide</a>
          <a href="#faq" onClick={toSection("faq")}>FAQ</a>
          <a href="#why" onClick={toSection("why")}>How we get paid</a>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
        <p className="fine footer-fine">
          © {new Date().getFullYear()} {COMPANY.legalName}. {COMPANY.licenseLine ? COMPANY.licenseLine + ". " : ""}
          Keel is an independent insurance agency. Coverage is provided by the carrier you choose and is subject to its underwriting and policy terms.
          {DEMO_QUOTES ? " Quotes on this site are sample estimates from demo carriers until carrier connections go live." : ""}
        </p>
      </div>
      <div className="footer-giant" aria-hidden="true"><span>keel</span></div>
    </footer>
  );
}
