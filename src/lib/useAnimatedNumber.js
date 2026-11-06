import { useEffect, useRef, useState } from "react";

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function useAnimatedNumber(value, duration = 550) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);
  const raf = useRef(0);
  useEffect(() => {
    if (value == null || reduced()) { setDisplay(value); from.current = value; return undefined; }
    const start = performance.now(), a = from.current ?? value;
    cancelAnimationFrame(raf.current);
    const tick = (t) => {
      const k = Math.min(1, (t - start) / duration), e = 1 - Math.pow(1 - k, 3), v = a + (value - a) * e;
      from.current = v; setDisplay(v);
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);
  return display;
}
