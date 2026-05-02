import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 to `end` once the element scrolls into view.
 * Returns [ref, displayValue].
 */
export function useCountUp(end: number, durationMs = 1500) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLElement | null>(null);
  const started = useRef(false);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const startTime = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - startTime) / durationMs);
              const eased = 1 - Math.pow(1 - t, 3);
              setValue(Math.round(eased * end));
              if (t < 1) frame.current = requestAnimationFrame(tick);
            };
            frame.current = requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [end, durationMs]);

  return [ref, value] as const;
}