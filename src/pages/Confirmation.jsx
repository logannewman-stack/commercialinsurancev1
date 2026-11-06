import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { LINE } from "../data/coverage.js";
import { money } from "../lib/format.js";
import { useQuote } from "../lib/store.jsx";
import { useTitle } from "../lib/useTitle.js";

const READY = {
  wc: "Payroll estimates by job type for the next 12 months",
  auto: "Driver names and license numbers, plus each vehicle’s VIN",
  property: "Year built, construction type and roof age of your building",
  bop: "Year built, construction type and roof age of your building",
  pl: "A short description of the services you provide and any client contracts",
  cyber: "How you store customer data and take payments",
  liquor: "Your liquor license and the share of sales from alcohol",
};

export default function Confirmation() {
  const { submission: s } = useQuote();
  useTitle("Request received");
  if (!s) return <Navigate to="/" replace />;
  const ready = ["Your Federal Employer Identification Number (FEIN)", "The declarations page from any current policy", ...[...new Set(s.lines.map((l) => READY[l]).filter(Boolean))]];
  const date = new Date(s.start + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" });
  return (
    <main className="confirm">
      <div className="wrap confirm-wrap">
        <motion.span className="confirm-check" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 320, damping: 18 }}>
          <Check size={30} strokeWidth={2.5} aria-hidden="true" />
        </motion.span>
        <p className="eyebrow">{s.preview ? "Preview build" : `Reference ${s.ref}`}</p>
        <h1 className="res-title">{s.preview ? "This is where your request would be sent." : "Request received."}</h1>
        <p className="res-meta">
          {s.preview
            ? "The preview has no backend, so nothing was sent. On the live site, this request goes straight to Keel and the customer sees this confirmation."
            : `A licensed advisor will contact you shortly to finalize your ${s.carrier} policy, starting ${date}.`}
        </p>
        <div className="confirm-card">
          <div className="cc-row"><span>Carrier</span><b>{s.carrier}</b></div>
          <div className="cc-row"><span>Coverage</span><b>{s.lines.map((l) => LINE[l].short).join(", ")}</b></div>
          <div className="cc-row"><span>Price</span><b>{s.plan === "monthly" ? `${money(s.monthly)}/mo` : `${money(s.annual)} paid in full`}</b></div>
          <div className="cc-row"><span>Starts</span><b>{date}</b></div>
        </div>
        <div className="confirm-cols">
          <div>
            <p className="col-title">What happens next</p>
            <ol className="next-steps">
              <li>An advisor reviews your answers with you, usually within one business hour.</li>
              <li>{s.carrier} confirms your final price.</li>
              <li>You sign and pay online, and your certificate of insurance arrives by email.</li>
            </ol>
          </div>
          <div>
            <p className="col-title">Good to have ready</p>
            <ul className="ticks-list">{ready.map((r) => <li key={r}><Check size={15} aria-hidden="true" />{r}</li>)}</ul>
          </div>
        </div>
        <div className="confirm-actions">
          <Link to="/quotes" className="btn btn-ghost">Back to my quotes</Link>
          <Link to="/" className="btn btn-primary">Done</Link>
        </div>
      </div>
    </main>
  );
}
