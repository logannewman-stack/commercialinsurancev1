import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowRight, Briefcase, Building2, Car, Check, Dumbbell, HardHat, Laptop, Minus, Scissors, SprayCan, Stethoscope, Store, Truck, Utensils, X,
} from "lucide-react";
import BusinessSearch from "../components/BusinessSearch.jsx";
import ProductWindow from "../components/ProductWindow.jsx";
import Tour from "../components/Tour.jsx";
import Features from "../components/Features.jsx";
import PhoneRow from "../components/PhoneRow.jsx";
import { SAMPLE } from "../data/sample.js";
import { Counter, Reveal, ScrollLit, Spotlight, Words } from "../components/fx.jsx";
import { BUSINESS_TYPES, CLASS } from "../data/industries.js";
import { EXPLORER, LINE, recommend } from "../data/coverage.js";
import { PAGE_FOR_CLASS } from "../data/industryPages.js";
import { computeQuotes, SORTS } from "../lib/pricing.js";
import { money } from "../lib/format.js";
import { DEFAULT_OPTIONS, isComplete, useQuote } from "../lib/store.jsx";
import { useTitle } from "../lib/useTitle.js";
import { DEMO_QUOTES } from "../config.js";

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
    <section className="hero2">
      <div className="aurora" aria-hidden="true"><i /><i /><i /></div>
      <div className="wrap hero2-inner">
        <Reveal><p className="pill-eyebrow"><span className="pe-dot" />Commercial insurance, compared</p></Reveal>
        <Words className="mega" text="Stop overpaying for business insurance." mark={1} />
        <Reveal delay={0.45}>
          <p className="lede hero2-lede">Tell us about your business once. Keel collects quotes from top-rated carriers, lines them up side by side, and shows you the best coverage for the lowest price.</p>
        </Reveal>
        <Reveal delay={0.6} className="hero2-search">
          <BusinessSearch label="What kind of business do you run?" placeholder="Try café, plumber or dentist"
            onPick={(b) => start({ industry: b.cls, businessType: b.label, ...(b.space ? { space: b.space } : {}) })} />
        </Reveal>
        <Reveal delay={0.66}>
          <Link to="/quote/upload" className="hero-upload"><span className="hu-icon" aria-hidden="true">↑</span> Already insured? <b>Upload your certificate or ACORD</b> and skip the questions <ArrowRight size={15} aria-hidden="true" /></Link>
        </Reveal>
        <Reveal delay={0.72}>
          <ul className="hero-facts center">
            <li><Check size={15} aria-hidden="true" /> About 3 minutes</li>
            <li><Check size={15} aria-hidden="true" /> Free to compare</li>
            <li><Check size={15} aria-hidden="true" /> No sales calls</li>
          </ul>
        </Reveal>
      </div>
      <Reveal delay={0.4} y={60} blur={0} className="wrap"><ProductWindow /></Reveal>
    </section>
  );
}

function SpreadChart() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const quotes = useMemo(() => [...computeQuotes(SAMPLE, DEFAULT_OPTIONS).quotes].sort(SORTS.price), []);
  const max = Math.max(...quotes.map((q) => q.monthly));
  const on = reduce || inView;
  return (
    <figure className="spread" ref={ref}>
      <figcaption>
        <p className="spread-title">Same café. {quotes.length} different prices.</p>
        <p className="spread-sub">Monthly quotes for one business: BOP, workers’ comp and liquor liability{DEMO_QUOTES ? " · sample carriers" : ""}</p>
      </figcaption>
      <ul className="spread-bars">
        {quotes.map((q, i) => (
          <li key={q.c.id} className={i === 0 ? "low" : ""}>
            <span className="sb-name">{q.c.name}</span>
            <span className="sb-val">{money(q.monthly)}</span>
            <span className="sb-track"><motion.i style={{ width: `${(q.monthly / max) * 100}%` }} initial={reduce ? false : { scaleX: 0 }} animate={on ? { scaleX: 1 } : undefined} transition={{ duration: 1.1, delay: 0.1 + i * 0.09, ease: [0.16, 1, 0.3, 1] }} /></span>
          </li>
        ))}
      </ul>
      <p className="spread-foot">Lowest to highest: <b>{money((quotes[quotes.length - 1].monthly - quotes[0].monthly) * 12)}</b> a year for the same coverage.</p>
    </figure>
  );
}

function Manifesto() {
  return (
    <section className="manifesto" aria-label="Why compare">
      <div className="spotlight-top" aria-hidden="true" />
      <div className="wrap">
        <Reveal><p className="eyebrow on-dark">Why compare</p></Reveal>
        <ScrollLit className="lit" text="Most business owners renew the same policy every year without shopping it. But carriers price the same business very differently, and the only way to know what you should pay is to compare." />
        <div className="mani-grid">
          <Reveal><SpreadChart /></Reveal>
          <div className="mani-copy">
            <Reveal><h3 className="mani-h">One application. Every price on the table.</h3></Reveal>
            <Reveal delay={0.1}><p className="mani-p">Keel puts the same application in front of every carrier that writes businesses like yours, so you see the whole spread instead of the one price you happened to get.</p></Reveal>
            <dl className="stats-dark">
              <div><dd><Counter to={8} /></dd><dt>Questions to answer</dt></div>
              <div><dd><Counter to={3} suffix=" min" /></dd><dt>Average time to compare</dt></div>
              <div><dd><Counter to={0} prefix="$" /></dd><dt>Cost to you, ever</dt></div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Industries() {
  const start = useStart();
  return (
    <section className="block" id="industries" aria-labelledby="ind-title">
      <div className="wrap">
        <div className="block-head">
          <div><Reveal><p className="eyebrow">Industries</p></Reveal><Words as="h2" id="ind-title" className="mega-2" text="Insurance for your industry." tail="Coverage picked for how you work." /></div>
          <Reveal delay={0.15}><p className="lede">Pick your industry and we’ll pre-select the coverage businesses like yours usually carry.</p></Reveal>
        </div>
        <div className="ind-grid">
          {INDUSTRY_CARDS.map(([id, Icon], i) => {
            const c = CLASS[id];
            const recs = recommend({ industry: id, space: "lease", employees: "2-5" });
            return (
              <Reveal key={id} delay={(i % 4) * 0.06}>
                <Spotlight className="ind-card">
                  <Link to={`/insurance/${PAGE_FOR_CLASS[id].slug}`} className="ind-main">
                    <span className="ind-icon"><Icon size={20} strokeWidth={1.75} aria-hidden="true" /></span>
                    <span className="ind-name">{c.label}</span>
                    <span className="ind-cov">{recs.map((r) => LINE[r].abbr || LINE[r].short).join(" · ")}</span>
                  </Link>
                  <button type="button" className="ind-go" onClick={() => start({ industry: id, businessType: "" })}>
                    Get quotes <ArrowRight size={14} aria-hidden="true" />
                  </button>
                </Spotlight>
              </Reveal>
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
    <section className="block" id="coverage" aria-labelledby="cov-title">
      <div className="wrap">
        <div className="block-head">
          <div><Reveal><p className="eyebrow">Coverage guide</p></Reveal><Words as="h2" id="cov-title" className="mega-2" text="Coverage, explained." tail="In plain English." /></div>
          <Reveal delay={0.15}><p className="lede">What each policy pays for, what it doesn’t, and who usually needs it.</p></Reveal>
        </div>
        <Reveal className="explorer">
          <div className="ex-list" role="tablist" aria-label="Coverage types">
            {EXPLORER.map((id) => (
              <button key={id} type="button" role="tab" aria-selected={sel === id} className={sel === id ? "on" : ""} onClick={() => setSel(id)}>
                <span>{LINE[id].name}</span>{LINE[id].abbr && <span className="ex-abbr">{LINE[id].abbr}</span>}
              </button>
            ))}
          </div>
          <div className="ex-panel" role="tabpanel">
            <AnimatePresence mode="wait">
              <motion.div key={sel} initial={{ opacity: 0, y: 10, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -6, filter: "blur(6px)" }} transition={{ duration: 0.25 }}>
                <h3 className="ex-title">{l.name}</h3>
                <p className="ex-desc">{l.desc}</p>
                <div className="ex-cols">
                  <div><p className="col-title">What it covers</p><ul className="ticks-list">{l.covers.map((t) => <li key={t}><Check size={15} aria-hidden="true" />{t}</li>)}</ul></div>
                  <div><p className="col-title">What it doesn’t</p><ul className="ticks-list muted">{l.excludes.map((t) => <li key={t}><Minus size={15} aria-hidden="true" />{t}</li>)}</ul></div>
                </div>
                <div className="ex-claim"><p className="col-title">Example claim</p><p>{l.example}</p></div>
                <p className="ex-who"><span className="col-title">Who needs it</span>{l.who}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const FAQS = [
  ["Is Keel an insurance company?", "No. Keel is an independent insurance agency. We compare quotes from insurance carriers and help you buy the policy. The carrier you choose is the one that insures you and pays claims."],
  ["Does it cost anything to use Keel?", "No. Carriers pay us a commission when you buy a policy. Your premium is the same as it would be if you went to the carrier directly."],
  ["What do I need to get a quote?", "Just the basics: what your business does, where it’s located, your expected revenue and how many people work there. For the final policy, an advisor may ask for details like your FEIN or your current policy."],
  ["How accurate are the quotes?", "Quotes are based on your answers. The carrier confirms the final price when it reviews your application, so the more accurate your answers, the closer the quote."],
  ["How does Keel rank quotes?", "Best value weighs each quote’s price against the carrier’s financial strength rating, so a slightly cheaper quote from a weaker carrier doesn’t automatically come first. You can also sort by lowest price or top rated."],
  ["How fast can my coverage start?", "Often the same day. Once you pick a quote, an advisor confirms the details, you sign and pay online, and your certificate of insurance is emailed to you."],
  ["Will I get flooded with calls?", "No. An advisor contacts you only after you choose a quote or ask for help."],
  ["I already have insurance. Should I still compare?", "Yes. Rates change every year. If we find a better price, we can start the new policy the day your current one renews, so there’s no gap in coverage."],
];

function Faq() {
  return (
    <section className="block" id="faq" aria-labelledby="faq-title">
      <div className="wrap faq-grid">
        <div><Reveal><p className="eyebrow">FAQ</p></Reveal><Words as="h2" id="faq-title" className="mega-2" text="Questions." tail="Answered." /></div>
        <Reveal className="faq">
          {FAQS.map(([q, ans], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{ans}</p></details>)}
        </Reveal>
      </div>
    </section>
  );
}

function Cta() {
  const start = useStart();
  return (
    <section className="cta2" aria-labelledby="cta-title">
      <div className="aurora dark" aria-hidden="true"><i /><i /><i /></div>
      <div className="wrap cta2-inner">
        <Reveal><p className="eyebrow on-dark">Ready when you are</p></Reveal>
        <Words as="h2" id="cta-title" className="mega on-dark" text="See what your business should be paying." />
        <Reveal delay={0.3} className="hero2-search">
          <BusinessSearch placeholder="Try café, plumber or dentist" onPick={(b) => start({ industry: b.cls, businessType: b.label, ...(b.space ? { space: b.space } : {}) })} />
        </Reveal>
        <Reveal delay={0.4}><p className="cta2-note">About 3 minutes · Free to compare · {BUSINESS_TYPES.length}+ business types</p></Reveal>
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
    <motion.div className="toast" role="status" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
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
      <Tour />
      <Features />
      <Manifesto />
      <PhoneRow />
      <Industries />
      <CoverageExplorer />
      <Faq />
      <Cta />
      <ResumeToast />
    </main>
  );
}
