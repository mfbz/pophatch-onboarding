"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function visible(element: Element): boolean {
  if (typeof element.checkVisibility === "function") {
    return element.checkVisibility();
  }
  return element.closest('[style*="display: none"]') === null;
}

// After a move to another step, focus left behind on the page Next just hid (Activity), or on
// nothing, goes to the new page's heading, so the next Tab starts inside the new step. Safari
// otherwise keeps looking for the next stop inside the hidden page and Tab goes nowhere. Focus a
// page has placed itself (step 1's field after a failed search) is left where it is.
function RouteFocus() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
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
