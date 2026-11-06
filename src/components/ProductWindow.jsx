import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGroup, motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { money, initials } from "../lib/format.js";
import { useMedia } from "./fx.jsx";

const EXAMPLES = [
  { tab: "Café", biz: "Brightside Café",
    rows: [["Business", "Café or coffee shop"], ["Location", "Austin, TX 78704"], ["Space", "2,400 sq ft, leased"], ["Revenue", "$850k a year"], ["Team", "6–10 people"]],
    cov: ["BOP", "Workers’ comp", "Liquor"],
    quotes: [["Ashgrove Mutual", "A+", 447], ["Driftwood Specialty", "A", 529], ["Everstone Indemnity", "A+", 412], ["Bellmoor Casualty", "A", 436], ["Halden Commercial", "A-", 461]] },
  { tab: "Electrician", biz: "Volt & Vine Electric",
    rows: [["Business", "Electrician"], ["Location", "Phoenix, AZ 85004"], ["Space", "No fixed location"], ["Revenue", "$1.2M a year"], ["Team", "6–10 people"]],
    cov: ["General liability", "Workers’ comp", "Auto"],
    quotes: [["Everstone Indemnity", "A+", 1612], ["Halden Commercial", "A-", 1701], ["Bellmoor Casualty", "A", 1486], ["Driftwood Specialty", "A", 1544], ["Ashgrove Mutual", "A+", 1655]] },
  { tab: "Consultant", biz: "Northside Advisory",
    rows: [["Business", "Consultant"], ["Location", "Chicago, IL 60601"], ["Space", "Home-based"], ["Revenue", "$320k a year"], ["Team", "Just you"]],
    cov: ["E&O", "General liability", "Cyber"],
    quotes: [["Kittering Underwriters", "A+", 173], ["Copperline", "A-", 151], ["Fernhill Assurance", "A", 142], ["Lanternbay", "A-", 158], ["Everstone Indemnity", "A+", 166]] },
];

export default function ProductWindow() {
  const stage = useRef(null);
  const reduce = useReducedMotion();
  const wide = useMedia("(min-width: 900px)");
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start end", "start 0.2"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4, restDelta: 0.0005 });
  const rotateX = useTransform(p, [0, 1], [wide ? 26 : 12, 0]);
  const scale = useTransform(p, [0, 1], [0.9, 1]);
  const y = useTransform(p, [0, 1], [50, 0]);

  const [idx, setIdx] = useState(0);
  const [sorted, setSorted] = useState(false);
  const [auto, setAuto] = useState(true);
  const ex = EXAMPLES[idx];
  useEffect(() => {
    setSorted(false);
    const t = setTimeout(() => setSorted(true), reduce ? 0 : 1000);
    return () => clearTimeout(t);
  }, [idx, reduce]);
  useEffect(() => {
    if (!auto || reduce) return undefined;
    const t = setTimeout(() => setIdx((i) => (i + 1) % EXAMPLES.length), 6500);
    return () => clearTimeout(t);
  }, [idx, auto, reduce]);

  const rows = useMemo(() => (sorted ? [...ex.quotes].sort((a, b) => a[2] - b[2]) : ex.quotes), [ex, sorted]);
  const max = Math.max(...ex.quotes.map((q) => q[2]));
  const min = Math.min(...ex.quotes.map((q) => q[2]));

  return (
    <div className="pw-stage" ref={stage}>
      <div className="pw-glow" aria-hidden="true" />
      <motion.div className="pw" style={reduce ? undefined : { rotateX, scale, y }} role="img" aria-label={`Sample comparison: ${ex.quotes.length} carriers quoting ${ex.biz}, lowest ${money(min)} a month`}>
        <div className="pw-bar">
          <span className="pw-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="pw-title">Keel · Your quotes</span>
          <span className="tag">Sample</span>
        </div>
        <div className="pw-body">
          <aside className="pw-side">
            <p className="pw-label">Your business</p>
            <p className="pw-biz">{ex.biz}</p>
            <dl className="pw-rows">{ex.rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            <p className="pw-label">Coverage</p>
            <div className="chips">{ex.cov.map((c) => <span className="chip" key={c}>{c}</span>)}</div>
            <div className="pw-est">
              <p className="pw-label">Estimate</p>
              <p className="pw-est-val">{money(min)}–{money(max)}<small>/mo</small></p>
            </div>
          </aside>
          <div className="pw-main">
            <div className="pw-main-head">
              <p className="pw-h">{ex.quotes.length} carriers can insure {ex.biz}.</p>
              <div className="pw-tabs" role="tablist" aria-label="Sample businesses">
                {EXAMPLES.map((e, i) => (
                  <button key={e.tab} type="button" role="tab" aria-selected={i === idx} className={i === idx ? "on" : ""} onClick={() => { setAuto(false); setIdx(i); }}>{e.tab}</button>
                ))}
              </div>
            </div>
            <LayoutGroup id={`pw-${idx}`}>
              <ol className="pw-list">
                {rows.map((r) => {
                  const best = sorted && r === rows[0];
                  return (
                    <motion.li key={ex.tab + r[0]} layout={!reduce} transition={{ type: "spring", stiffness: 380, damping: 34 }} className={`pw-row${best ? " best" : ""}`}>
                      <span className="avatar sm" aria-hidden="true">{initials(r[0])}</span>
                      <span className="pw-name">{r[0]} <span className="pw-rating">{r[1]}</span>{best && <span className="row-best">Best price</span>}</span>
                      <span className="pw-price">{money(r[2])}<small>/mo</small></span>
                      <span className="pw-bar-track"><motion.i initial={{ width: 0 }} animate={{ width: `${(r[2] / max) * 100}%` }} transition={{ duration: reduce ? 0 : 0.8, ease: [0.2, 0.8, 0.2, 1] }} /></span>
                    </motion.li>
                  );
                })}
              </ol>
            </LayoutGroup>
            <p className="pw-foot" aria-live="polite">
              {sorted
                ? <><Check size={14} aria-hidden="true" /> Sorted · {rows[0][0]} saves {money((max - min) * 12)} a year over the highest quote</>
                : <><span className="pulse" /> Comparing {ex.quotes.length} carriers…</>}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
