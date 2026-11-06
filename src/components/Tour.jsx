/*
  "How it works": a tabbed walkthrough of the real product, one full desktop
  screen per step, auto-advancing while it's on screen.
*/
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { Canvas, Window } from "./Canvas.jsx";
import { LogoMark } from "./Logo.jsx";
import { COMPANY } from "../config.js";
import { Reveal, Words } from "./fx.jsx";
import { CARRIERS, RATING } from "../data/carriers.js";
import { LINE } from "../data/coverage.js";
import { SAMPLE } from "../data/sample.js";
import { computeQuotes, estimate, lineDetail, SORTS } from "../lib/pricing.js";
import { DEFAULT_OPTIONS as O } from "../lib/store.jsx";
import { initials, money } from "../lib/format.js";

const PROFILE = "Café or coffee shop · Texas 78704 · 2,400 sq ft, leased · $850k revenue · 6–10 people";

export function useSample() {
  return useMemo(() => {
    const R = computeQuotes(SAMPLE, O);
    return {
      R,
      byValue: [...R.quotes].sort(SORTS.value),
      byPrice: [...R.quotes].sort(SORTS.price),
      before: estimate({ ...SAMPLE, employees: null, years: null, claims: null }, O),
      after: estimate({ ...SAMPLE, years: null, claims: null }, O),
    };
  }, []);
}

/* Steps 0→total while active, once. */
function useTimeline(active, total, every = 700) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? total : 0);
  useEffect(() => {
    if (reduce) { setN(total); return undefined; }
    if (!active) return undefined;
    let k = 0;
    setN(0);
    const t = setInterval(() => { k += 1; setN(k); if (k >= total) clearInterval(t); }, every);
    return () => clearInterval(t);
  }, [active, total, every, reduce]);
  return n;
}

function Brand() {
  return <span className="m-brand"><LogoMark className="m-mark" compact />{COMPANY.name}</span>;
}
function SiteTop() {
  return (
    <div className="m-top">
      <Brand />
      <span className="m-nav-links"><span>How it works</span><span>Industries</span><span>Coverage</span><span>FAQ</span></span>
      <span className="m-btn sm">Get a quote</span>
    </div>
  );
}

export function QuoteScreen({ active, before, after }) {
  const n = useTimeline(active, 1, 1100);
  const picked = n >= 1;
  const est = picked ? after : before;
  const rows = [["Business", "Café or coffee shop"], ["Location", "Texas 78704"], ["Space", "2,400 sq ft, leased"], ["Revenue", "$850k a year"], ["Team", picked ? "6–10 people" : null], ["History", null], ["Coverage", null]];
  return (
    <div className="m-app">
      <div className="m-top">
        <Brand />
        <span className="m-secs">
          {["Business", "Space", "Operations", "Coverage", "Details"].map((s, i) => (
            <span key={s} className={i < 2 ? "done" : i === 2 ? "now" : ""}><i><b style={{ width: i < 2 ? "100%" : i === 2 ? (picked ? "75%" : "50%") : "0%" }} /></i>{s}</span>
          ))}
        </span>
        <span className="m-x">×</span>
      </div>
      <div className="m-quote">
        <div>
          <p className="m-eyebrow">Operations · Question 5 of 8</p>
          <p className="m-title">How many people work for the business?</p>
          <p className="m-sub">Count yourself plus full-time and part-time staff.</p>
          <div className="m-tiles">
            {["Just me", "2–5", "6–10", "11–25", "26–50", "51–100", "More than 100"].map((t, i) => (
              <span key={t} className={picked && t === "6–10" ? "on" : ""}><kbd>{String.fromCharCode(65 + i)}</kbd>{t}</span>
            ))}
          </div>
        </div>
        <aside className="m-card">
          <p className="m-eyebrow">Your estimate</p>
          <p className="m-est">{money(est.low)} <em>–</em> {money(est.high)}<small>/mo</small></p>
          <p className="m-muted">From {est.count} carriers · updates as you answer</p>
          <div className="m-track"><i style={{ marginLeft: picked ? "26%" : "16%", width: picked ? "50%" : "44%" }} /></div>
          <ul className="m-answers">{rows.map(([k, v]) => <li key={k} className={v ? "" : "empty"}><span>{k}</span><b>{v || "—"}</b></li>)}</ul>
        </aside>
      </div>
      <div className="m-foot"><span className="m-btn ghost">← Back</span><span className="m-hint">Press <kbd>Enter ↵</kbd></span><span className="m-btn">Continue →</span></div>
    </div>
  );
}

export function ShopScreen({ active, R }) {
  const n = useTimeline(active, CARRIERS.length, 330);
  const done = n >= CARRIERS.length;
  return (
    <div className="m-app">
      <SiteTop />
      <div className="m-shop">
        <p className="m-eyebrow mk">Shopping the market</p>
        <p className="m-title">{done ? `${R.quotes.length} quotes found for Brightside Café.` : "Checking 9 carriers for Brightside Café…"}</p>
        <p className="m-sub">{PROFILE}</p>
        <div className="m-progress"><i style={{ width: `${(n / CARRIERS.length) * 100}%` }} /></div>
        <ul className="m-list">
          {CARRIERS.map((c, i) => {
            const q = R.quotes.find((x) => x.c === c);
            const d = R.declined.find((x) => x.c === c);
            const shown = i < n;
            return (
              <li key={c.id} className={shown ? (q ? "ok" : "no") : ""}>
                <span className="m-av">{initials(c.name)}</span>
                <span className="m-name">{c.name}<small>{c.rating} · {RATING[c.rating].word}</small></span>
                <span className="m-status">{!shown ? <><span className="pulse" /> Requesting</> : q ? <><Check /> {money(q.monthly)}/mo</> : d?.reason}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function ResultsScreen({ R, byValue, byPrice }) {
  const best = byValue[0], low = byPrice[0], high = byPrice[byPrice.length - 1];
  return (
    <div className="m-app">
      <SiteTop />
      <div className="m-results">
        <div className="m-res-head">
          <div><p className="m-eyebrow mk">Your quotes</p><p className="m-title big">{R.quotes.length} carriers can insure Brightside Café.</p><p className="m-sub">{PROFILE}</p></div>
        </div>
        <div className="m-stats">
          <div><span>Best value</span><b>{money(best.monthly)}<small>/mo</small></b><em>{best.c.name}</em></div>
          <div><span>Lowest price</span><b>{money(low.monthly)}<small>/mo</small></b><em>{low.c.name}</em></div>
          <div><span>Price spread</span><b>{money(high.annual - low.annual)}<small>/yr</small></b><em>Between the lowest and highest quote</em></div>
        </div>
        <div className="m-toolbar">
          <span className="m-seg"><span className="on">Best value</span><span>Lowest price</span><span>Top rated</span></span>
          <span className="m-seg"><span className="on">Monthly</span><span>Paid in full</span></span>
        </div>
        <ul className="m-quotes">
          {byValue.slice(0, 3).map((q, i) => (
            <li key={q.c.id} className={i === 0 ? "best" : ""}>
              <span className="m-av lg">{initials(q.c.name)}</span>
              <span className="m-qid"><b>{q.c.name}</b><small>{q.c.rating} · {RATING[q.c.rating].word} financial strength</small>{q.badges.length > 0 && <span className="m-badges">{q.badges.map((bd) => <i key={bd} className={bd === "Best value" ? "y" : ""}>{bd}</i>)}</span>}</span>
              <ul className="m-lines">{q.lines.map((l) => <li key={l.id}><span>{LINE[l.id].short}<small>{lineDetail(l.id, SAMPLE, O, R.tiv)}</small></span><b>{money(l.amt)}/yr</b></li>)}</ul>
              <span className="m-price"><b>{money(q.monthly)}<small>/mo</small></b><small>or {money(q.annual)} paid in full</small><span className={`m-btn sm${i === 0 ? "" : " ghost"}`}>Choose</span></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function CompareScreen(props) {
  const list = props.byValue.slice(0, 3);
  const ids = [...new Set(list.flatMap((q) => q.lines.map((l) => l.id)))];
  const minM = Math.min(...list.map((q) => q.monthly));
  return (
    <div className="m-app">
      <div className="m-dim"><ResultsScreen {...props} /></div>
      <div className="m-scrim" />
      <div className="m-modal">
        <div className="m-modal-top"><b>Compare quotes</b><span className="m-x">×</span></div>
        <table className="m-cmp">
          <thead><tr><th />{list.map((q) => <th key={q.c.id}>{q.c.name}</th>)}</tr></thead>
          <tbody>
            <tr className="big"><th>Monthly</th>{list.map((q) => <td key={q.c.id} className={q.monthly === minM ? "win" : ""}>{money(q.monthly)}</td>)}</tr>
            <tr><th>Paid in full</th>{list.map((q) => <td key={q.c.id}>{money(q.annual)}</td>)}</tr>
            <tr><th>Rating</th>{list.map((q) => <td key={q.c.id}>{q.c.rating} · {RATING[q.c.rating].word}</td>)}</tr>
            {ids.map((id) => <tr key={id}><th>{LINE[id].short}</th>{list.map((q) => { const l = q.lines.find((x) => x.id === id); return <td key={q.c.id}>{l ? `${money(l.amt)}/yr` : "—"}</td>; })}</tr>)}
            <tr><th>Installment fee</th>{list.map((q) => <td key={q.c.id}>{q.c.fee ? `${money(q.c.fee)}/mo` : "None"}</td>)}</tr>
            <tr><th>Extras</th>{list.map((q) => <td key={q.c.id} className="soft">{q.c.perks[0]}</td>)}</tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CheckoutScreen({ active, byValue, R }) {
  const q = byValue[0];
  const n = useTimeline(active, 3, 900);
  return (
    <div className="m-app">
      <SiteTop />
      <div className="m-checkout">
        <div>
          <p className="m-link">← Back to quotes</p>
          <p className="m-eyebrow mk">Request your policy</p>
          <p className="m-title big">Almost covered.</p>
          <p className="m-sub">A few details so your advisor can finalize the policy with {q.c.name}. Nothing is charged today.</p>
          <p className="m-legend"><span>01</span>When should coverage start?</p>
          <div className="m-chips"><span>Today</span><span className={n >= 1 ? "on" : ""}>Tomorrow</span><span>1st of next month</span></div>
          <p className="m-legend"><span>02</span>How do you want to pay?</p>
          <div className="m-plans">
            <div className={n >= 2 ? "on" : ""}><b>Monthly</b><strong>{money(q.monthly)}<small>/mo</small></strong><small>{q.c.fee ? `Includes a ${money(q.c.fee)} installment fee` : "No installment fees"}</small></div>
            <div><b>Pay in full</b><strong>{money(q.annual)}<small>/yr</small></strong><small>{q.c.fee ? `Saves ${money(q.c.fee * 12)} a year` : "Same total as monthly"}</small></div>
          </div>
          <span className={`m-btn wide${n >= 3 ? " done" : ""}`}>{n >= 3 ? <><Check /> Request sent</> : <><Lock /> Request this policy</>}</span>
        </div>
        <aside className="m-card">
          <span className="m-qid row"><span className="m-av lg y">{initials(q.c.name)}</span><span><b>{q.c.name}</b><small>{q.c.rating} · {RATING[q.c.rating].word} financial strength</small></span></span>
          <ul className="m-lines">{q.lines.map((l) => <li key={l.id}><span>{LINE[l.id].short}<small>{lineDetail(l.id, SAMPLE, O, R.tiv)}</small></span><b>{money(l.amt)}</b></li>)}</ul>
          <p className="m-total"><span>Monthly</span><b>{money(q.monthly)}<small>/mo</small></b></p>
          <p className="m-muted">Starts tomorrow</p>
        </aside>
      </div>
    </div>
  );
}

const TABS = [
  { id: "tell", label: "Tell us", title: "Tell us about your business", url: `${COMPANY.name} · Get a quote`, Screen: QuoteScreen,
    body: "Eight quick questions, one per screen. Your price range updates with every answer, so there’s no surprise at the end." },
  { id: "shop", label: "We shop", title: "We shop every carrier", url: `${COMPANY.name} · Shopping the market`, Screen: ShopScreen,
    body: "One application goes to every carrier that insures businesses like yours. Quotes come back in seconds, and carriers that pass tell you why." },
  { id: "compare", label: "Compare", title: "Compare by value", url: `${COMPANY.name} · Your quotes`, Screen: ResultsScreen,
    body: "Price, coverage and each carrier’s financial strength in one list. Change limits or deductibles and every quote updates." },
  { id: "side", label: "Side by side", title: "Line them up", url: `${COMPANY.name} · Compare quotes`, Screen: CompareScreen,
    body: "Pick up to three quotes and compare every coverage line, fee and extra in one table." },
  { id: "covered", label: "Get covered", title: "Request your policy", url: `${COMPANY.name} · Request your policy`, Screen: CheckoutScreen,
    body: "Choose a start date and payment plan. A licensed advisor confirms the details, and nothing is charged until it’s final." },
];
const DUR = 7000;

export default function Tour() {
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-25% 0px -25% 0px" });
  const reduce = useReducedMotion();
  const data = useSample();
  const running = inView && !hover && !reduce;
  useEffect(() => {
    if (!running) return undefined;
    const t = setTimeout(() => setI((v) => (v + 1) % TABS.length), DUR);
    return () => clearTimeout(t);
  }, [i, running]);
  const T = TABS[i];
  const S = T.Screen;
  const go = (k) => setI((k + TABS.length) % TABS.length);

  return (
    <section className="tour" id="how" ref={ref} aria-labelledby="how-title">
      <div className="wrap">
        <div className="sec-head">
          <Words as="h2" id="how-title" className="mega-2" text="How it works." tail="From first question to covered, in about three minutes." />
        </div>
        <Reveal className="tour-stage" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={T.id} initial={{ opacity: 0, y: 14, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -8, filter: "blur(8px)" }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
              <Window title={T.url} label={`${T.title}. ${T.body}`}>
                <Canvas height={700}><S active={inView} {...data} /></Canvas>
              </Window>
            </motion.div>
          </AnimatePresence>
        </Reveal>
        <div className="tour-foot">
          <p className="tour-cap" aria-live="polite"><b>{T.title}.</b> {T.body}</p>
          <div className="tour-ctrl">
            <div className="tour-tabs" role="tablist" aria-label="Steps">
              {TABS.map((t, k) => (
                <button key={t.id} type="button" role="tab" aria-selected={k === i} className={k === i ? "on" : ""} onClick={() => go(k)}>
                  <span className="tt-bar">
                    {k === i
                      ? <motion.i key={`${i}-${running}`} initial={{ width: running ? "0%" : "100%" }} animate={{ width: "100%" }} transition={{ duration: running ? DUR / 1000 : 0, ease: "linear" }} />
                      : <i style={{ width: k < i ? "100%" : "0%" }} />}
                  </span>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="tour-arrows">
              <button type="button" className="icon-btn" aria-label="Previous step" onClick={() => go(i - 1)}><ArrowLeft size={17} /></button>
              <button type="button" className="icon-btn" aria-label="Next step" onClick={() => go(i + 1)}><ArrowRight size={17} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
