import type { Metadata } from "next";

import { FindingScreen } from "@/app/_components/finding-screen";
import { STEP_ROBOTS } from "@/app/_lib/site-metadata";

export const metadata: Metadata = {
  title: "Getting to know you",
  robots: STEP_ROBOTS,
};

export default function FindingPage() {
  return <FindingScreen />;
}
