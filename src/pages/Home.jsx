import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, Briefcase, Building2, Car, Check, Dumbbell, HardHat, Laptop, Minus, Scissors, SprayCan, Stethoscope, Store, Truck, Utensils, X,
} from "lucide-react";
import BusinessSearch from "../components/BusinessSearch.jsx";
import HeroLedger from "../components/HeroLedger.jsx";
import { CLASS } from "../data/industries.js";
import { EXPLORER, LINE, recommend } from "../data/coverage.js";
import { isComplete, useQuote } from "../lib/store.jsx";
import { useTitle } from "../lib/useTitle.js";
import { PAGE_FOR_CLASS } from "../data/industryPages.js";

const INDUSTRY_CARDS = [
  ["restaurant", Utensils], ["contractor", HardHat], ["retail", Store], ["professional", Briefcase],
  ["tech", Laptop], ["healthcare", Stethoscope], ["beauty", Scissors], ["fitness", Dumbbell],
  ["cleaning", SprayCan], ["autoservice", Car], ["realestate", Building2], ["transport", Truck],
];

const STEP_NAMES = { industry: "business type", zip: "location", space: "your space", revenue: "revenue", team: "team size", history: "history", coverage: "coverage", contact: "your details" };

function useStart() {
  const { setA } = useQuote();
  const navigate = useNavigate();
  return (patch) => { setA({ ...patch, recFor: null }); navigate("/quote/zip"); };
}

function Hero() {
  const start = useStart();
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="eyebrow marked">Commercial insurance, compared</p>
          <h1 className="display">Stop overpaying for business insurance.</h1>
          <p className="lede">Tell us about your business once. Keel collects quotes from top-rated carriers, lines them up side by side, and shows you the best coverage for the lowest price.</p>
          <BusinessSearch label="What kind of business do you run?" placeholder="Try café, plumber or dentist" onPick={(b) => start({ industry: b.cls, businessType: b.label, ...(b.space ? { space: b.space } : {}) })} />
          <ul className="hero-facts">
            <li><Check size={15} aria-hidden="true" /> About 3 minutes</li>
            <li><Check size={15} aria-hidden="true" /> Free to compare</li>
            <li><Check size={15} aria-hidden="true" /> No sales calls</li>
          </ul>
        </div>
        <HeroLedger />
      </div>
    </section>
  );
}

function How() {
  return (
    <section className="block" id="how">
      <div className="wrap">
        <div className="block-head">
          <div><p className="eyebrow">How it works</p><h2 className="h2">One application. Every quote side by side.</h2></div>
          <p className="lede">Shopping for business insurance usually means calling agent after agent and filling out the same forms again. Keel does the shopping for you.</p>
        </div>
        <ol className="steps">
          <li className="step">
            <div className="vignette" aria-hidden="true">
              <p className="v-q">How many people work for the business?</p>
              <div className="v-chips"><span>Just me</span><span className="on">2–5</span><span>6–10</span><span>11–25</span></div>
              <div className="v-progress"><i style={{ width: "62%" }} /></div>
            </div>
            <span className="step-n">01</span>
            <h3>Tell us about your business</h3>
            <p>Your industry, location, building, revenue, team and the coverage you need. About three minutes, one time.</p>
          </li>
          <li className="step">
            <div className="vignette" aria-hidden="true">
              {["Everstone Indemnity", "Ashgrove Mutual", "Bellmoor Casualty"].map((n, i) => (
                <div className="v-row" key={n}><span>{n}</span>{i < 2 ? <span className="v-ok"><Check size={13} /> Quoted</span> : <span className="v-wait"><span className="pulse" /> Requesting</span>}</div>
              ))}
            </div>
            <span className="step-n">02</span>
            <h3>We shop the carriers</h3>
            <p>Keel sends your details to the carriers that insure businesses like yours and collects their quotes in one place.</p>
          </li>
          <li className="step">
            <div className="vignette" aria-hidden="true">
              <div className="v-pick">
                <div><span className="badge best">Best value</span><p className="v-name">Everstone Indemnity</p><p className="v-sub">A+ rated · 3 coverages</p></div>
                <p className="v-price">$412<small>/mo</small></p>
              </div>
              <div className="v-btn">Choose this quote</div>
            </div>
            <span className="step-n">03</span>
            <h3>Compare and choose</h3>
            <p>See price and coverage side by side, ranked by value. Pick one, and a licensed advisor finalizes your policy.</p>
          </li>
        </ol>
      </div>
    </section>
  );
}

function Industries() {
  const start = useStart();
  return (
    <section className="block" id="industries">
      <div className="wrap">
        <div className="block-head">
          <div><p className="eyebrow">Industries</p><h2 className="h2">Coverage that fits how you work.</h2></div>
          <p className="lede">Pick your industry and we’ll pre-select the coverage businesses like yours usually carry. You can change anything.</p>
        </div>
        <div className="ind-grid">
          {INDUSTRY_CARDS.map(([id, Icon]) => {
            const c = CLASS[id];
            const recs = recommend({ industry: id, space: "lease", employees: "2-5" });
            return (
              <div key={id} className="ind-card">
                <Link to={`/insurance/${PAGE_FOR_CLASS[id].slug}`} className="ind-main">
                  <span className="ind-icon"><Icon size={20} strokeWidth={1.75} aria-hidden="true" /></span>
                  <span className="ind-name">{c.label}</span>
                  <span className="ind-cov">{recs.map((r) => LINE[r].abbr || LINE[r].short).join(" · ")}</span>
                </Link>
                <button type="button" className="ind-go" onClick={() => start({ industry: id, businessType: "" })}>
                  Get quotes <ArrowRight size={14} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CoverageExplorer() {
  const [sel, setSel] = useState("gl");
  const l = LINE[sel];
  return (
    <section className="block" id="coverage">
      <div className="wrap">
        <div className="block-head">
          <div><p className="eyebrow">Coverage guide</p><h2 className="h2">Commercial coverage, in plain English.</h2></div>
          <p className="lede">What each policy pays for, what it doesn’t, and who usually needs it.</p>
        </div>
        <div className="explorer">
          <div className="ex-list" role="tablist" aria-label="Coverage types">
            {EXPLORER.map((id) => (
              <button key={id} type="button" role="tab" aria-selected={sel === id} className={sel === id ? "on" : ""} onClick={() => setSel(id)}>
                <span>{LINE[id].name}</span>{LINE[id].abbr && <span className="ex-abbr">{LINE[id].abbr}</span>}
              </button>
            ))}
          </div>
          <div className="ex-panel" role="tabpanel">
            <AnimatePresence mode="wait">
              <motion.div key={sel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <h3 className="ex-title">{l.name}</h3>
                <p className="ex-desc">{l.desc}</p>
                <div className="ex-cols">
                  <div>
                    <p className="col-title">What it covers</p>
                    <ul className="ticks-list">{l.covers.map((t) => <li key={t}><Check size={15} aria-hidden="true" />{t}</li>)}</ul>
                  </div>
                  <div>
                    <p className="col-title">What it doesn’t</p>
                    <ul className="ticks-list muted">{l.excludes.map((t) => <li key={t}><Minus size={15} aria-hidden="true" />{t}</li>)}</ul>
                  </div>
                </div>
                <div className="ex-claim"><p className="col-title">Example claim</p><p>{l.example}</p></div>
                <p className="ex-who"><span className="col-title">Who needs it</span>{l.who}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function Why() {
  const items = [
    ["Same price as going direct", "Carriers pay Keel a commission when you buy a policy. You never pay a fee to compare quotes or talk to an advisor."],
    ["Ranked by value, not by who pays us most", "Quotes are ranked by price and each carrier’s financial strength rating, so the cheapest option isn’t automatically on top."],
    ["Your details stay yours", "We share your application only with carriers that can quote you. We don’t sell your information."],
    ["Advisors when you want one", "A licensed advisor reviews every policy before it’s issued, and helps later with certificates, changes and claims."],
  ];
  return (
    <section className="block" id="why">
      <div className="wrap">
        <div className="block-head">
          <div><p className="eyebrow">Why Keel</p><h2 className="h2">Built for business owners, not call centers.</h2></div>
        </div>
        <div className="why-grid">
          {items.map(([t, d], i) => (
            <div className="why" key={t}><span className="step-n">{String(i + 1).padStart(2, "0")}</span><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  ["Is Keel an insurance company?", "No. Keel is an independent insurance agency. We compare quotes from insurance carriers and help you buy the policy. The carrier you choose is the one that insures you and pays claims."],
  ["Does it cost anything to use Keel?", "No. Carriers pay us a commission when you buy a policy. Your premium is the same as it would be if you went to the carrier directly."],
  ["What do I need to get a quote?", "Just the basics: what your business does, where it’s located, your expected revenue and how many people work there. For the final policy, an advisor may ask for details like your FEIN or your current policy."],
  ["How accurate are the quotes?", "Quotes are based on your answers. The carrier confirms the final price when it reviews your application, so the more accurate your answers, the closer the quote."],
  ["How fast can my coverage start?", "Often the same day. Once you pick a quote, an advisor confirms the details, you sign and pay online, and your certificate of insurance is emailed to you."],
  ["Will I get flooded with calls?", "No. An advisor contacts you only after you choose a quote or ask for help."],
  ["I already have insurance. Should I still compare?", "Yes. Rates change every year. If we find a better price, we can start the new policy the day your current one renews, so there’s no gap in coverage."],
];

function Faq() {
  return (
    <section className="block" id="faq">
      <div className="wrap faq-grid">
        <div><p className="eyebrow">FAQ</p><h2 className="h2">Questions, answered.</h2></div>
        <div className="faq">
          {FAQS.map(([q, ans], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{ans}</p></details>)}
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="cta-band">
      <div className="wrap cta-row">
        <div><p className="eyebrow">Ready when you are</p><h2 className="h2">See what your business should be paying.</h2></div>
        <Link to="/quote" className="btn btn-accent btn-lg">Get your quotes <ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

function ResumeToast() {
  const { a, step } = useQuote();
  const [hidden, setHidden] = useState(false);
  if (hidden || !a.industry || !step || isComplete(a)) return null;
  const label = a.businessType || CLASS[a.industry]?.short;
  return (
    <motion.div className="toast" role="status" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
      <div><p className="toast-title">Finish your quote</p><p className="toast-sub">{label} · next up: {STEP_NAMES[step] || "details"}</p></div>
      <Link to={`/quote/${step}`} className="btn btn-primary btn-sm">Resume</Link>
      <button type="button" className="icon-btn icon-sm" aria-label="Dismiss" onClick={() => setHidden(true)}><X size={15} /></button>
    </motion.div>
  );
}

export default function Home() {
  useTitle(null);
  return (
    <main>
      <Hero />
      <How />
      <Industries />
      <CoverageExplorer />
      <Why />
      <Faq />
      <Cta />
      <ResumeToast />
    </main>
  );
}
