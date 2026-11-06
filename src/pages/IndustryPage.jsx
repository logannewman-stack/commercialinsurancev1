import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import NotFound from "./NotFound.jsx";
import { INDUSTRY_PAGE, INDUSTRY_PAGES } from "../data/industryPages.js";
import { BUSINESS_TYPES, CLASS } from "../data/industries.js";
import { LINE, recommend } from "../data/coverage.js";
import { useQuote } from "../lib/store.jsx";
import { useTitle } from "../lib/useTitle.js";
import { Reveal, Spotlight, Words } from "../components/fx.jsx";

const GENERAL_FAQS = [
  ["How does Keel make money?", "Carriers pay Keel a commission when you buy a policy. Your price is the same as going to the carrier directly, and comparing is free."],
  ["How fast can coverage start?", "Often the same day. Once you choose a quote, a licensed advisor confirms the details, you sign and pay online, and your certificate of insurance arrives by email."],
];

export default function IndustryPage() {
  const { slug } = useParams();
  const page = INDUSTRY_PAGE[slug];
  const { setA } = useQuote();
  const navigate = useNavigate();
  useTitle(page ? page.name : "Page not found", page ? page.intro : undefined);
  if (!page) return <NotFound />;

  const c = CLASS[page.cls];
  const recs = recommend({ industry: page.cls, space: "lease", employees: "2-5" });
  const types = BUSINESS_TYPES.filter((b) => b.cls === page.cls);
  const start = (bt) => {
    setA({ industry: page.cls, businessType: bt ? bt.label : "", recFor: null, ...(bt?.space ? { space: bt.space } : {}) });
    navigate("/quote/zip");
  };

  return (
    <main className="ind-page">
      <section className="hero ind-hero">
        <div className="aurora" aria-hidden="true"><i /><i /><i /></div>
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <nav className="crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span>{page.name}</span></nav>
            <p className="eyebrow marked">Insurance for {c.plural}</p>
            <Words className="display display-sm" text={page.h1} />
            <p className="lede">{page.intro}</p>
            <div className="hero-cta">
              <button type="button" className="btn btn-primary btn-lg" onClick={() => start()}>Get your quotes <ArrowRight size={18} aria-hidden="true" /></button>
              <span className="hero-note">About 3 minutes · Free to compare</span>
            </div>
            <div className="types">
              <p className="col-title">Start with your type of business</p>
              <div className="quick">{types.map((t) => <button type="button" key={t.label} className="chip-btn" onClick={() => start(t)}>{t.label}</button>)}</div>
            </div>
          </div>
          <Reveal as="aside" delay={0.3} className="carry-card" aria-label={`Coverage ${c.plural} usually carry`}>
            <p className="eyebrow">What {c.plural} usually carry</p>
            <ul className="carry-list">
              {recs.map((id) => (
                <li key={id}>
                  <span className="carry-name">{LINE[id].name}{LINE[id].abbr && <span className="cov-abbr">{LINE[id].abbr}</span>}</span>
                  <span className="carry-desc">{LINE[id].desc}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn-accent btn-block" onClick={() => start()}>Compare quotes <ArrowRight size={16} aria-hidden="true" /></button>
          </Reveal>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="block-head">
            <div><p className="eyebrow">Common risks</p><h2 className="h2">What {c.plural} need protection from.</h2></div>
          </div>
          <div className="risk-grid">
            {page.risks.map(([t, d], i) => <Reveal className="risk" key={t} delay={i * 0.07}><h3>{t}</h3><p>{d}</p></Reveal>)}
          </div>
          <Reveal className="ex-claim claim-wide"><p className="col-title">Example claim</p><p>{page.claim}</p></Reveal>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="block-head">
            <div><p className="eyebrow">Coverage</p><h2 className="h2">The coverage, explained.</h2></div>
            <p className="lede">Keel pre-selects these when you start a quote. You can add or remove anything before you compare.</p>
          </div>
          <div className="cov-cards">
            {recs.map((id, i) => (
              <Reveal key={id} delay={i * 0.08}><Spotlight className="cov-card">
                <h3>{LINE[id].name}</h3>
                <p className="muted">{LINE[id].desc}</p>
                <ul className="ticks-list">{LINE[id].covers.map((t) => <li key={t}><Check size={15} aria-hidden="true" />{t}</li>)}</ul>
              </Spotlight></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap faq-grid">
          <div><p className="eyebrow">FAQ</p><h2 className="h2">{page.name} questions.</h2></div>
          <div className="faq">
            {[...page.faqs, ...GENERAL_FAQS].map(([q, ans], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{ans}</p></details>)}
          </div>
        </div>
      </section>

      <section className="cta-band ind-cta">
        <div className="aurora dark" aria-hidden="true"><i /><i /><i /></div>
        <div className="wrap cta-row">
          <div><p className="eyebrow">{page.name}</p><h2 className="h2">See what your business should be paying.</h2></div>
          <button type="button" className="btn btn-accent btn-lg" onClick={() => start()}>Get your quotes <ArrowRight size={18} aria-hidden="true" /></button>
        </div>
      </section>

      <section className="block other-block">
        <div className="wrap">
          <p className="col-title">Other industries</p>
          <div className="quick">
            {INDUSTRY_PAGES.filter((p) => p.slug !== slug).map((p) => <Link key={p.slug} to={`/insurance/${p.slug}`} className="chip-btn">{p.name}</Link>)}
          </div>
        </div>
      </section>
    </main>
  );
}
