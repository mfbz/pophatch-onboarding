"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  use,
  useEffect,
  useReducer,
} from "react";

import {
  initialState,
  type OnboardingAction,
  onboardingReducer,
  type OnboardingState,
  OnboardingStateSchema,
} from "@/app/_lib/onboarding-state";

type OnboardingContextValue = {
  state: OnboardingState;
  dispatch: Dispatch<OnboardingAction>;
  ready: boolean;
};

type ProviderState = { state: OnboardingState; ready: boolean };

type ProviderAction =
  OnboardingAction | { type: "restore"; saved: OnboardingState | null };

const STORAGE_KEY = "pophatch-onboarding";

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

function readSaved(): OnboardingState | null {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved === null) return null;
    const parsed = OnboardingStateSchema.safeParse(JSON.parse(saved));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function providerReducer(
  current: ProviderState,
  action: ProviderAction
): ProviderState {
  if (action.type === "restore") {
    return { state: action.saved ?? current.state, ready: true };
  }
  return { ...current, state: onboardingReducer(current.state, action) };
}

// Progress lives in sessionStorage so a reload or the back button keeps the artist where they
// were, and a new tab starts fresh. Screens wait for `ready` before deciding where to send them.
function OnboardingProvider({ children }: { children: ReactNode }) {
  const [{ state, ready }, dispatch] = useReducer(providerReducer, {
    state: initialState,
    ready: false,
  });

  useEffect(() => {
    dispatch({ type: "restore", saved: readSaved() });
  }, []);

  useEffect(() => {
    if (ready) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  return (
    <OnboardingContext value={{ state, dispatch, ready }}>
      {children}
    </OnboardingContext>
  );
}

function useOnboarding(): OnboardingContextValue {
  const value = use(OnboardingContext);
  if (!value) throw new Error("useOnboarding needs an OnboardingProvider");
  return value;
}

export { OnboardingProvider, useOnboarding };
