import { useId, useMemo, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { CLASS, searchBusinesses } from "../data/industries.js";

/* Combobox: type a business ("dentist", "food truck") and pick a match. */
export default function BusinessSearch({ onPick, size = "lg", autoFocus = false, buttonLabel = "Get quotes", placeholder = "What kind of business do you run?", label = null }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const id = useId();
  const input = useRef(null);
  const results = useMemo(() => searchBusinesses(q), [q]);
  const fallback = q.trim() && !results.length ? [{ label: q.trim(), cls: "other", custom: true }] : [];
  const items = results.length ? results : fallback;

  const pick = (item) => { setOpen(false); setQ(item.custom ? q : item.label); onPick(item); };
  const submit = () => { if (items[active]) pick(items[active]); else if (!q.trim()) { setOpen(true); input.current?.focus(); } };

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => Math.min(items.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); submit(); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className={`bsearch bsearch-${size}`} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      {label && <label className="bsearch-label" htmlFor={`${id}-input`}>{label}</label>}
      <div className="bsearch-field">
        <Search className="bsearch-icon" size={size === "lg" ? 20 : 18} aria-hidden="true" />
        <input
          ref={input}
          id={`${id}-input`}
          className="bsearch-input"
          role="combobox"
          aria-expanded={open && items.length > 0}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={open && items[active] ? `${id}-${active}` : undefined}
          aria-label={label ? undefined : "Type of business"}
          placeholder={placeholder}
          value={q}
          autoFocus={autoFocus}
          autoComplete="off"
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
        />
        <button type="button" className="btn btn-primary bsearch-go" onClick={submit}>
          <span className="bsearch-go-label">{buttonLabel}</span> <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
      {open && items.length > 0 && (
        <ul className="bsearch-list" role="listbox" id={`${id}-list`}>
          {!q.trim() && <li className="bsearch-head" role="presentation">Popular</li>}
          {items.map((b, i) => (
            <li
              key={b.label + i}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === active}
              className={`bsearch-opt${i === active ? " active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(b)}
            >
              <span>{b.custom ? <>Something else: “{b.label}”</> : b.label}</span>
              <span className="bsearch-cls">{CLASS[b.cls].short}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
