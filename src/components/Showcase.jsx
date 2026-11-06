import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { Check } from "lucide-react";
import { Phone, SearchScreen, QuestionScreen, ShoppingScreen, QuotesScreen, DoneScreen } from "./Phone.jsx";
import { Reveal, Words, useMedia } from "./fx.jsx";

const STEPS = [
  { kicker: "Your business", title: "Start by saying what you do.", screen: SearchScreen,
    body: "Type “café”, “plumber” or “dentist”. Keel knows about a hundred kinds of business and pre-selects the coverage each one usually needs.",
    points: ["About 100 business types", "Coverage picked for your industry", "Change anything, anytime"] },
  { kicker: "Eight questions", title: "Watch the price take shape.", screen: QuestionScreen,
    body: "Location, building, revenue, team and history. Your price range updates with every answer, so there are no surprises at the end.",
    points: ["One question per screen", "Live price estimate", "Saves your progress"] },
  { kicker: "We shop", title: "Every carrier, at the same time.", screen: ShoppingScreen,
    body: "Keel sends one application to every carrier that insures businesses like yours, then collects their quotes in seconds instead of days.",
    points: ["One application, many carriers", "Carriers that decline tell you why", "No phone tag"] },
  { kicker: "Compare", title: "Ranked by value, side by side.", screen: QuotesScreen,
    body: "See price, coverage and each carrier’s financial strength together. Adjust limits and deductibles and watch every quote update.",
    points: ["Best value, lowest price, top rated", "Compare up to three at once", "Monthly or paid in full"] },
  { kicker: "Get covered", title: "Pick one. You’re nearly done.", screen: DoneScreen,
    body: "Choose a start date and payment plan. A licensed advisor confirms the details, and your certificate of insurance arrives by email.",
    points: ["Nothing charged until it’s final", "Often covered the same day", "An advisor when you want one"] },
];

export default function Showcase() {
  const list = useRef(null);
  const desktop = useMedia("(min-width: 1000px)");
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 0.55", "end 0.55"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length)));
    setActive((p) => (p === i ? p : i));
  });
  const Screen = STEPS[active].screen;

  return (
    <section className="show" id="how" aria-labelledby="how-title">
      <div className="wrap">
        <div className="show-head">
          <Reveal><p className="eyebrow marked">How it works</p></Reveal>
          <Words as="h2" id="how-title" className="mega-2" text="From first question to covered." />
          <Reveal delay={0.2}><p className="lede">Five steps, about three minutes, and no phone calls unless you want one.</p></Reveal>
        </div>

        <div className="show-grid">
          {desktop && (
            <div className="show-pin">
              <div className="show-sticky">
                <div className="show-rail" aria-hidden="true">
                  {STEPS.map((s, i) => <span key={s.title}><motion.i initial={false} animate={{ height: i <= active ? "100%" : "0%" }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} /></span>)}
                  <small>{String(active + 1).padStart(2, "0")}<em> / {String(STEPS.length).padStart(2, "0")}</em></small>
                </div>
                <div className="show-device">
                  <Phone>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div key={active} className="ps-layer"
                        initial={reduce ? false : { opacity: 0, scale: 0.98, filter: "blur(8px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={reduce ? undefined : { opacity: 0, scale: 1.01, filter: "blur(8px)" }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                        <Screen active />
                      </motion.div>
                    </AnimatePresence>
                  </Phone>
                  <div className="device-shadow" aria-hidden="true" />
                </div>
              </div>
            </div>
          )}

          <ol className="show-steps" ref={list}>
            {STEPS.map((s, i) => {
              const S = s.screen;
              return (
                <li key={s.title} className={`show-step${desktop && i !== active ? " dim" : ""}`}>
                  {!desktop && <Reveal className="show-phone-m"><Phone><S active /></Phone></Reveal>}
                  <p className="show-kicker"><span>{String(i + 1).padStart(2, "0")}</span>{s.kicker}</p>
                  <h3 className="show-title">{s.title}</h3>
                  <p className="show-body">{s.body}</p>
                  <ul className="show-points">{s.points.map((p) => <li key={p}><Check size={15} aria-hidden="true" />{p}</li>)}</ul>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
