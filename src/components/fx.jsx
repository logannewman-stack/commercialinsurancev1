/*
  Motion primitives shared across the site.
  Every effect checks prefers-reduced-motion and renders a still, complete version when it's on.
*/
import { Fragment, useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1];

/* Rises and un-blurs as it enters the viewport. */
export function Reveal({ children, delay = 0, y = 26, blur = 8, className = "", as = "div", ...rest }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const reduce = useReducedMotion();
  const Tag = as;
  if (reduce) return <Tag className={className} {...rest}>{children}</Tag>;
  const M = motion[as] || motion.div;
  return (
    <M ref={ref} className={className} {...rest}
      initial={{ opacity: 0, y, filter: `blur(${blur}px)` }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 1, delay, ease: EASE }}>
      {children}
    </M>
  );
}

/*
  A headline that assembles word by word. `mark` underlines one word in the accent color.
  `tail` adds a second, quieter sentence in the muted tone (a two-tone headline).
*/
export function Words({ text, tail = "", as: Tag = "h1", className = "", delay = 0, stagger = 0.075, mark = -1, id }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -6% 0px" });
  const reduce = useReducedMotion();
  const lead = text.split(" ");
  const words = tail ? [...lead, ...tail.split(" ")] : lead;
  const on = reduce || inView;
  return (
    <Tag ref={ref} className={className} id={id}>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <motion.span
            className={`word${i === mark ? " word-mark" : ""}${i >= lead.length ? " tone" : ""}`}
            initial={reduce ? false : { opacity: 0, y: "0.42em", filter: "blur(12px)" }}
            animate={on ? { opacity: 1, y: "0em", filter: "blur(0px)" } : undefined}
            transition={{ duration: 1.1, delay: delay + i * stagger, ease: [0.19, 1, 0.22, 1] }}
          >
            {w}
            {i === mark && (
              <motion.span className="mark-bar" aria-hidden="true"
                initial={reduce ? false : { scaleX: 0 }}
                animate={on ? { scaleX: 1 } : undefined}
                transition={{ duration: 0.9, delay: delay + words.length * stagger + 0.15, ease: EASE }} />
            )}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}

/* A long statement where each word lights up as the reader scrolls through it. */
export function ScrollLit({ text, className = "", dim = 0.18 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = text.split(" ");
  const span = words.length + 1.6;
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          {reduce ? <span>{w}</span> : <LitWord p={scrollYProgress} start={i / span} end={(i + 1.6) / span} dim={dim}>{w}</LitWord>}
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}
function LitWord({ p, start, end, dim, children }) {
  const opacity = useTransform(p, [start, end], [dim, 1], { clamp: true });
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

/* Counts up to a value when it scrolls into view. */
export function Counter({ to, prefix = "", suffix = "", duration = 1.6, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView) return undefined;
    if (reduce) { setV(to); return undefined; }
    const c = animate(0, to, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: setV });
    return () => c.stop();
  }, [inView, to, reduce, duration]);
  return <span ref={ref} className={className}>{prefix}{Math.round(v).toLocaleString("en-US")}{suffix}</span>;
}

/* A thin accent line across the top of the page that fills as you read. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 });
  return <motion.div className="scroll-progress" style={{ scaleX: x }} aria-hidden="true" />;
}

/* A card that glows where the cursor is. */
export function Spotlight({ as: Tag = "div", className = "", children, ...rest }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return <Tag className={`spot ${className}`} onMouseMove={onMove} {...rest}>{children}</Tag>;
}

/* True when the viewport matches a media query. */
export function useMedia(query) {
  const get = () => typeof window !== "undefined" && window.matchMedia?.(query).matches;
  const [m, setM] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    on(); mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return m;
}
