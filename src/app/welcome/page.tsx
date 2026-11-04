import type { Metadata } from "next";

import { WelcomeScreen } from "@/app/_components/welcome-screen";
import { STEP_ROBOTS } from "@/app/_lib/site-metadata";

export const metadata: Metadata = {
  title: "You're in",
  robots: STEP_ROBOTS,
};

export default function WelcomePage() {
  return <WelcomeScreen />;
}
