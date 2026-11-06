import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Check, FileText, Info } from "lucide-react";
import FlowTop from "../components/FlowTop.jsx";
import { Reveal } from "../components/fx.jsx";
import { STEPS, answerRows } from "./Quote.jsx";
import { LINE } from "../data/coverage.js";
import { money } from "../lib/format.js";
import { useQuote } from "../lib/store.jsx";
import { useTitle } from "../lib/useTitle.js";

const DOC_NAMES = { acord_25_certificate: "Certificate of insurance", acord_application: "ACORD application", declarations_page: "Declarations page", loss_runs: "Loss runs", other: "Other document", unreadable: "Couldn’t read" };
const fmtDate = (s) => { const d = new Date(`${s}T12:00:00`); return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); };

/* "Here's what we found": shown after documents are read, before any questions. */
export default function QuoteReview() {
  useTitle("Check your details");
  const navigate = useNavigate();
  const { a } = useQuote();
  if (!a.fromDocs || !a.docs) return <Navigate to="/quote/upload" replace />;

  const rows = answerRows(a, null);
  const pending = STEPS.filter((s) => s.id !== "contact" && (!a.seen.includes(s.id) || s.validate(a)));
  const found = rows.length - pending.length;
  const first = pending[0]?.id || "contact";
  const d = a.docs;

  return (
    <div className="quote-page">
      <FlowTop label="Check your details" />
      <main className="wrap review-wrap">
        <p className="eyebrow marked">{d.sample ? "Sample result" : "From your documents"}</p>
        <h1 className="q-title">{pending.length ? `We filled in ${found} of ${rows.length} sections.` : "We found everything we need."}</h1>
        <p className="q-sub">{pending.length ? "Check what we found. We’ll only ask about what’s missing." : "Check what we found, then add your contact details to see quotes."}</p>

        {d.kinds?.length > 0 && <div className="chips rv-docs">{d.kinds.map((k, i) => <span className="chip" key={i}><FileText size={12} aria-hidden="true" /> {DOC_NAMES[k] || k}</span>)}</div>}

        {(d.carrier || d.expiration || d.premium) && (
          <Reveal className="rv-current" y={12} blur={4}>
            <p className="col-title">Your current policy</p>
            <div className="rv-current-row">
              {d.carrier && <div><span>Carrier</span><b>{d.carrier}</b></div>}
              {d.expiration && <div><span>Renews</span><b>{fmtDate(d.expiration)}</b></div>}
              {d.premium && <div><span>Premium</span><b>{money(d.premium)} a year</b></div>}
            </div>
            {d.coverages?.length > 0 && <p className="rv-cov">{d.coverages.map((c) => `${LINE[c.line]?.short || "Other"}${c.limits ? ` ${c.limits}` : ""}`).join(" · ")}</p>}
          </Reveal>
        )}

        <ul className="review-list">
          {rows.map(([id, label, value]) => {
            const missing = pending.some((s) => s.id === id);
            return (
              <li key={id} className={missing ? "missing" : ""}>
                <span className="rv-mark" aria-hidden="true">{missing ? "" : <Check size={14} />}</span>
                <span className="rv-label">{label}</span>
                <span className="rv-value">{missing ? "Missing · we’ll ask" : value}</span>
                <Link to={`/quote/${id}`} className="link-btn">{missing ? "Add" : "Edit"}</Link>
              </li>
            );
          })}
        </ul>

        {d.notes?.length > 0 && (
          <div className="d-note rv-notes"><Info size={16} aria-hidden="true" /><div><b>Worth double-checking</b><ul>{d.notes.map((n) => <li key={n}>{n}</li>)}</ul></div></div>
        )}

        <div className="up-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate(`/quote/${first}`)}>
            {pending.length ? `Answer ${pending.length} more question${pending.length === 1 ? "" : "s"}` : "Continue"} <ArrowRight size={17} aria-hidden="true" />
          </button>
          <Link to="/quote/upload" className="link-btn">Upload different documents</Link>
        </div>
      </main>
    </div>
  );
}
