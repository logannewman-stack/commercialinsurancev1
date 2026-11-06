import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Camera, Check, FileText, FileUp, Loader2, UploadCloud, X } from "lucide-react";
import FlowTop from "../components/FlowTop.jsx";
import { KINDS, MAX_FILES, SAMPLE_EXTRACTION, answersFrom, prepare, readDocuments, tooBig, totalBytes } from "../lib/documents.js";
import { useQuote } from "../lib/store.jsx";
import { useTitle } from "../lib/useTitle.js";
import { IS_PREVIEW } from "../config.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const kb = (n) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);
const STAGES = ["Uploading securely", "Finding your business details", "Reading your current coverage", "Looking for your renewal date"];

function Reading() {
  const [n, setN] = useState(0);
  useEffect(() => { const t = setInterval(() => setN((v) => Math.min(STAGES.length - 1, v + 1)), 2600); return () => clearInterval(t); }, []);
  return (
    <div className="reading" role="status" aria-live="polite">
      <p className="reading-title">Reading your documents. This usually takes under a minute.</p>
      <ul>{STAGES.map((s, i) => <li key={s} className={i < n ? "done" : i === n ? "now" : ""}>{i < n ? <Check size={15} aria-hidden="true" /> : i === n ? <Loader2 size={15} className="spin" aria-hidden="true" /> : <span className="dot" />}{s}</li>)}</ul>
    </div>
  );
}

export default function QuoteUpload() {
  useTitle("Upload your insurance");
  const navigate = useNavigate();
  const { a, setA } = useQuote();
  const [items, setItems] = useState([]);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(null);
  const [email, setEmail] = useState(a.email || "");
  const [phone, setPhone] = useState(a.phone || "");
  const fileRef = useRef(null);
  const camRef = useRef(null);
  const itemsRef = useRef(items); itemsRef.current = items;

  const add = async (list) => {
    const files = [...(list || [])];
    if (!files.length) return;
    setErr(null);
    if (itemsRef.current.length + files.length > MAX_FILES) { setErr(`Upload up to ${MAX_FILES} files at a time.`); return; }
    setAdding(true);
    const out = [];
    for (const f of files) {
      try { out.push(await prepare(f)); } catch (e) { setErr(e.message); }
    }
    setAdding(false);
    setItems((v) => [...v, ...out]);
  };

  useEffect(() => {
    const onPaste = (e) => { const files = e.clipboardData?.files; if (files?.length) { e.preventDefault(); add(files); } };
    window.addEventListener("paste", onPaste);
    return () => { window.removeEventListener("paste", onPaste); itemsRef.current.forEach((f) => f.preview && URL.revokeObjectURL(f.preview)); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = (id) => setItems((v) => { const f = v.find((x) => x.id === id); if (f?.preview) URL.revokeObjectURL(f.preview); return v.filter((x) => x.id !== id); });
  const setKind = (id, kind) => setItems((v) => v.map((x) => (x.id === id ? { ...x, kind } : x)));

  const useSample = () => {
    setA((prev) => { const p = answersFrom(SAMPLE_EXTRACTION, prev); return { ...p, docs: { ...p.docs, sample: true } }; });
    navigate("/quote/review");
  };

  const submit = async () => {
    if (!items.length) { setErr("Add at least one document, or answer the questions instead."); return; }
    if (!EMAIL_RE.test(email.trim())) { setErr("Enter your email so we can send your quotes."); document.getElementById("up-email")?.focus(); return; }
    if (tooBig(items)) { setErr("Those files are too large together. Remove a few pages or photos and try again."); return; }
    setErr(null); setBusy(true);
    setA({ email: email.trim(), phone: phone.trim() });
    const r = await readDocuments(items, { email: email.trim(), phone: phone.trim() });
    setBusy(false);
    if (r.preview) { setDone({ mode: "preview" }); return; }
    if (!r.ok) { setErr(r.error); return; }
    if (r.mode === "extracted" && r.extracted) {
      setA((prev) => answersFrom(r.extracted, prev));
      navigate("/quote/review");
    } else {
      setDone({ mode: "received", id: r.id });
    }
  };

  const onDrop = (e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); };

  return (
    <div className="quote-page">
      <FlowTop label="Upload documents" />
      <main className="wrap up-wrap">
        <Link to="/quote/start" className="link-btn"><ArrowLeft size={16} aria-hidden="true" /> Back</Link>
        <p className="eyebrow marked">Fast start</p>
        <h1 className="q-title">Upload your current insurance.</h1>
        <p className="q-sub">A certificate of insurance, ACORD application or declarations page works best. We’ll read it, fill in your quote, and let you check everything before you see prices.</p>

        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div key="done" className="up-done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <span className="confirm-check small"><Check size={22} strokeWidth={2.5} aria-hidden="true" /></span>
              {done.mode === "received" ? (
                <>
                  <h2 className="up-done-title">Got them.</h2>
                  <p className="q-sub">A licensed advisor will review your documents and email your quotes to <b>{email}</b>. Reference {done.id}.</p>
                  <div className="up-actions"><Link to="/quote/industry" className="btn btn-primary">See an estimate now <ArrowRight size={16} aria-hidden="true" /></Link><Link to="/" className="link-btn">Back to home</Link></div>
                </>
              ) : (
                <>
                  <h2 className="up-done-title">This preview can’t read documents.</h2>
                  <p className="q-sub">Nothing was uploaded. On the live site, Keel reads your documents automatically and fills in your quote. Here’s what that looks like with a sample certificate.</p>
                  <div className="up-actions"><button type="button" className="btn btn-primary" onClick={useSample}>See a sample result</button><Link to="/quote/industry" className="link-btn">Answer the questions instead</Link></div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div key="form" initial={false} exit={{ opacity: 0 }}>
              <div className={`drop${drag ? " over" : ""}`} onDragEnter={(e) => { e.preventDefault(); setDrag(true); }} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false); }} onDrop={onDrop}>
                <span className="drop-icon"><UploadCloud size={26} aria-hidden="true" /></span>
                <p className="drop-title">{drag ? "Drop to add" : "Drag your documents here"}</p>
                <p className="drop-sub">PDF, JPG or PNG · up to {MAX_FILES} files · you can also paste a screenshot</p>
                <div className="drop-btns">
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => fileRef.current?.click()}><FileUp size={16} aria-hidden="true" /> Choose files</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => camRef.current?.click()}><Camera size={16} aria-hidden="true" /> Take a photo</button>
                </div>
                <input ref={fileRef} id="up-files" type="file" accept="application/pdf,image/*,.heic,.heif" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
                <input ref={camRef} id="up-camera" type="file" accept="image/*" capture="environment" hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
                {adding && <p className="drop-adding"><Loader2 size={14} className="spin" aria-hidden="true" /> Preparing files…</p>}
              </div>

              {items.length > 0 && (
                <ul className="up-list" aria-label="Documents to upload">
                  {items.map((f) => (
                    <motion.li key={f.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <span className="up-thumb">{f.preview ? <img src={f.preview} alt="" /> : <FileText size={20} aria-hidden="true" />}</span>
                      <span className="up-meta"><b>{f.name}</b><small>{kb(f.size)}</small></span>
                      <label className="sr-only" htmlFor={`kind-${f.id}`}>Document type for {f.name}</label>
                      <select id={`kind-${f.id}`} className="input up-kind" value={f.kind} onChange={(e) => setKind(f.id, e.target.value)}>
                        {KINDS.map((k) => <option key={k.v} value={k.v}>{k.label}</option>)}
                      </select>
                      <button type="button" className="icon-btn icon-sm" aria-label={`Remove ${f.name}`} onClick={() => remove(f.id)}><X size={15} /></button>
                    </motion.li>
                  ))}
                  <li className="up-total"><span>{items.length} file{items.length === 1 ? "" : "s"} · {kb(totalBytes(items))}</span>{tooBig(items) && <span className="up-warn">Too large to send together</span>}</li>
                </ul>
              )}

              <div className="form-grid up-contact">
                <div className="field"><label htmlFor="up-email">Email for your quotes</label><input id="up-email" className="input" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(null); }} /></div>
                <div className="field"><label htmlFor="up-phone">Phone <span className="opt">optional</span></label><input id="up-phone" className="input" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setErr(null); }} /></div>
              </div>

              <p className="flow-err" role="alert">{err || ""}</p>
              {busy ? <Reading /> : (
                <div className="up-actions">
                  <button type="button" className="btn btn-primary btn-lg" onClick={submit} disabled={adding}>Read my documents</button>
                  <Link to="/quote/industry" className="link-btn">Don’t have these? Answer the questions instead</Link>
                </div>
              )}

              <div className="up-help">
                <p className="col-title">What helps most</p>
                <ul>
                  <li><b>Certificate of insurance (ACORD 25)</b><span>Who you are and the coverage you have now.</span></li>
                  <li><b>ACORD 125, 126 or 130 application</b><span>Revenue, employees, payroll and your building.</span></li>
                  <li><b>Declarations pages</b><span>Your limits, premium and renewal date.</span></li>
                  <li><b>Loss runs</b><span>Your claims history, which carriers price on.</span></li>
                </ul>
              </div>
              <p className="fine up-fine">
                We use an AI service to read your documents and fill in your quote. Your documents are shared only with your Keel advisor and the carriers that quote you.
                {IS_PREVIEW && " In this preview, nothing is uploaded."}
              </p>
              {IS_PREVIEW && <button type="button" className="link-btn" onClick={useSample}>See how it works with a sample certificate →</button>}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
