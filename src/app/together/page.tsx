import type { Metadata } from "next";

import { TogetherScreen } from "@/app/_components/together-screen";
import { STEP_ROBOTS } from "@/app/_lib/site-metadata";

export const metadata: Metadata = {
  title: "Putting it together",
  robots: STEP_ROBOTS,
};

export default function TogetherPage() {
  return <TogetherScreen />;
}
