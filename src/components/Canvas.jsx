import { useLayoutEffect, useRef, useState } from "react";

/*
  Renders a fixed-size app screen (designed at `width` × `height`) scaled to fit
  its container, so desktop screens can be shown at any size without breaking
  their layout. The contents are decorative: inert and hidden from screen readers.
*/
export function Canvas({ width = 1200, height = 740, children }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const fit = () => setScale(el.clientWidth / width);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={ref} className="canvas" style={{ height: height * scale }}>
      <div className="canvas-inner" style={{ width, height, transform: `scale(${scale})` }} aria-hidden="true" inert="">
        {children}
      </div>
    </div>
  );
}

/* A browser-style window around an app screen. */
export function Window({ title, label, children, className = "" }) {
  return (
    <figure className={`win ${className}`} role="img" aria-label={label}>
      <div className="win-bar" aria-hidden="true">
        <span className="win-dots"><i /><i /><i /></span>
        <span className="win-url">{title}</span>
        <span className="win-dots ghost"><i /><i /><i /></span>
      </div>
      {children}
    </figure>
  );
}
