import { Link } from "react-router-dom";
import { useTitle } from "../lib/useTitle.js";
export default function NotFound() {
  useTitle("Page not found");
  return (
    <main className="confirm">
      <div className="wrap confirm-wrap">
        <p className="eyebrow">404</p>
        <h1 className="res-title">We couldn’t find that page.</h1>
        <p className="res-meta">The link may be old, or the page may have moved.</p>
        <div className="confirm-actions"><Link to="/" className="btn btn-primary">Go home</Link><Link to="/quote" className="btn btn-ghost">Get a quote</Link></div>
      </div>
    </main>
  );
}
