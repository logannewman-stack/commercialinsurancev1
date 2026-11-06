/*
  Stacked feature cards: each one pins near the top of the screen as you scroll,
  with a live, looping piece of the product on the right.
*/
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGroup, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, FileText, Lock } from "lucide-react";
import Money from "./Money.jsx";
import { Words } from "./fx.jsx";
import { useSectionLink } from "./Header.jsx";
import { CARRIERS, RATING } from "../data/carriers.js";
import { SAMPLE } from "../data/sample.js";
import { computeQuotes, estimate, SORTS } from "../lib/pricing.js";
import { DEFAULT_OPTIONS as O } from "../lib/store.jsx";
import { initials, money } from "../lib/format.js";

/* Counts 0→steps while active, holds, then starts over. */
function useLoop(active, steps, every = 900, hold = 2200) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? steps : 0);
  useEffect(() => {
    if (reduce) { setN(steps); return undefined; }
    if (!active) return undefined;
    let k = 0, t;
    const tick = () => {
      if (k >= steps) { t = setTimeout(() => { k = 0; setN(0); t = setTimeout(tick, every); }, hold); return; }
      k += 1; setN(k); t = setTimeout(tick, every);
    };
    setN(0);
    t = setTimeout(tick, every);
    return () => clearTimeout(t);
  }, [active, steps, every, hold, reduce]);
  return n;
}

const STEPS = [
  ["Business", "Café or coffee shop", { industry: "restaurant", businessType: "Café or coffee shop", lines: [], zip: "", space: null, employees: null, years: null, claims: null }],
  ["Location", "Texas 78704", { zip: "78704" }],
  ["Space", "2,400 sq ft, leased", { space: "lease", sqft: 2400 }],
  ["Revenue", "$850k a year", { revenue: 850000 }],
  ["Team", "6–10 people", { employees: "6-10" }],
  ["History", "3–10 years · no claims", { years: "3-10", claims: "0" }],
];

function EstimateUI({ active }) {
  const n = useLoop(active, STEPS.length, 950);
  const ests = useMemo(() => {
    let a = { ...SAMPLE, revenue: 500000, sqft: 2500, vehicles: 2 };
    return STEPS.map(([, , patch]) => { a = { ...a, ...patch }; return estimate(a, O); });
  }, []);
  const e = ests[Math.max(0, n - 1)];
  return (
    <div className="ui-card">
      <p className="m-eyebrow">Your estimate</p>
      <p className="ui-big">{n ? <><Money value={e.low} /><em>–</em><Money value={e.high} /><small>/mo</small></> : <span className="ui-wait">Answer to see prices</span>}</p>
      <div className="m-track"><i style={{ marginLeft: `${8 + n * 3}%`, width: `${70 - n * 7}%` }} /></div>
      <ul className="m-answers">
        {STEPS.map(([k, v], i) => <li key={k} className={i < n ? "" : "empty"}><span>{k}</span><motion.b key={i < n ? "on" : "off"} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }}>{i < n ? v : "—"}</motion.b></li>)}
      </ul>
    </div>
  );
}

function CarriersUI({ active }) {
  const R = useMemo(() => computeQuotes(SAMPLE, O), []);
  const list = CARRIERS.slice(0, 7);
  const n = useLoop(active, list.length, 520, 2600);
  return (
    <div className="ui-card">
      <div className="ui-head"><b>Carriers</b><span className="m-muted">Brightside Café · Today</span></div>
      <ul className="ui-table">
        <li className="th"><span>Carrier</span><span>Rating</span><span>Status</span></li>
        {list.map((c, i) => {
          const q = R.quotes.find((x) => x.c === c), d = R.declined.find((x) => x.c === c);
          const state = i < n ? (q ? "ok" : "no") : i === n ? "ask" : "wait";
          return (
            <li key={c.id}>
              <span className="ui-who"><span className="m-av">{initials(c.name)}</span>{c.name}</span>
              <span className="m-muted">{c.rating}</span>
              <span className={`ui-pill ${state}`}>
                {state === "ok" && <><Check size={12} /> <span className="pill-word">Quoted </span>{money(q.monthly)}/mo</>}
                {state === "no" && <>Passed: {d.reason.replace("Doesn’t ", "doesn’t ")}</>}
                {state === "ask" && <><span className="pulse" /> Requesting</>}
                {state === "wait" && "Not yet asked"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RankUI({ active }) {
  const R = useMemo(() => computeQuotes(SAMPLE, O), []);
  const n = useLoop(active, 1, 2600, 2600);
  const sort = n ? "price" : "value";
  const list = [...R.quotes].sort(SORTS[sort]).slice(0, 4);
  const reduce = useReducedMotion();
  return (
    <div className="ui-card">
      <span className="m-seg ui-seg"><span className={sort === "value" ? "on" : ""}>Best value</span><span className={sort === "price" ? "on" : ""}>Lowest price</span><span>Top rated</span></span>
      <LayoutGroup>
        <ul className="ui-rank">
          {list.map((q) => (
            <motion.li layout={!reduce} key={q.c.id} transition={{ type: "spring", stiffness: 380, damping: 34 }} className={q.badges.includes("Best value") ? "best" : ""}>
              <span className="m-av">{initials(q.c.name)}</span>
              <span className="ui-name">{q.c.name}<small>{q.c.rating} · {RATING[q.c.rating].word}</small></span>
              <span className="ui-tags">{q.badges.map((b) => <i key={b} className={b === "Best value" ? "y" : ""}>{b}</i>)}</span>
              <b>{money(q.monthly)}<small>/mo</small></b>
            </motion.li>
          ))}
        </ul>
      </LayoutGroup>
    </div>
  );
}

function RequestUI({ active }) {
  const n = useLoop(active, 4, 900, 2600);
  return (
    <div className="ui-card">
      <p className="m-legend"><span>01</span>When should coverage start?</p>
      <div className="m-chips"><span>Today</span><span className={n >= 1 ? "on" : ""}>Tomorrow</span><span>1st of next month</span></div>
      <p className="m-legend"><span>02</span>How do you want to pay?</p>
      <div className="m-plans"><div className={n >= 2 ? "on" : ""}><b>Monthly</b><strong>$524<small>/mo</small></strong></div><div><b>Pay in full</b><strong>$6,217<small>/yr</small></strong></div></div>
      <span className={`m-btn wide${n >= 3 ? " done" : ""}`}>{n >= 3 ? <><Check size={15} /> Request sent</> : <><Lock size={15} /> Request this policy</>}</span>
      <motion.div className="ui-doc" initial={false} animate={{ opacity: n >= 4 ? 1 : 0, y: n >= 4 ? 0 : 8 }}>
        <FileText size={18} /><span>Certificate of insurance<small>Emailed once your policy is issued</small></span>
      </motion.div>
    </div>
  );
}

const CARDS = [
  { k: "Live estimate", title: "Your price takes shape as you answer.", UI: EstimateUI, link: ["Start a quote", "/quote"],
    body: "Every answer narrows your range, so you know what to expect before you reach the last question." },
  { k: "One application", title: "Every carrier, at the same time.", UI: CarriersUI, link: ["See how it works", "#how"],
    body: "Keel sends your details to every carrier that insures businesses like yours. The ones that pass tell you why." },
  { k: "Ranked by value", title: "The best quote isn’t always the cheapest.", UI: RankUI, link: ["How we rank quotes", "#faq"],
    body: "Keel weighs price against each carrier’s financial strength rating, then lets you sort any way you like." },
  { k: "Get covered", title: "Request your policy in one step.", UI: RequestUI, link: ["Get your quotes", "/quote"],
    body: "Pick a start date and a payment plan. Nothing is charged until a licensed advisor confirms the details." },
];

function StackCard({ i, k, title, body, link, UI }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-30% 0px -30% 0px" });
  const toSection = useSectionLink();
  const [label, href] = link;
  return (
    <article ref={ref} className="stack-card" style={{ top: `calc(${96 + i * 18}px + env(safe-area-inset-top, 0px))` }}>
      <div className="sc-copy">
        <p className="b-k">{k}</p>
        <h3>{title}</h3>
        <p>{body}</p>
        {href.startsWith("#")
          ? <a className="sc-link" href={href} onClick={toSection(href.slice(1))}>{label} <ArrowRight size={14} aria-hidden="true" /></a>
          : <Link className="sc-link" to={href}>{label} <ArrowRight size={14} aria-hidden="true" /></Link>}
      </div>
      <div className="sc-ui" aria-hidden="true"><UI active={inView} /></div>
    </article>
  );
}

export default function Features() {
  return (
    <section className="feat" id="why" aria-labelledby="feat-title">
      <div className="wrap">
        <div className="sec-head">
          <Words as="h2" id="feat-title" className="mega-2" text="Less shopping around." tail="More time running your business." />
        </div>
        <div className="stack">{CARDS.map((c, i) => <StackCard key={c.title} i={i} {...c} />)}</div>
      </div>
    </section>
  );
}
