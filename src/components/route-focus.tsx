"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function visible(element: Element): boolean {
  if (typeof element.checkVisibility === "function") {
    return element.checkVisibility();
  }
  return element.closest('[style*="display: none"]') === null;
}

const INTERACTIONS = ["pointerdown", "keydown", "focusin"] as const;

// After a move to another step, focus left behind on the page Next just hid (Activity), or on
// nothing, goes to the new page's heading, so the next Tab starts inside the new step. Safari
// otherwise keeps looking for the next stop inside the hidden page and Tab goes nowhere. Focus a
// page has placed itself (step 1's field after a failed search) is left where it is. Until the
// artist has touched the page there is no place to lose, so a step that sends a fresh load back
// to the start leaves focus at the top of the document. The last path, not a first-run flag,
// tells a move from React running the effect twice.
function RouteFocus() {
  const pathname = usePathname();
  const last = useRef(pathname);
  const touched = useRef(false);

  useEffect(() => {
    const touch = () => {
      touched.current = true;
    };
    for (const type of INTERACTIONS)
      document.addEventListener(type, touch, true);
    return () => {
      for (const type of INTERACTIONS)
        document.removeEventListener(type, touch, true);
    };
  }, []);

  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    if (!touched.current) return;
    // After the new page's own effects, which may have placed focus already.
    const timer = setTimeout(() => {
      const active = document.activeElement;
      if (active && active !== document.body && visible(active)) return;
      const heading = [...document.querySelectorAll("h1")].find(visible);
      if (!heading) return;
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

export { RouteFocus };
