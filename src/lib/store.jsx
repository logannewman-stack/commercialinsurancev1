import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const KEY = "keel.quote.v2";
const CONTACT_KEY = "keel.contact.v2";

export const DEFAULT_ANSWERS = {
  industry: null, businessType: "", zip: "", space: null, sqft: 2500, revenue: 500000,
  employees: null, years: null, claims: null, lines: [], recFor: null, vehicles: 2,
  name: "", business: "", email: "", phone: "", timing: null, seen: [],
  docs: null, fromDocs: false,
};
export const DEFAULT_OPTIONS = { limit: "1/2", deductible: 1000, pay: "monthly", sort: "value" };

function read(storage, key) {
  try { return JSON.parse(storage.getItem(key) || "null"); } catch { return null; }
}
function write(storage, key, value) {
  try { storage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

const Ctx = createContext(null);

export function QuoteProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = (typeof window !== "undefined" && read(window.localStorage, KEY)) || {};
    const contact = (typeof window !== "undefined" && read(window.sessionStorage, CONTACT_KEY)) || {};
    return {
      a: { ...DEFAULT_ANSWERS, ...(saved.a || {}), ...contact },
      o: { ...DEFAULT_OPTIONS, ...(saved.o || {}) },
      step: saved.step || null,
      submission: saved.submission || null,
    };
  });

  useEffect(() => {
    const { email, phone, ...rest } = state.a;
    write(window.localStorage, KEY, { a: rest, o: state.o, step: state.step, submission: state.submission });
    write(window.sessionStorage, CONTACT_KEY, { email, phone });
  }, [state]);

  const setA = useCallback((patch) => setState((s) => ({ ...s, a: { ...s.a, ...(typeof patch === "function" ? patch(s.a) : patch) } })), []);
  const setO = useCallback((patch) => setState((s) => ({ ...s, o: { ...s.o, ...patch } })), []);
  const setStep = useCallback((step) => setState((s) => (s.step === step ? s : { ...s, step })), []);
  const setSubmission = useCallback((submission) => setState((s) => ({ ...s, submission })), []);
  const reset = useCallback(() => setState((s) => ({ a: { ...DEFAULT_ANSWERS, name: s.a.name, email: s.a.email, phone: s.a.phone }, o: { ...DEFAULT_OPTIONS }, step: null, submission: null })), []);

  const value = useMemo(() => ({ ...state, setA, setO, setStep, setSubmission, reset }), [state, setA, setO, setStep, setSubmission, reset]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useQuote() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useQuote must be used inside QuoteProvider");
  return v;
}

export function isComplete(a) {
  return !!(a.industry && /^\d{5}$/.test(a.zip) && a.space && a.employees && a.years && a.claims && a.lines.length && a.name.trim() && a.business.trim());
}
