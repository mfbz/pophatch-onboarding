import { z } from "zod";

import {
  ArtistSchema,
  type ConnectPlatform,
  type FolderProvider,
  type Source,
} from "@/app/_lib/mock-api";
import type { FlowStage } from "@/components/stepper";

type Connection = z.infer<typeof ConnectionSchema>;

type OnboardingState = z.infer<typeof OnboardingStateSchema>;

type Goal = OnboardingState["goal"];

type OnboardingAction =
  | { type: "linkEntered"; link: string }
  | { type: "found"; artist: z.infer<typeof ArtistSchema> }
  | { type: "confirmed" }
  | { type: "rejected" }
  | { type: "startManual" }
  | { type: "account"; platform: ConnectPlatform; connection: Connection }
  | { type: "folder"; provider: FolderProvider; connection: Connection }
  | { type: "files"; names: string[] }
  | { type: "goal"; goal: Goal }
  | { type: "reset" };

type FlowRoute =
  "/" | "/finding" | "/found" | "/connect" | "/together" | "/welcome";

const ConnectionSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("idle") }),
  z.object({ status: z.literal("connecting") }),
  z.object({ status: z.literal("connected"), handle: z.string().optional() }),
  z.object({
    status: z.literal("failed"),
    message: z.string(),
    attempts: z.number(),
  }),
]);

const ConnectPlatformKey = z.enum([
  "instagram",
  "tiktok",
  "youtube",
  "facebook",
  "soundcloud",
]);

const FolderProviderKey = z.enum(["google-drive", "onedrive"]);

// Saved progress comes back from sessionStorage, outside the code's control, so it is parsed.
const OnboardingStateSchema = z.object({
  path: z.enum(["link", "manual"]),
  link: z.string().nullable(),
  artist: ArtistSchema.nullable(),
  confirmed: z.boolean(),
  accounts: z.partialRecord(ConnectPlatformKey, ConnectionSchema),
  folders: z.partialRecord(FolderProviderKey, ConnectionSchema),
  files: z.array(z.string()),
  goal: z
    .discriminatedUnion("kind", [
      z.object({ kind: z.literal("preset"), value: z.string() }),
      z.object({ kind: z.literal("written"), value: z.string() }),
    ])
    .nullable(),
});

const initialState: OnboardingState = {
  path: "link",
  link: null,
  artist: null,
  confirmed: false,
  accounts: {},
  folders: {},
  files: [],
  goal: null,
};

const ROUTE_STAGES: Record<FlowRoute, FlowStage | null> = {
  "/": "find",
  "/finding": "find",
  "/found": "confirm",
  "/connect": "connect",
  "/together": "enter",
  "/welcome": null,
};

const ORDER: FlowStage[] = ["find", "confirm", "connect", "enter"];

function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction
): OnboardingState {
  switch (action.type) {
    case "linkEntered":
      return { ...state, path: "link", link: action.link, artist: null };
    case "found":
      return { ...state, artist: action.artist };
    case "confirmed":
      return { ...state, confirmed: true };
    case "rejected":
      return { ...state, link: null, artist: null, confirmed: false };
    case "startManual":
      return { ...initialState, path: "manual" };
    case "account":
      return {
        ...state,
        accounts: { ...state.accounts, [action.platform]: action.connection },
      };
    case "folder":
      return {
        ...state,
        folders: { ...state.folders, [action.provider]: action.connection },
      };
    case "files":
      return { ...state, files: action.names };
    case "goal":
      return { ...state, goal: action.goal };
    case "reset":
      return initialState;
  }
}

function connectedSources(state: OnboardingState): Source[] {
  const accounts = Object.entries(state.accounts).flatMap(
    ([platform, connection]) =>
      connection.status === "connected"
        ? [
            {
              kind: "account" as const,
              platform: ConnectPlatformKey.parse(platform),
            },
          ]
        : []
  );
  const folders = Object.entries(state.folders).flatMap(
    ([provider, connection]) =>
      connection.status === "connected"
        ? [
            {
              kind: "folder" as const,
              provider: FolderProviderKey.parse(provider),
            },
          ]
        : []
  );
  const files =
    state.files.length > 0
      ? [{ kind: "files" as const, count: state.files.length }]
      : [];
  return [...accounts, ...folders, ...files];
}

function connectedCount(state: OnboardingState): number {
  return connectedSources(state).length;
}

// The one-by-one path reaches Connect without finding or confirming, and still shows both done:
// the first connected account is how PopHatch finds the artist there.
function stageProgress(
  state: OnboardingState,
  route: FlowRoute
): { current: FlowStage | null; done: FlowStage[] } {
  void state;
  const current = ROUTE_STAGES[route];
  if (current === null) return { current, done: ORDER };
  return { current, done: ORDER.slice(0, ORDER.indexOf(current)) };
}

export {
  connectedCount,
  connectedSources,
  initialState,
  onboardingReducer,
  OnboardingStateSchema,
  stageProgress,
};
export type { Connection, FlowRoute, Goal, OnboardingAction, OnboardingState };
