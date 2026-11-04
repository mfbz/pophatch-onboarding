import type { Metadata } from "next";

import { FoundScreen } from "@/app/_components/found-screen";
import { STEP_ROBOTS } from "@/app/_lib/site-metadata";

export const metadata: Metadata = {
  title: "Found you",
  robots: STEP_ROBOTS,
};

export default function FoundPage() {
  return <FoundScreen />;
}
