"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useOnboarding } from "@/app/_lib/onboarding-provider";
import type { OnboardingState } from "@/app/_lib/onboarding-state";

// A step opened out of order, from a bookmark or a fresh tab, sends the artist back to the start
// instead of showing a screen with nothing in it.
function useStepGuard(
  requirement: (state: OnboardingState) => boolean
): boolean {
  const { state, ready } = useOnboarding();
  const router = useRouter();
  const allowed = ready && requirement(state);

  useEffect(() => {
    if (ready && !allowed) router.replace("/");
  }, [ready, allowed, router]);

  return allowed;
}

export { useStepGuard };
