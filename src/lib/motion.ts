"use client";

import {
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";

function subscribeQuery(query: string): (onChange: () => void) => () => void {
  return (onChange) => {
    const list = window.matchMedia(query);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  };
}

function readQuery(query: string): boolean {
  return window.matchMedia(query).matches;
}

// Whether a media query matches now, following it as it changes. The server cannot know, so it
// renders as if it does not match and the client settles it on hydration.
function useMediaQuery(query: string): boolean {
  const subscribe = useMemo(() => subscribeQuery(query), [query]);
  return useSyncExternalStore(
    subscribe,
    () => readQuery(query),
    () => false
  );
}

// The moving version is the default; the artist's setting turns it off.
function useReducedMotion(): boolean {
  return useMediaQuery(REDUCE);
}

// True once the element has been at least 30% on screen, and then for good: reveals play once.
function useInView<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (seen) return;
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
  }, [seen]);

  return [ref, seen];
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

export { useCountUp, useInView, useMediaQuery, useReducedMotion };
