/*
  A resolution-independent phone. Everything inside the screen is sized in
  container-query units (cqw), so the same screens render crisply at any width.
*/
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, FileText, Search } from "lucide-react";
import { Mark } from "./Logo.jsx";

export function Phone({ children, className = "" }) {
  return (
    <div className={`phone ${className}`}>
      <div className="phone-rail">
        <div className="phone-bezel">
          <div className="phone-screen">
            {children}
            <span className="phone-island" aria-hidden="true" />
            <span className="phone-glare" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Chrome({ step, children }) {
  return (
    <div className="ps">
      <div className="ps-status" aria-hidden="true"><span>9:41</span><span className="ps-icons"><i /><i /><i /></span></div>
      <div className="ps-app">
        <span className="ps-brand"><Mark className="ps-mark" /> keel</span>
        {step && <span className="ps-step">{step}</span>}
      </div>
      <div className="ps-body">{children}</div>
    </div>
  );
}

/* Types out a word when the screen becomes active. */
function useTyped(text, active) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (!active) { setN(reduce ? text.length : 0); return undefined; }
    if (reduce) { setN(text.length); return undefined; }
    let i = 0;
    const t = setInterval(() => { i += 1; setN(i); if (i >= text.length) clearInterval(t); }, 110);
    return () => clearInterval(t);
  }, [active, text, reduce]);
  return text.slice(0, n);
}

/* Counts 0→total over time while the screen is active. */
function useTick(total, active, every = 260) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? total : 0);
  useEffect(() => {
    if (!active) { setN(reduce ? total : 0); return undefined; }
    if (reduce) { setN(total); return undefined; }
    let i = 0;
    const t = setInterval(() => { i += 1; setN(i); if (i >= total) clearInterval(t); }, every);
    return () => clearInterval(t);
  }, [active, total, every, reduce]);
  return n;
}

export function SearchScreen({ active }) {
  const typed = useTyped("café", active);
  const show = typed.length >= 2;
  return (
    <Chrome step="1 of 8">
      <p className="ps-h">What kind of business do you run?</p>
      <div className="ps-search"><Search aria-hidden="true" /><span>{typed}<i className="ps-caret" /></span></div>
      <motion.ul className="ps-results" initial={false} animate={{ opacity: show ? 1 : 0, y: show ? 0 : 6 }}>
        <li className="on"><span>Café or coffee shop</span><small>Restaurant</small></li>
        <li><span>Catering</span><small>Restaurant</small></li>
        <li><span>Bakery</span><small>Restaurant</small></li>
      </motion.ul>
      <p className="ps-label">Popular</p>
      <div className="ps-chips"><span>Contractor</span><span>Salon</span><span>Dentist</span><span>Retail</span></div>
      <motion.div className="ps-note" initial={false} animate={{ opacity: show ? 1 : 0.35 }}>
        <p className="ps-label">Usually carried by cafés</p>
        <div className="ps-chips"><span className="on">BOP</span><span className="on">Workers’ comp</span><span className="on">Liquor</span></div>
      </motion.div>
    </Chrome>
  );
}

export function QuestionScreen({ active }) {
  const n = useTick(1, active, 700);
  return (
    <Chrome step="5 of 8">
      <div className="ps-progress" aria-hidden="true">{[1, 1, 1, 0.5, 0].map((f, i) => <i key={i}><b style={{ width: `${f * 100}%` }} /></i>)}</div>
      <p className="ps-h">How many people work for the business?</p>
      <div className="ps-tiles">
        {["Just me", "2–5", "6–10", "11–25", "26–50", "51–100"].map((t) => <span key={t} className={t === "6–10" && n ? "on" : ""}>{t}</span>)}
      </div>
      <div className="ps-note"><p className="ps-label">Why we ask</p><p>Workers’ comp is priced on payroll, so team size changes your price more than almost anything else.</p></div>
      <div className="ps-est"><span>Estimate</span><b>$412–$529<small>/mo</small></b></div>
    </Chrome>
  );
}

const SHOP = [["Everstone Indemnity", "$412"], ["Bellmoor Casualty", "$436"], ["Kittering", null], ["Ashgrove Mutual", "$447"], ["Halden Commercial", "$461"], ["Driftwood Specialty", "$529"]];
export function ShoppingScreen({ active }) {
  const n = useTick(SHOP.length, active, 320);
  return (
    <Chrome step="Shopping">
      <p className="ps-h">Checking 9 carriers for Brightside Café…</p>
      <div className="ps-bar" aria-hidden="true"><i style={{ width: `${(n / SHOP.length) * 100}%` }} /></div>
      <ul className="ps-shop">
        {SHOP.map(([name, price], i) => (
          <li key={name}>
            <span>{name}</span>
            {i < n ? (price ? <b><Check aria-hidden="true" />{price}/mo</b> : <em>No quote</em>) : <em><span className="pulse" /> Asking</em>}
          </li>
        ))}
      </ul>
    </Chrome>
  );
}

export function QuotesScreen() {
  return (
    <Chrome step="Your quotes">
      <p className="ps-h">6 carriers can insure Brightside Café.</p>
      <div className="ps-best">
        <span className="ps-badge">Best value</span>
        <div className="ps-best-row"><span>Everstone Indemnity<small>A+ · BOP, WC, Liquor</small></span><b>$412<small>/mo</small></b></div>
        <span className="ps-cta">Choose this quote</span>
      </div>
      <ul className="ps-quotes">
        {[["Bellmoor Casualty", "$436"], ["Ashgrove Mutual", "$447"], ["Halden Commercial", "$461"], ["Driftwood Specialty", "$529"]].map(([n, p]) => <li key={n}><span>{n}</span><b>{p}<small>/mo</small></b></li>)}
      </ul>
      <p className="ps-foot">3 carriers couldn’t quote · see why</p>
    </Chrome>
  );
}

export function DoneScreen({ active }) {
  const reduce = useReducedMotion();
  return (
    <Chrome>
      <motion.span className="ps-check" initial={false} animate={active && !reduce ? { scale: [0.6, 1.08, 1], opacity: [0, 1, 1] } : { scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}>
        <Check aria-hidden="true" />
      </motion.span>
      <p className="ps-h center">Request received.</p>
      <p className="ps-sub center">Reference KL-7Q2M4C</p>
      <div className="ps-card">
        <div><span>Carrier</span><b>Everstone</b></div>
        <div><span>Starts</span><b>Tomorrow</b></div>
        <div><span>Price</span><b>$412/mo</b></div>
      </div>
      <div className="ps-doc"><FileText aria-hidden="true" /><span>Certificate of insurance<small>Emailed once your policy is issued</small></span></div>
      <ol className="ps-next">
        <li><b>1</b>An advisor confirms your details</li>
        <li><b>2</b>Everstone confirms the final price</li>
        <li><b>3</b>Sign, pay and you’re covered</li>
      </ol>
    </Chrome>
  );
}
