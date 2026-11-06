import { Link } from "react-router-dom";
import { X } from "lucide-react";
import Logo from "./Logo.jsx";

/* The slim top bar used on the quote start, upload and review screens. */
export default function FlowTop({ label }) {
  return (
    <div className="qtop">
      <div className="wrap qtop-row">
        <Link to="/" className="logo-link" aria-label="Keel home"><Logo /></Link>
        <span className="flow-label">{label}</span>
        <Link to="/" className="icon-btn" aria-label="Save and exit"><X size={18} /></Link>
      </div>
    </div>
  );
}
