import { useEffect, useMemo, useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { money } from "../lib/format.js";

const EXAMPLES = [
  { tab: "Café", biz: "Brightside Café", meta: "Restaurant · Austin, TX · 2,400 sq ft", chips: ["BOP", "Workers’ comp", "Liquor liability"],
    rows: [["Ashgrove Mutual", "A+", 447], ["Driftwood Specialty", "A", 529], ["Everstone Indemnity", "A+", 412], ["Bellmoor Casualty", "A", 436]] },
  { tab: "Electrician", biz: "Volt & Vine Electric", meta: "Contractor · Phoenix, AZ · 6 people", chips: ["General liability", "Workers’ comp", "Commercial auto"],
    rows: [["Everstone Indemnity", "A+", 1612], ["Halden Commercial", "A-", 1701], ["Bellmoor Casualty", "A", 1486], ["Driftwood Specialty", "A", 1544]] },
  { tab: "Consultant", biz: "Northside Advisory", meta: "Professional services · Chicago, IL · Home-based", chips: ["Professional liability", "General liability", "Cyber"],
    rows: [["Kittering Underwriters", "A+", 173], ["Copperline", "A-", 151], ["Fernhill Assurance", "A", 142], ["Lanternbay", "A-", 158]] },
];

export default function HeroLedger() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [sorted, setSorted] = useState(false);
  const [auto, setAuto] = useState(true);
  const ex = EXAMPLES[idx];

  useEffect(() => {
    setSorted(false);
    const t = setTimeout(() => setSorted(true), reduce ? 0 : 900);
    return () => clearTimeout(t);
  }, [idx, reduce]);
  useEffect(() => {
    if (!auto || reduce) return undefined;
    const t = setTimeout(() => setIdx((i) => (i + 1) % EXAMPLES.length), 6200);
    return () => clearTimeout(t);
  }, [idx, auto, reduce]);

  const rows = useMemo(() => (sorted ? [...ex.rows].sort((a, b) => a[2] - b[2]) : ex.rows), [ex, sorted]);
  const max = Math.max(...ex.rows.map((r) => r[2])), min = Math.min(...ex.rows.map((r) => r[2]));
  const best = rows[0];

  return (
    <aside className="ledger" aria-label="Sample quote comparison">
      <div className="ledger-tabs" role="tablist" aria-label="Sample businesses">
        {EXAMPLES.map((e, i) => (
          <button key={e.tab} role="tab" type="button" aria-selected={i === idx} className={i === idx ? "on" : ""} onClick={() => { setAuto(false); setIdx(i); }}>
            {e.tab}
          </button>
        ))}
        <span className="tag">Sample</span>
      </div>
      <div className="ledger-head">
        <p className="ledger-biz">{ex.biz}</p>
        <p className="ledger-meta">{ex.meta}</p>
        <div className="chips">{ex.chips.map((c) => <span key={c} className="chip">{c}</span>)}</div>
      </div>
      <LayoutGroup id={`ledger-${idx}`}>
        <ol className="rows">
          {rows.map((r) => {
            const isBest = sorted && r === best;
            return (
              <motion.li layout={!reduce} transition={{ type: "spring", stiffness: 380, damping: 34 }} key={ex.tab + r[0]} className={`row${isBest ? " is-best" : ""}`}>
                <span className="row-name">{r[0]} <span className="row-rating">{r[1]}</span>{isBest && <span className="row-best">Lowest</span>}</span>
                <span className="row-price">{money(r[2])}<small>/mo</small></span>
                <span className="bar"><motion.i initial={{ width: 0 }} animate={{ width: `${(r[2] / max) * 100}%` }} transition={{ duration: reduce ? 0 : 0.7, ease: [0.2, 0.8, 0.2, 1] }} /></span>
              </motion.li>
            );
          })}
        </ol>
      </LayoutGroup>
      <p className="ledger-foot" aria-live="polite">
        <span className={`pulse${sorted ? " done" : ""}`} />
        {sorted ? <span>Sorted by price · {best[0]} saves {money((max - min) * 12)} a year</span> : <span>Comparing carriers…</span>}
      </p>
    </aside>
  );
}
