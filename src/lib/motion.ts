"use client";

import {
  type RefObject,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";

function noSubscription(): () => void {
  return () => {};
}

function subscribeReduced(onChange: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia(REDUCE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function readReduced(): boolean {
  return (
    typeof window.matchMedia === "function" && window.matchMedia(REDUCE).matches
  );
}

// The server cannot know, so it renders the moving version and the client settles it on hydration.
function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, readReduced, () => false);
}

// True once the element has been at least 30% on screen, and then for good: reveals play once.
function useInView<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  const unsupported = useSyncExternalStore(
    noSubscription,
    () => typeof IntersectionObserver !== "function",
    () => false
  );

  useEffect(() => {
    if (seen || unsupported) return;
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [seen, unsupported]);

  return [ref, seen || unsupported];
}

// A number that runs to its target with an ease-out, from wherever it stands; under reduced motion
// it is simply the target.
function useCountUp(target: number, run: boolean, ms = 900): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(() => (reduced ? target : 0));
  const current = useRef(value);

  useEffect(() => {
    if (!run) return;
    if (reduced) {
      current.current = target;
      return;
    }
    const from = current.current;
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const progress = Math.min(1, (now - start) / ms);
      const next = Math.round(
        from + (target - from) * (1 - Math.pow(1 - progress, 3))
      );
      current.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, run, reduced, ms]);

  return reduced ? target : value;
}

// The mockup's generator (Park–Miller), so generated art matches it bar for bar.
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

// A row of bar heights between 0.06 and 1 that looks like a song: two slow waves plus noise.
function levels(
  count: number,
  seed: number,
  shape?: (x: number, value: number) => number
): number[] {
  const random = seeded(seed);
  return Array.from({ length: count }, (_, index) => {
    const x = index / count;
    let value =
      0.35 +
      0.25 * Math.sin(x * 9 + seed) +
      0.15 * Math.sin(x * 23 + seed * 2) +
      0.25 * random();
    if (shape) value = shape(x, value);
    return Math.max(0.06, Math.min(1, value));
  });
}

export { levels, seeded, useCountUp, useInView, useReducedMotion };
