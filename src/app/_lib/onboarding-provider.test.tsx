import { renderHook, waitFor } from "@testing-library/react";
import { act, type ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { OnboardingProvider, useOnboarding } from "./onboarding-provider";
import { initialState } from "./onboarding-state";

const KEY = "pophatch-onboarding";

function wrapper({ children }: { children: ReactNode }) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}

describe("OnboardingProvider", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it("picks up where the artist left off after a reload", async () => {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ ...initialState, path: "manual" })
    );
    const { result } = renderHook(useOnboarding, { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.state.path).toBe("manual");
  });

  it("starts fresh when the saved progress is not readable", async () => {
    sessionStorage.setItem(KEY, '{"path":"somewhere"}');
    const { result } = renderHook(useOnboarding, { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.state).toEqual(initialState);
  });

  it("saves every change", async () => {
    const { result } = renderHook(useOnboarding, { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    act(() => {
      result.current.dispatch({ type: "startManual" });
    });
    expect(JSON.parse(sessionStorage.getItem(KEY) ?? "{}")).toMatchObject({
      path: "manual",
    });
  });
});
