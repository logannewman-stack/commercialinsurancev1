import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import Money from "../components/Money.jsx";
import { LINE } from "../data/coverage.js";
import { RATING } from "../data/carriers.js";
import { STATE_NAMES, zipState } from "../data/geo.js";
import { computeQuotes, lineDetail } from "../lib/pricing.js";
import { initials, money } from "../lib/format.js";
import { submitLead } from "../lib/leads.js";
import { isComplete, useQuote } from "../lib/store.jsx";
import { COMPANY, DEMO_QUOTES } from "../config.js";
import { useTitle } from "../lib/useTitle.js";

const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
function dates() {
  const t = new Date(); const tm = new Date(t); tm.setDate(t.getDate() + 1);
  const first = new Date(t.getFullYear(), t.getMonth() + 1, 1);
  return { today: iso(t), tomorrow: iso(tm), first: iso(first) };
}
const pretty = (s) => new Date(s + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { a, o, setA, setO, setSubmission } = useQuote();
  const R = useMemo(() => computeQuotes(a, o), [a, o]);
  const q = R.quotes.find((x) => x.c.id === id);
  const d = useMemo(dates, []);
  const st = zipState(a.zip);
  const [start, setStart] = useState(d.tomorrow);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  useTitle("Request your policy");

  if (!isComplete(a)) return <Navigate to="/quote" replace />;
  if (!q) return <Navigate to="/quotes" replace />;

  const plan = o.pay;
  const due = plan === "monthly" ? q.monthly : q.annual;
  const fail = (field, msg) => { setErr([field, msg]); setTimeout(() => document.getElementById(field)?.focus(), 0); };

  const submit = async (e) => {
    e.preventDefault();
    if (!start || start < d.today) return fail("c-start", "Choose a start date of today or later.");
    if (!a.business.trim()) return fail("c-biz", "Add the legal name of your business.");
    if (!street.trim()) return fail("c-street", "Add your business street address.");
    if (!city.trim()) return fail("c-city", "Add your city.");
    if (!a.name.trim()) return fail("c-name", "Add your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a.email.trim())) return fail("c-email", "Enter a valid email address.");
    if (a.phone.replace(/\D/g, "").length < 10) return fail("c-phone", "Enter a 10-digit phone number so your advisor can reach you.");
    if (!agree) return fail("c-agree", "Confirm that your answers are accurate to continue.");
    setErr(null); setBusy(true);
    const res = await submitLead("bind_request", a, {
      carrier: q.c.name, carrierId: q.c.id, plan, startDate: start,
      premium: { annual: q.annual, monthly: Math.round(q.monthly) },
      coverage: q.lines.map((l) => ({ name: LINE[l.id].name, annual: l.amt, detail: lineDetail(l.id, a, o, R.tiv) })),
      address: { street, city, state: st, zip: a.zip },
    });
    setBusy(false);
    if (!res.ok && !res.preview) { setErr([null, "We couldn’t send your request. Check your connection and try again."]); return; }
    const ref = res.id || "LD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setSubmission({ ref, carrier: q.c.name, plan, start, monthly: q.monthly, annual: q.annual, lines: q.lines.map((l) => l.id), preview: !!res.preview, at: Date.now() });
    navigate("/confirmation");
  };

  const invalid = (f) => (err && err[0] === f ? { "aria-invalid": true } : {});
  const fix = (f, set) => (e) => { set(e.target.type === "checkbox" ? e.target.checked : e.target.value); if (err && (err[0] === f || !err[0])) setErr(null); };

  return (
    <main className="checkout">
      <div className="wrap">
        <Link to="/quotes" className="link-btn"><ArrowLeft size={16} aria-hidden="true" /> Back to quotes</Link>
        <div className="co-grid">
          <form className="co-form" onSubmit={submit} noValidate>
            <p className="eyebrow marked">Request your policy</p>
            <h1 className="res-title">Almost covered.</h1>
            <p className="res-meta">A few details so your advisor can finalize the policy with {q.c.name}. Nothing is charged today.</p>

            <fieldset className="co-sec">
              <legend><span className="co-n">01</span> When should coverage start?</legend>
              <div className="quick">
                {[["Today", d.today], ["Tomorrow", d.tomorrow], ["1st of next month", d.first]].map(([l, v]) => (
                  <button type="button" key={v} className={`chip-btn${start === v ? " on" : ""}`} aria-pressed={start === v} onClick={() => { setStart(v); if (err && err[0] === "c-start") setErr(null); }}>{l}</button>
                ))}
              </div>
              <div className="field narrow">
                <label htmlFor="c-start">Start date</label>
                <input id="c-start" className="input" type="date" min={d.today} value={start} onChange={fix("c-start", setStart)} {...invalid("c-start")} />
              </div>
            </fieldset>

            <fieldset className="co-sec">
              <legend><span className="co-n">02</span> How do you want to pay?</legend>
              <div className="plans">
                <label className={`plan${plan === "monthly" ? " on" : ""}`}>
                  <input type="radio" name="plan" checked={plan === "monthly"} onChange={() => setO({ pay: "monthly" })} />
                  <span className="plan-name">Monthly</span>
                  <span className="plan-price">{money(q.monthly)}<small>/mo</small></span>
                  <span className="plan-sub">{q.c.fee ? `Includes a ${money(q.c.fee)} installment fee` : "No installment fees"}</span>
                </label>
                <label className={`plan${plan === "annual" ? " on" : ""}`}>
                  <input type="radio" name="plan" checked={plan === "annual"} onChange={() => setO({ pay: "annual" })} />
                  <span className="plan-name">Pay in full</span>
                  <span className="plan-price">{money(q.annual)}<small>/yr</small></span>
                  <span className="plan-sub">{q.c.fee ? `Saves ${money(q.c.fee * 12)} a year` : "Same total as monthly"}</span>
                </label>
              </div>
            </fieldset>

            <fieldset className="co-sec">
              <legend><span className="co-n">03</span> Business details</legend>
              <div className="form-grid">
                <div className="field span-2"><label htmlFor="c-biz">Legal business name</label><input id="c-biz" className="input" autoComplete="organization" value={a.business} onChange={fix("c-biz", (v) => setA({ business: v }))} {...invalid("c-biz")} /></div>
                <div className="field span-2"><label htmlFor="c-street">Street address</label><input id="c-street" className="input" autoComplete="address-line1" value={street} onChange={fix("c-street", setStreet)} {...invalid("c-street")} /></div>
                <div className="field"><label htmlFor="c-city">City</label><input id="c-city" className="input" autoComplete="address-level2" value={city} onChange={fix("c-city", setCity)} {...invalid("c-city")} /></div>
                <div className="field"><label htmlFor="c-zip">State and ZIP</label><input id="c-zip" className="input" value={`${st ? STATE_NAMES[st] : ""} ${a.zip}`.trim()} readOnly aria-describedby="c-zip-note" /><span className="fine" id="c-zip-note">From your quote. <Link to="/quote/zip">Change</Link></span></div>
                <div className="field"><label htmlFor="c-name">Your name</label><input id="c-name" className="input" autoComplete="name" value={a.name} onChange={fix("c-name", (v) => setA({ name: v }))} {...invalid("c-name")} /></div>
                <div className="field"><label htmlFor="c-phone">Phone</label><input id="c-phone" className="input" type="tel" inputMode="tel" autoComplete="tel" value={a.phone} onChange={fix("c-phone", (v) => setA({ phone: v }))} {...invalid("c-phone")} /></div>
                <div className="field span-2"><label htmlFor="c-email">Email</label><input id="c-email" className="input" type="email" inputMode="email" autoComplete="email" value={a.email} onChange={fix("c-email", (v) => setA({ email: v }))} {...invalid("c-email")} /></div>
              </div>
            </fieldset>

            <label className="agree">
              <input id="c-agree" type="checkbox" checked={agree} onChange={fix("c-agree", setAgree)} {...invalid("c-agree")} />
              <span>My answers are accurate to the best of my knowledge, and {COMPANY.name} may share them with {q.c.name} to finalize this policy.</span>
            </label>

            <p className="flow-err" role="alert">{err ? err[1] : ""}</p>
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
              <Lock size={16} aria-hidden="true" /> {busy ? "Sending…" : "Request this policy"}
            </button>
            <p className="fine co-fine">Nothing is charged today. A licensed advisor confirms your details with {q.c.name} before the policy is issued.</p>
          </form>

          <aside className="co-summary" aria-label="Order summary">
            <div className="summary-card">
              <div className="qc-id">
                <span className="avatar" aria-hidden="true">{initials(q.c.name)}</span>
                <div><p className="qc-name">{q.c.name}</p><p className="qc-rating">{q.c.rating} · {RATING[q.c.rating].word} financial strength</p></div>
              </div>
              <ul className="sum-lines">
                {q.lines.map((l) => <li key={l.id}><span><b>{LINE[l.id].short}</b><small>{lineDetail(l.id, a, o, R.tiv)}</small></span><span>{money(l.amt)}</span></li>)}
              </ul>
              <div className="sum-total">
                <span>{plan === "monthly" ? "Monthly" : "Paid in full"}</span>
                <span className="sum-due"><Money value={due} unit={plan === "monthly" ? "/mo" : "/yr"} /></span>
              </div>
              <p className="sum-start">Starts {pretty(start)}</p>
              {DEMO_QUOTES && <p className="fine">Sample estimate from a demo carrier.</p>}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
