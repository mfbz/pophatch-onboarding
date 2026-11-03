import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { initialState } from "./onboarding-state";
import { useStepGuard } from "./use-step-guard";

const replace = vi.fn();
const onboarding = { state: initialState, dispatch: vi.fn(), ready: true };

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("./onboarding-provider", () => ({ useOnboarding: () => onboarding }));

describe("useStepGuard", () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it("sends the artist back to the start when the step is not reachable", () => {
    onboarding.ready = true;
    const { result } = renderHook(() =>
      useStepGuard((state) => state.artist !== null)
    );
    expect(replace).toHaveBeenCalledWith("/");
    expect(result.current).toBe(false);
  });

  it("waits for the saved progress before deciding", () => {
    onboarding.ready = false;
    const { result } = renderHook(() =>
      useStepGuard((state) => state.artist !== null)
    );
    expect(replace).not.toHaveBeenCalled();
    expect(result.current).toBe(false);
  });

  it("lets a reachable step render", () => {
    onboarding.ready = true;
    const { result } = renderHook(() => useStepGuard(() => true));
    expect(replace).not.toHaveBeenCalled();
    expect(result.current).toBe(true);
  });
});
