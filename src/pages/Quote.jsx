import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronUp, Minus, Pencil, Plus, X } from "lucide-react";
import Logo from "../components/Logo.jsx";
import BusinessSearch from "../components/BusinessSearch.jsx";
import Money from "../components/Money.jsx";
import Sheet from "../components/Sheet.jsx";
import { CLASS, CLASSES } from "../data/industries.js";
import { STATE_NAMES, zipState } from "../data/geo.js";
import { LINE, availableLines, recommend } from "../data/coverage.js";
import { CLAIMS, EMPLOYEES, SPACES, TIMING, YEARS, opt } from "../data/questions.js";
import { estimate, hasSpace, lineEstimates } from "../lib/pricing.js";
import { money, num, shortMoney } from "../lib/format.js";
import { submitLead } from "../lib/leads.js";
import { useQuote } from "../lib/store.jsx";
import { COMPANY, DEMO_QUOTES } from "../config.js";
import { useTitle } from "../lib/useTitle.js";
import { SORTS, computeQuotes } from "../lib/pricing.js";

const SECTIONS = ["Business", "Space", "Operations", "Coverage", "Details"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function contactError(a) {
  if (!a.name.trim()) return ["f-name", "Add your first name."];
  if (!a.business.trim()) return ["f-biz", "Add your business name."];
  if (!EMAIL_RE.test(a.email.trim())) return ["f-email", "Enter an email address like you@yourbusiness.com."];
  if (a.phone.trim() && a.phone.replace(/\D/g, "").length < 10) return ["f-phone", "Enter a 10-digit phone number, or leave it blank."];
  return null;
}

export const STEPS = [
  { id: "industry", section: 0, title: () => "What kind of business do you run?", sub: () => "Search for your business, or choose the closest category.",
    validate: (a) => (a.industry ? null : [null, "Choose your type of business to continue."]) },
  { id: "zip", section: 0, title: () => "Where is the business located?", sub: () => "Rates depend on your state and local area.",
    validate: (a) => (zipState(a.zip) ? null : ["f-zip", a.zip.length < 5 ? "Enter a 5-digit ZIP code." : "We couldn’t find that ZIP code. Check it and try again."]) },
  { id: "space", section: 1, title: () => "Where do you work from?", sub: () => "This tells us whether to insure a building or just your equipment.",
    validate: (a) => (!a.space ? [null, "Choose where you work from."] : hasSpace(a) && !(a.sqft >= 100) ? ["f-sqft-n", "Enter the size of your space in square feet."] : null) },
  { id: "revenue", section: 2, title: () => "How much revenue do you expect this year?", sub: () => "Gross sales over the next 12 months, before expenses. A good estimate is fine.",
    validate: (a) => (a.revenue >= 1000 ? null : ["f-revenue-n", "Enter your expected annual revenue."]) },
  { id: "team", section: 2, title: () => "How many people work for the business?", sub: () => "Count yourself plus full-time and part-time staff.",
    validate: (a) => (a.employees ? null : [null, "Choose the size of your team."]) },
  { id: "history", section: 2, title: () => "How established is the business?", sub: () => "Carriers price newer businesses and recent claims differently.",
    validate: (a) => (!a.years ? [null, "Choose how long you’ve been in business."] : !a.claims ? [null, "Tell us about claims in the last 3 years."] : null) },
  { id: "coverage", section: 3, title: () => "What do you need covered?", sub: (a) => `We pre-selected what ${(CLASS[a.industry] || CLASS.other).plural} usually carry. Add or remove anything.`,
    validate: (a) => (a.lines.length ? null : [null, "Choose at least one type of coverage."]) },
  { id: "contact", section: 4, title: () => "Last step. Where should we send your quotes?", sub: () => "Your quotes appear on the next screen. An advisor uses these details only if you choose a quote or ask for help.",
    validate: contactError },
];

/* ---------- inputs ---------- */
function Tiles({ options, value, onPick, shortcuts = false, small = false, label }) {
  useEffect(() => {
    if (!shortcuts) return undefined;
    const k = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      const t = e.target;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT") return;
      const i = e.key.toUpperCase().charCodeAt(0) - 65;
      if (i >= 0 && i < options.length) { e.preventDefault(); onPick(options[i].v); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [shortcuts, options, onPick]);
  return (
    <div className={`tiles${small ? " tiles-sm" : ""}`} role="group" aria-label={label}>
      {options.map((o, i) => (
        <button type="button" key={o.v} className="tile" aria-pressed={value === o.v} onClick={() => onPick(o.v)}>
          {shortcuts && <kbd className="tile-key" aria-hidden="true">{String.fromCharCode(65 + i)}</kbd>}
          <span className="tile-text"><span className="tile-label">{o.label}</span>{o.hint && <span className="tile-hint">{o.hint}</span>}</span>
        </button>
      ))}
    </div>
  );
}

const SL = {
  sqft: { min: 200, max: 100000, unit: "sq ft", aria: "Square feet", ticks: [500, 2500, 10000, 50000], lo: 100, hi: 2000000,
    fmt: (v) => num(v), tick: (t) => (t >= 1000 ? `${t / 1000}k` : String(t)),
    round: (v) => { const s = v < 2000 ? 50 : v < 10000 ? 100 : v < 50000 ? 500 : 1000; return Math.round(v / s) * s; },
    helper: (v) => (v < 1000 ? "About the size of a small office suite" : v < 3000 ? "About the size of a neighborhood café" : v < 10000 ? "About the size of a small retail store" : v < 40000 ? "About the size of a small warehouse" : "A large facility") },
  revenue: { min: 10000, max: 50000000, unit: "a year", aria: "Annual revenue", ticks: [50000, 250000, 1000000, 5000000, 20000000], lo: 1000, hi: 1e9,
    fmt: (v) => `$${num(v)}`, tick: (t) => shortMoney(t),
    round: (v) => { const m = Math.pow(10, Math.floor(Math.log10(v)) - 1); return Math.round(v / m) * m; },
    helper: (v) => `About ${money(v / 12)} a month` },
};
const toPos = (k, v) => { const c = SL[k]; v = Math.min(Math.max(v, c.min), c.max); return Math.round((1000 * Math.log(v / c.min)) / Math.log(c.max / c.min)); };
const fromPos = (k, p) => { const c = SL[k]; return c.round(c.min * Math.pow(c.max / c.min, p / 1000)); };
const tickLeft = (p) => `calc(13px + (100% - 26px) * ${(p / 1000).toFixed(4)})`;

function Slider({ k, value, onChange, quick, extra }) {
  const c = SL[k];
  const p = toPos(k, value);
  const [text, setText] = useState(c.fmt(value));
  const input = useRef(null);
  useEffect(() => { if (document.activeElement !== input.current) setText(c.fmt(value)); }, [value, c]);
  return (
    <div className="slider">
      <div className="readout">
        <input
          ref={input} id={`f-${k}-n`} className="input big" inputMode="numeric" autoComplete="off" aria-label={c.aria} value={text}
          onChange={(e) => {
            const raw = parseInt(e.target.value.replace(/\D/g, ""), 10);
            if (Number.isNaN(raw)) { setText(k === "revenue" ? "$" : ""); return; }
            setText(c.fmt(raw)); onChange(Math.min(Math.max(raw, c.lo), c.hi));
          }}
          onBlur={() => setText(c.fmt(value))}
        />
        <span className="unit">{c.unit}</span>
      </div>
      <p className="helper">{c.helper(value)}{extra ? ` · ${extra}` : ""}</p>
      <input type="range" className="range" min={0} max={1000} step={1} value={p} style={{ "--p": `${p / 10}%` }}
        aria-label={c.aria} aria-valuetext={`${c.fmt(value)} ${c.unit}`} onChange={(e) => onChange(fromPos(k, +e.target.value))} />
      <div className="ticks" aria-hidden="true">{c.ticks.map((t) => <span key={t} style={{ left: tickLeft(toPos(k, t)) }}>{c.tick(t)}</span>)}</div>
      {quick && (
        <div className="quick" role="group" aria-label="Common amounts">
          {quick.map((v) => <button type="button" key={v} className={`chip-btn${value === v ? " on" : ""}`} onClick={() => onChange(v)}>{c.tick(v)}</button>)}
        </div>
      )}
    </div>
  );
}

/* ---------- steps ---------- */
function IndustryStep({ a, advance }) {
  const cats = CLASSES.map((c) => ({ v: c.id, label: c.label }));
  return (
    <>
      <BusinessSearch size="md" buttonLabel="Continue" placeholder="Try “dentist”, “food truck” or “HVAC”" autoFocus={window.matchMedia?.("(hover: hover)").matches}
        onPick={(b) => advance({ industry: b.cls, businessType: b.label, ...(b.space ? { space: b.space } : {}) })} />
      {a.industry && (
        <p className="picked"><span className="picked-dot" />Selected: <b>{a.businessType || CLASS[a.industry].label}</b>{a.businessType && <span className="muted"> · {CLASS[a.industry].short}</span>}</p>
      )}
      <p className="group-label">Or choose a category</p>
      <Tiles options={cats} value={a.businessType ? null : a.industry} onPick={(v) => advance({ industry: v, businessType: "" })} shortcuts small label="Business categories" />
    </>
  );
}

function ZipStep({ a, setA, clearError }) {
  const st = zipState(a.zip);
  return (
    <>
      <label className="sr-only" htmlFor="f-zip">ZIP code</label>
      <input id="f-zip" className="input big" inputMode="numeric" autoComplete="postal-code" maxLength={5} placeholder="ZIP code" value={a.zip} data-autofocus
        onChange={(e) => { const z = e.target.value.replace(/\D/g, "").slice(0, 5); setA({ zip: z }); if (zipState(z)) clearError(); }} />
      <p className={`zip-state${st ? " ok" : ""}`}>
        {st ? STATE_NAMES[st] : a.zip.length === 5 ? "We couldn’t find that ZIP code. Check it and try again." : "5-digit ZIP code of your main location"}
      </p>
    </>
  );
}

function SpaceStep({ a, setA, advance }) {
  const fixed = hasSpace(a);
  return (
    <>
      <Tiles options={SPACES} value={a.space} shortcuts label="Where you work from"
        onPick={(v) => { if (v === "own" || v === "lease") { setA({ space: v }); setTimeout(() => document.getElementById("f-sqft-n")?.focus({ preventScroll: true }), 250); } else advance({ space: v }); }} />
      <AnimatePresence initial={false}>
        {fixed && (
          <motion.div className="reveal" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28 }}>
            <p className="group-label">{a.space === "own" ? "How big is the building?" : "How big is the space you lease?"}</p>
            <Slider k="sqft" value={a.sqft} onChange={(v) => setA({ sqft: v })}
              extra={a.space === "own" ? `Estimated rebuild cost ${shortMoney(a.sqft * 165)}` : null} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function RevenueStep({ a, setA }) {
  return <Slider k="revenue" value={a.revenue} onChange={(v) => setA({ revenue: v })} quick={[100000, 250000, 500000, 1000000, 5000000]} />;
}

function TeamStep({ a, advance }) {
  return <Tiles options={EMPLOYEES} value={a.employees} onPick={(v) => advance({ employees: v })} shortcuts small label="Team size" />;
}

function HistoryStep({ a, setA, advance }) {
  const pick = (patch) => { const next = { ...a, ...patch }; if (next.years && next.claims) advance(patch); else setA(patch); };
  return (
    <>
      <p className="group-label" id="g-years">How long have you been in business?</p>
      <Tiles options={YEARS} value={a.years} onPick={(v) => pick({ years: v })} small label="Years in business" />
      <p className="group-label" id="g-claims">Insurance claims in the last 3 years</p>
      <Tiles options={CLAIMS} value={a.claims} onPick={(v) => pick({ claims: v })} small label="Claims in the last 3 years" />
    </>
  );
}

function CoverageStep({ a, setA, o }) {
  const recs = recommend(a);
  const all = availableLines(a.industry);
  const est = lineEstimates(a, o);
  const bop = a.lines.includes("bop");
  const toggle = (id) => setA((s) => {
    let lines = s.lines.includes(id) ? s.lines.filter((x) => x !== id) : [...s.lines, id];
    if (id === "bop" && !s.lines.includes("bop")) lines = lines.filter((x) => x !== "gl" && x !== "property");
    return { lines };
  });
  const card = (l) => {
    const on = a.lines.includes(l.id), incl = bop && (l.id === "gl" || l.id === "property");
    return (
      <div key={l.id} className={`cov${on ? " on" : ""}${incl ? " included" : ""}`}>
        <label htmlFor={`cov-${l.id}`}>
          <input type="checkbox" id={`cov-${l.id}`} checked={on} disabled={incl} onChange={() => toggle(l.id)} />
          <span className="cov-t">{l.name}{l.abbr && <span className="cov-abbr">{l.abbr}</span>}</span>
          <span className="cov-price">{incl ? "Included" : <>≈ {money(est[l.id])}<small>/mo</small></>}</span>
          <span className="cov-d">{incl ? "Included in your business owner’s policy." : l.desc}</span>
        </label>
        {l.id === "auto" && on && (
          <div className="veh">
            <span>Vehicles</span>
            <div className="stepper">
              <button type="button" aria-label="Fewer vehicles" onClick={() => setA((s) => ({ vehicles: Math.max(1, s.vehicles - 1) }))}><Minus size={15} /></button>
              <output aria-live="polite">{a.vehicles}</output>
              <button type="button" aria-label="More vehicles" onClick={() => setA((s) => ({ vehicles: Math.min(50, s.vehicles + 1) }))}><Plus size={15} /></button>
            </div>
          </div>
        )}
      </div>
    );
  };
  const recLines = all.filter((l) => recs.includes(l.id)), more = all.filter((l) => !recs.includes(l.id));
  return (
    <>
      <p className="group-label">Recommended for {(CLASS[a.industry] || CLASS.other).plural}</p>
      <div className="covs">{recLines.map(card)}</div>
      <p className="group-label">More coverage</p>
      <div className="covs">{more.map(card)}</div>
      <p className="fine form-note">Prices are typical monthly costs for a business like yours. Exact prices come with your quotes.</p>
    </>
  );
}

function ContactStep({ a, setA, clearError }) {
  const field = (id, key, label, props = {}, optional = false) => (
    <div className="field">
      <label htmlFor={id}>{label}{optional && <span className="opt"> optional</span>}</label>
      <input id={id} className="input" value={a[key]} onChange={(e) => { setA({ [key]: e.target.value }); clearError(); }} {...props} />
    </div>
  );
  return (
    <>
      <div className="form-grid">
        {field("f-name", "name", "Your first name", { autoComplete: "given-name", "data-autofocus": true })}
        {field("f-biz", "business", "Business name", { autoComplete: "organization" })}
        {field("f-email", "email", "Email", { type: "email", autoComplete: "email", inputMode: "email" })}
        {field("f-phone", "phone", "Phone", { type: "tel", autoComplete: "tel", inputMode: "tel" }, true)}
      </div>
      <p className="group-label">When do you need coverage to start?</p>
      <div className="quick">
        {TIMING.map((t) => <button type="button" key={t.v} className={`chip-btn${a.timing === t.v ? " on" : ""}`} aria-pressed={a.timing === t.v} onClick={() => setA({ timing: t.v })}>{t.label}</button>)}
      </div>
      <p className="fine form-note">We don’t sell your information. It’s shared only with carriers that can quote you.</p>
    </>
  );
}

const STEP_VIEWS = { industry: IndustryStep, zip: ZipStep, space: SpaceStep, revenue: RevenueStep, team: TeamStep, history: HistoryStep, coverage: CoverageStep, contact: ContactStep };

/* ---------- summary ---------- */
export function answerRows(a, current) {
  const seen = (id) => a.seen.includes(id) || current === id;
  const st = zipState(a.zip);
  const lines = a.lines.map((l) => LINE[l]?.abbr || LINE[l]?.short).filter(Boolean);
  return [
    ["industry", "Business", a.industry ? a.businessType || CLASS[a.industry].short : null],
    ["zip", "Location", st ? `${STATE_NAMES[st]} ${a.zip}` : null],
    ["space", "Space", a.space ? (hasSpace(a) ? `${num(a.sqft)} sq ft, ${a.space === "own" ? "owned" : "leased"}` : opt(SPACES, a.space).label.replace("I ", "")) : null],
    ["revenue", "Revenue", seen("revenue") ? `${shortMoney(a.revenue)} a year` : null],
    ["team", "Team", a.employees ? opt(EMPLOYEES, a.employees).label + (a.employees === "1" ? "" : " people") : null],
    ["history", "History", a.years ? `${opt(YEARS, a.years).label}${a.claims ? ` · ${a.claims === "0" ? "no" : opt(CLAIMS, a.claims).label.toLowerCase()} claims` : ""}` : null],
    ["coverage", "Coverage", seen("coverage") && lines.length ? lines.join(", ") : null],
  ];
}

function Summary({ a, o, current, onEdit }) {
  const est = estimate(a, o);
  return (
    <div className="summary-card">
      <p className="eyebrow">Your estimate</p>
      {est ? (
        <>
          <p className="est"><Money value={est.low} /> <span className="est-dash">–</span> <Money value={est.high} /><small>/mo</small></p>
          <p className="est-sub">From {est.count} carriers · updates as you answer</p>
          <div className="est-track" aria-hidden="true"><i /></div>
        </>
      ) : (
        <p className="est-empty">Choose your type of business to see a price range.</p>
      )}
      {a.fromDocs && <p className="from-docs"><span className="pe-dot" /> Filled in from your documents</p>}
      <ul className="answers">
        {answerRows(a, current).map(([id, label, value]) => (
          <li key={id} className={value ? "" : "empty"}>
            <span className="ans-label">{label}</span>
            <span className="ans-value">{value || "—"}</span>
            {value && id !== current && <button type="button" className="ans-edit" onClick={() => onEdit(id)} aria-label={`Edit ${label.toLowerCase()}`}><Pencil size={13} /></button>}
          </li>
        ))}
      </ul>
      {DEMO_QUOTES && <p className="fine">Sample estimates from demo carriers.</p>}
    </div>
  );
}

/* ---------- page ---------- */
export default function Quote() {
  const { step: param } = useParams();
  const navigate = useNavigate();
  const { a, o, setA, setStep, step: savedStep } = useQuote();
  const [error, setError] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const timer = useRef(0);
  const aRef = useRef(a); aRef.current = a;
  const idx = STEPS.findIndex((s) => s.id === param);
  const st = STEPS[idx];
  useTitle("Get a quote");

  useEffect(() => { if (st) setStep(st.id); setError(null); }, [st, setStep]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!st) return undefined;
    const t = setTimeout(() => {
      const af = document.querySelector(".q-step [data-autofocus]");
      const canType = window.matchMedia?.("(hover: hover)").matches;
      if (af && canType) af.focus({ preventScroll: true });
      else if (!document.querySelector(".q-step input:focus")) document.getElementById("q-title")?.focus({ preventScroll: true });
    }, 260);
    return () => clearTimeout(t);
  }, [st]);
  useEffect(() => {
    if (st?.id !== "coverage") return;
    const key = [a.industry, a.space, a.employees].join("|");
    const ok = availableLines(a.industry).map((l) => l.id);
    if (a.recFor !== key) setA({ lines: recommend(a), recFor: key });
    else if (a.lines.some((l) => !ok.includes(l))) setA({ lines: a.lines.filter((l) => ok.includes(l)) });
  }, [st, a, setA]);

  const markSeen = useCallback((id) => setA((s) => (s.seen.includes(id) ? {} : { seen: [...s.seen, id] })), [setA]);

  const finish = useCallback(() => {
    markSeen("contact");
    const { quotes } = computeQuotes(aRef.current, o);
    const top = [...quotes].sort(SORTS.value).slice(0, 3).map((q) => ({ carrier: q.c.name, monthly: Math.round(q.monthly), annual: q.annual }));
    submitLead("quote_request", aRef.current, { quotes: top });
    navigate("/quotes", { state: { fresh: true } });
  }, [markSeen, navigate, o]);

  const goNext = useCallback(() => {
    const err = st.validate(aRef.current);
    if (err) {
      setError(err);
      if (err[0]) setTimeout(() => document.getElementById(err[0])?.focus(), 0);
      return;
    }
    markSeen(st.id);
    if (idx === STEPS.length - 1) { finish(); return; }
    // When documents filled most of the form, jump to the next question that still needs an answer.
    const cur = aRef.current;
    const nextStep = cur.fromDocs
      ? STEPS.slice(idx + 1).find((s) => s.id === "contact" || !cur.seen.includes(s.id) || s.validate(cur))
      : STEPS[idx + 1];
    navigate(`/quote/${nextStep.id}`);
  }, [st, idx, markSeen, finish, navigate]);

  const advance = useCallback((patch) => {
    setA(patch);
    setError(null);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { markSeen(st.id); navigate(`/quote/${STEPS[idx + 1].id}`); }, 240);
  }, [setA, markSeen, navigate, st, idx]);

  useEffect(() => {
    const k = (e) => {
      if (e.key !== "Enter" || e.defaultPrevented || e.shiftKey) return;
      const tag = e.target.tagName;
      if (tag === "BUTTON" || tag === "A" || tag === "TEXTAREA") return;
      if (document.querySelector(".sheet")) return;
      e.preventDefault(); goNext();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [goNext]);

  if (!st) {
    if (!param && !a.industry) return <Navigate to="/quote/start" replace />;
    return <Navigate to={`/quote/${savedStep && STEPS.some((s) => s.id === savedStep) ? savedStep : "industry"}`} replace />;
  }

  const View = STEP_VIEWS[st.id];
  const inSection = STEPS.filter((s) => s.section === st.section);
  const pos = inSection.indexOf(st);
  const clearError = () => setError(null);
  const est = estimate(a, o);
  const edit = (id) => { setSummaryOpen(false); navigate(`/quote/${id}`); };

  return (
    <div className="quote-page">
      <div className="qtop">
        <div className="wrap qtop-row">
          <Link to="/" className="logo-link" aria-label={`${COMPANY.name} home`}><Logo /></Link>
          <ol className="sections" aria-label={`Step ${idx + 1} of ${STEPS.length}`}>
            {SECTIONS.map((s, i) => (
              <li key={s} className={i < st.section ? "done" : i === st.section ? "now" : ""}>
                <span className="sec-bar"><motion.i initial={false} animate={{ width: i < st.section ? "100%" : i === st.section ? `${((pos + 1) / (inSection.length + 1)) * 100}%` : "0%" }} transition={{ duration: 0.4 }} /></span>
                <span className="sec-label">{s}</span>
              </li>
            ))}
          </ol>
          <Link to="/" className="icon-btn" aria-label="Save and exit"><X size={18} /></Link>
        </div>
        <button type="button" className="est-bar" onClick={() => setSummaryOpen(true)} aria-label="Show your estimate and answers">
          <span className="est-bar-label">{est ? "Estimate" : `Step ${idx + 1} of ${STEPS.length}`}</span>
          {est ? <span className="est-bar-value"><Money value={est.low} />–<Money value={est.high} /><small>/mo</small></span> : <span className="est-bar-value muted">Answer to see prices</span>}
          <ChevronUp size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="wrap quote-grid">
        <main className="quote-main">
          <AnimatePresence mode="wait" initial={false}>
            <motion.section key={st.id} className="q-step" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}>
              <p className="eyebrow">{SECTIONS[st.section]} · Question {idx + 1} of {STEPS.length}</p>
              <h1 className="q-title" id="q-title" tabIndex={-1}>{st.title(a)}</h1>
              <p className="q-sub">{st.sub(a)}</p>
              <div className="q-body"><View a={a} o={o} setA={setA} advance={advance} clearError={clearError} /></div>
              <p className="flow-err" role="alert">{error ? error[1] : ""}</p>
            </motion.section>
          </AnimatePresence>
        </main>
        <aside className="quote-aside" aria-label="Your estimate and answers">
          <Summary a={a} o={o} current={st.id} onEdit={edit} />
        </aside>
      </div>

      <div className="qnav">
        <div className="wrap qnav-row">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => (idx === 0 ? navigate("/") : navigate(`/quote/${STEPS[idx - 1].id}`))}>
            <ArrowLeft size={16} aria-hidden="true" /> {idx === 0 ? "Home" : "Back"}
          </button>
          <div className="qnav-right">
            <span className="kbd-hint">Press <kbd>Enter ↵</kbd></span>
            <button type="button" className="btn btn-primary" onClick={goNext}>
              {idx === STEPS.length - 1 ? "See my quotes" : "Continue"} <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <Sheet open={summaryOpen} onClose={() => setSummaryOpen(false)} title="Your quote so far">
        <Summary a={a} o={o} current={st.id} onEdit={edit} />
      </Sheet>
    </div>
  );
}
