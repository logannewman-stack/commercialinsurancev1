import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Columns3, Info, PhoneCall, ShieldCheck, X } from "lucide-react";
import Money from "../components/Money.jsx";
import Sheet from "../components/Sheet.jsx";
import { CARRIERS, RATING } from "../data/carriers.js";
import { LINE, recommend } from "../data/coverage.js";
import { SORTS, computeQuotes, lineDetail, profileParts } from "../lib/pricing.js";
import { hash, initials, money } from "../lib/format.js";
import { submitLead } from "../lib/leads.js";
import { isComplete, useQuote } from "../lib/store.jsx";
import { DEMO_QUOTES } from "../config.js";
import { useTitle } from "../lib/useTitle.js";

function Shopping({ a, R, onDone }) {
  const reduce = useReducedMotion();
  const order = useMemo(() => [...CARRIERS].sort((x, y) => hash(x.id + a.zip) - hash(y.id + a.zip)), [a.zip]);
  const [done, setDone] = useState(0);
  const biz = a.business.trim() || "your business";
  useEffect(() => {
    const step = reduce ? 40 : 260, timers = [];
    order.forEach((c, i) => timers.push(setTimeout(() => setDone(i + 1), 350 + i * step)));
    timers.push(setTimeout(onDone, 350 + order.length * step + (reduce ? 120 : 850)));
    return () => timers.forEach(clearTimeout);
  }, [order, onDone, reduce]);
  const finished = done >= order.length;
  return (
    <section className="shopping wrap">
      <div className="shop-card">
        <p className="eyebrow marked">Shopping the market</p>
        <h1 className="h2 shop-title" aria-live="polite">{finished ? `${R.quotes.length} quotes found for ${biz}.` : `Checking ${order.length} carriers for ${biz}…`}</h1>
        <p className="shop-meta">{profileParts(a).join(" · ")}</p>
        <div className="shop-progress" aria-hidden="true"><motion.i animate={{ width: `${(done / order.length) * 100}%` }} transition={{ duration: 0.3 }} /></div>
        <ul className="shop-list">
          {order.map((c, i) => {
            const q = R.quotes.find((x) => x.c === c);
            const resolved = i < done;
            return (
              <li key={c.id} className={resolved ? (q ? "ok" : "no") : ""}>
                <span className="shop-name">{c.name}</span>
                <span className="shop-status">
                  {!resolved ? <><span className="pulse" /> Requesting</> : q ? <motion.span initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }}><Check size={14} /> {money(q.monthly)}/mo</motion.span> : "No quote"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function QuoteCard({ q, i, max, o, compareOn, onCompare, onDetails, onChoose, a, tiv }) {
  const best = q.badges.includes("Best value");
  const price = o.pay === "monthly" ? q.monthly : q.annual;
  return (
    <motion.li layout transition={{ type: "spring", stiffness: 380, damping: 36 }} className={`qcard${best ? " is-best" : ""}`}>
      <span className="qc-rank">{String(i + 1).padStart(2, "0")}</span>
      <div className="qc-id">
        <span className="avatar" aria-hidden="true">{initials(q.c.name)}</span>
        <div>
          <p className="qc-name">{q.c.name}</p>
          <p className="qc-rating">{q.c.rating} · {RATING[q.c.rating].word} financial strength</p>
          {q.badges.length > 0 && <div className="qc-badges">{q.badges.map((b) => <span key={b} className={`badge${b === "Best value" ? " best" : ""}`}>{b}</span>)}</div>}
        </div>
      </div>
      <ul className="qc-cov" aria-label="Coverage in this quote">
        {q.lines.map((l) => (
          <li key={l.id}><span><b>{LINE[l.id].short}</b><small>{lineDetail(l.id, a, o, tiv)}</small></span><span className="amt">{money(l.amt)}/yr</span></li>
        ))}
      </ul>
      <div className="qc-side">
        <p className="qc-price"><Money value={price} unit={o.pay === "monthly" ? "/mo" : "/yr"} /></p>
        <p className="qc-alt">{o.pay === "monthly" ? `or ${money(q.annual)} paid in full` : `or ${money(q.monthly)}/mo`}</p>
        <div className="qc-bar" aria-hidden="true"><motion.i initial={false} animate={{ width: `${(q.annual / max) * 100}%` }} /></div>
        <div className="qc-actions">
          <button type="button" className={`btn btn-sm ${best ? "btn-primary" : "btn-ghost"}`} onClick={onChoose}>Choose</button>
          <button type="button" className="btn btn-sm btn-quiet" onClick={onDetails}>Details</button>
        </div>
        <label className="qc-compare"><input type="checkbox" checked={compareOn} onChange={onCompare} /> Compare</label>
      </div>
    </motion.li>
  );
}

function DetailsBody({ q, a, o, tiv }) {
  const recs = recommend(a).filter((r) => !a.lines.includes(r) && !(a.lines.includes("bop") && (r === "gl" || r === "property")));
  return (
    <div className="details">
      <div className="d-price">
        <p className="qc-price"><Money value={q.monthly} unit="/mo" /></p>
        <p className="qc-alt">{money(q.annual)} paid in full{q.c.fee ? ` · monthly price includes a ${money(q.c.fee)} installment fee` : " · no installment fees"}</p>
      </div>
      <p className="d-about"><ShieldCheck size={16} aria-hidden="true" /> {q.c.rating} financial strength rating. {q.c.about}</p>
      <p className="col-title">Coverage</p>
      <table className="d-table">
        <tbody>
          {q.lines.map((l) => (
            <tr key={l.id}><th scope="row"><b>{LINE[l.id].name}</b><small>{lineDetail(l.id, a, o, tiv)}</small></th><td>{money(l.amt)}/yr</td></tr>
          ))}
          <tr className="d-total"><th scope="row">Total</th><td>{money(q.annual)}/yr</td></tr>
        </tbody>
      </table>
      <p className="col-title">Included with {q.c.name}</p>
      <ul className="ticks-list">{q.c.perks.map((p) => <li key={p}><Check size={15} aria-hidden="true" />{p}</li>)}</ul>
      {recs.length > 0 && (
        <div className="d-note"><Info size={16} aria-hidden="true" /><p>Not in this quote: {recs.map((r) => LINE[r].name.toLowerCase()).join(", ")}. Most businesses like yours carry {recs.length > 1 ? "these" : "it"}.</p></div>
      )}
    </div>
  );
}

function CompareTable({ list, a, o, onChoose }) {
  const ids = [...new Set(list.flatMap((q) => q.lines.map((l) => l.id)))];
  const minM = Math.min(...list.map((q) => q.monthly));
  return (
    <div className="table-scroll">
      <table className="cmp">
        <thead><tr><th scope="col"><span className="sr-only">Feature</span></th>{list.map((q) => <th scope="col" key={q.c.id}>{q.c.name}</th>)}</tr></thead>
        <tbody>
          <tr className="cmp-price"><th scope="row">Monthly</th>{list.map((q) => <td key={q.c.id} className={q.monthly === minM ? "win" : ""}>{money(q.monthly)}</td>)}</tr>
          <tr><th scope="row">Paid in full</th>{list.map((q) => <td key={q.c.id}>{money(q.annual)}</td>)}</tr>
          <tr><th scope="row">Rating</th>{list.map((q) => <td key={q.c.id}>{q.c.rating} · {RATING[q.c.rating].word}</td>)}</tr>
          {ids.map((id) => (
            <tr key={id}><th scope="row">{LINE[id].short}</th>{list.map((q) => { const l = q.lines.find((x) => x.id === id); return <td key={q.c.id}>{l ? `${money(l.amt)}/yr` : "—"}</td>; })}</tr>
          ))}
          <tr><th scope="row">Installment fee</th>{list.map((q) => <td key={q.c.id}>{q.c.fee ? `${money(q.c.fee)}/mo` : "None"}</td>)}</tr>
          <tr><th scope="row">Extras</th>{list.map((q) => <td key={q.c.id} className="cmp-perks">{q.c.perks.join(" · ")}</td>)}</tr>
          <tr><th scope="row"><span className="sr-only">Choose</span></th>{list.map((q) => <td key={q.c.id}><button type="button" className="btn btn-primary btn-sm" onClick={() => onChoose(q)}>Choose</button></td>)}</tr>
        </tbody>
      </table>
    </div>
  );
}

function Advisor({ a }) {
  const [phone, setPhone] = useState(a.phone || "");
  const [time, setTime] = useState("Morning");
  const [state, setState] = useState("idle");
  const send = async (e) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) { setState("invalid"); return; }
    setState("sending");
    const r = await submitLead("callback", { ...a, phone }, { bestTime: time });
    setState(r.ok ? "sent" : r.preview ? "preview" : "error");
  };
  return (
    <div className="advisor">
      <div className="adv-copy">
        <span className="adv-icon"><PhoneCall size={18} aria-hidden="true" /></span>
        <div>
          <h2 className="adv-title">Want a second opinion?</h2>
          <p>A licensed advisor can walk through these quotes with you and check for gaps in your coverage.</p>
        </div>
      </div>
      {state === "sent" ? (
        <p className="adv-done"><Check size={16} /> Got it. An advisor will call you in the {time.toLowerCase()}.</p>
      ) : state === "preview" ? (
        <p className="adv-done">Preview build: this request wasn’t sent. On the live site it goes straight to your inbox.</p>
      ) : (
        <form className="adv-form" onSubmit={send} noValidate>
          <label className="sr-only" htmlFor="adv-phone">Phone number</label>
          <input id="adv-phone" className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="Phone number" value={phone} aria-invalid={state === "invalid"} onChange={(e) => { setPhone(e.target.value); setState("idle"); }} />
          <label className="sr-only" htmlFor="adv-time">Best time to call</label>
          <select id="adv-time" className="input" value={time} onChange={(e) => setTime(e.target.value)}>
            <option>Morning</option><option>Afternoon</option><option>Evening</option>
          </select>
          <button type="submit" className="btn btn-primary" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Request a call"}</button>
          {state === "invalid" && <p className="flow-err" role="alert">Enter a 10-digit phone number.</p>}
          {state === "error" && <p className="flow-err" role="alert">We couldn’t send that. Check your connection and try again.</p>}
        </form>
      )}
    </div>
  );
}

export default function Results() {
  const { a, o, setO } = useQuote();
  const location = useLocation();
  const navigate = useNavigate();
  const [phase, setPhase] = useState(location.state?.fresh ? "shopping" : "done");
  const [compare, setCompare] = useState([]);
  const [details, setDetails] = useState(null);
  const [cmpOpen, setCmpOpen] = useState(false);
  const R = useMemo(() => computeQuotes(a, o), [a, o]);
  useTitle("Your quotes");
  const doneRef = useRef(() => {});
  doneRef.current = () => { setPhase("done"); navigate(location.pathname, { replace: true, state: null }); window.scrollTo(0, 0); };
  const onDone = useMemo(() => () => doneRef.current(), []);

  if (!isComplete(a)) return <Navigate to="/quote" replace />;
  if (phase === "shopping") return <Shopping a={a} R={R} onDone={onDone} />;

  const n = R.quotes.length;
  const biz = a.business.trim() || "your business";
  const sorted = [...R.quotes].sort(SORTS[o.sort] || SORTS.value);
  const max = n ? Math.max(...R.quotes.map((q) => q.annual)) : 1;
  const bestQ = R.quotes.find((q) => q.badges.includes("Best value"));
  const lowQ = R.quotes.find((q) => q.badges.includes("Lowest price"));
  const hasProp = a.lines.includes("bop") || a.lines.includes("property");
  const hasLiab = a.lines.some((l) => !["wc", "property", "tools"].includes(l));
  const choose = (q) => navigate(`/checkout/${q.c.id}`);
  const toggleCompare = (id) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? [...c.slice(1), id] : [...c, id]));
  const cmpList = compare.map((id) => R.quotes.find((q) => q.c.id === id)).filter(Boolean);
  const detailQ = details && R.quotes.find((q) => q.c.id === details);

  return (
    <main className="results">
      <div className="wrap">
        <div className="res-top">
          <Link to="/quote/industry" className="link-btn"><ArrowLeft size={16} aria-hidden="true" /> Edit answers</Link>
          {DEMO_QUOTES && <span className="tag">Sample estimates · demo carriers</span>}
        </div>
        <p className="eyebrow marked">Your quotes</p>
        <h1 className="res-title">{n ? `${n} carrier${n === 1 ? "" : "s"} can insure ${biz}.` : `No carriers could quote ${biz} yet.`}</h1>
        <p className="res-meta">{profileParts(a).join(" · ")}</p>

        {n > 0 && (
          <>
            <div className="stats">
              <div><p className="stat-label">Best value</p><p className="stat-val"><Money value={bestQ.monthly} unit="/mo" /></p><p className="stat-sub">{bestQ.c.name}</p></div>
              <div><p className="stat-label">Lowest price</p><p className="stat-val"><Money value={lowQ.monthly} unit="/mo" /></p><p className="stat-sub">{lowQ.c.name}</p></div>
              <div><p className="stat-label">Price spread</p><p className="stat-val"><Money value={max - lowQ.annual} unit="/yr" /></p><p className="stat-sub">Between the lowest and highest quote</p></div>
            </div>

            <div className="toolbar">
              <div className="seg" role="group" aria-label="Sort quotes">
                {[["value", "Best value"], ["price", "Lowest price"], ["rating", "Top rated"]].map(([k, l]) => (
                  <button key={k} type="button" aria-pressed={o.sort === k} onClick={() => setO({ sort: k })}>{l}</button>
                ))}
              </div>
              <div className="tool-right">
                <div className="seg seg-sm" role="group" aria-label="Show prices">
                  <button type="button" aria-pressed={o.pay === "monthly"} onClick={() => setO({ pay: "monthly" })}>Monthly</button>
                  <button type="button" aria-pressed={o.pay === "annual"} onClick={() => setO({ pay: "annual" })}>Paid in full</button>
                </div>
                {hasLiab && (
                  <label className="sel"><span>Liability limits</span>
                    <select value={o.limit} onChange={(e) => setO({ limit: e.target.value })}><option value="1/2">$1M / $2M</option><option value="2/4">$2M / $4M</option></select>
                  </label>
                )}
                {hasProp && (
                  <label className="sel"><span>Deductible</span>
                    <select value={o.deductible} onChange={(e) => setO({ deductible: parseInt(e.target.value, 10) })}>{[500, 1000, 2500, 5000].map((d) => <option key={d} value={d}>{money(d)}</option>)}</select>
                  </label>
                )}
              </div>
            </div>

            <LayoutGroup>
              <ol className="qlist">
                {sorted.map((q, i) => (
                  <QuoteCard key={q.c.id} q={q} i={i} max={max} o={o} a={a} tiv={R.tiv}
                    compareOn={compare.includes(q.c.id)} onCompare={() => toggleCompare(q.c.id)}
                    onDetails={() => setDetails(q.c.id)} onChoose={() => choose(q)} />
                ))}
              </ol>
            </LayoutGroup>
          </>
        )}

        {R.declined.length > 0 && (
          <details className="declined">
            <summary>{R.declined.length} carrier{R.declined.length === 1 ? "" : "s"} couldn’t quote</summary>
            <ul>{R.declined.map((d) => <li key={d.c.id}><span>{d.c.name}</span><span>{d.reason}</span></li>)}</ul>
          </details>
        )}

        <Advisor a={a} />

        <p className="fine res-fine">
          {DEMO_QUOTES ? "These are sample estimates from demo carriers, calculated from your answers. " : ""}
          Final prices are set by each carrier when it reviews your application. Best value ranks quotes by price and the carrier’s financial strength rating.
        </p>
      </div>

      <AnimatePresence>
        {compare.length > 0 && (
          <motion.div className="cmp-tray" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 38 }}>
            <div className="wrap cmp-row">
              <p className="cmp-names"><b>{compare.length}</b> selected<span className="cmp-list"> · {cmpList.map((q) => q.c.name).join(", ")}</span></p>
              <div className="cmp-actions">
                <button type="button" className="btn btn-quiet btn-sm" onClick={() => setCompare([])}><X size={15} aria-hidden="true" /> Clear</button>
                <button type="button" className="btn btn-accent btn-sm" disabled={compare.length < 2} onClick={() => setCmpOpen(true)}>
                  <Columns3 size={15} aria-hidden="true" /> {compare.length < 2 ? "Pick one more" : "Compare side by side"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={!!detailQ} onClose={() => setDetails(null)} title={detailQ ? detailQ.c.name : ""}
        footer={detailQ && <button type="button" className="btn btn-primary btn-block" onClick={() => choose(detailQ)}>Choose this quote <ArrowRight size={16} aria-hidden="true" /></button>}>
        {detailQ && <DetailsBody q={detailQ} a={a} o={o} tiv={R.tiv} />}
      </Sheet>
      <Sheet open={cmpOpen && cmpList.length >= 2} onClose={() => setCmpOpen(false)} title="Compare quotes" kind="modal" wide>
        <CompareTable list={cmpList} a={a} o={o} onChoose={choose} />
      </Sheet>
    </main>
  );
}
