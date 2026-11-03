import type { Metadata } from "next";

import { FindingScreen } from "@/app/_components/finding-screen";

export const metadata: Metadata = { title: "Getting to know you" };

export default function FindingPage() {
  return <FindingScreen />;
}
