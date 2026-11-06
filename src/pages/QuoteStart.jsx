import { Link } from "react-router-dom";
import { ArrowRight, FileUp, ListChecks } from "lucide-react";
import FlowTop from "../components/FlowTop.jsx";
import { Reveal } from "../components/fx.jsx";
import { useQuote } from "../lib/store.jsx";
import { useTitle } from "../lib/useTitle.js";

/* First screen of a quote: upload existing paperwork, or answer the questions. */
export default function QuoteStart() {
  useTitle("Get a quote");
  const { a, step } = useQuote();
  const inProgress = a.industry && step && step !== "industry";
  return (
    <div className="quote-page">
      <FlowTop label="Get a quote" />
      <main className="wrap start-wrap">
        <p className="eyebrow">Get a quote</p>
        <h1 className="q-title">How would you like to start?</h1>
        <p className="q-sub">Already insured? Your current paperwork has almost everything we need, so you can skip most of the questions.</p>
        <div className="start-opts">
          <Reveal y={16} blur={4}>
            <Link to="/quote/upload" className="start-opt primary">
              <span className="so-top"><span className="so-icon"><FileUp size={22} aria-hidden="true" /></span><span className="so-badge">Fastest</span></span>
              <span className="so-title">Upload your current insurance</span>
              <span className="so-desc">A certificate of insurance, ACORD application or declarations page. We read it and fill in the form for you.</span>
              <span className="so-meta">About 1 minute · PDF or photo <ArrowRight size={15} aria-hidden="true" /></span>
            </Link>
          </Reveal>
          <Reveal y={16} blur={4} delay={0.08}>
            <Link to="/quote/industry" className="start-opt">
              <span className="so-top"><span className="so-icon"><ListChecks size={22} aria-hidden="true" /></span></span>
              <span className="so-title">Answer 8 quick questions</span>
              <span className="so-desc">Best if you’re new to business insurance or don’t have your documents handy.</span>
              <span className="so-meta">About 3 minutes <ArrowRight size={15} aria-hidden="true" /></span>
            </Link>
          </Reveal>
        </div>
        {inProgress && <p className="start-resume">You have a quote in progress. <Link to={`/quote/${step}`}>Pick up where you left off</Link></p>}
      </main>
    </div>
  );
}
