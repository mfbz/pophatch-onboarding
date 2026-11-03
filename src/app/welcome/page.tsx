import type { Metadata } from "next";

import { WelcomeScreen } from "@/app/_components/welcome-screen";

export const metadata: Metadata = { title: "You're in" };

export default function WelcomePage() {
  return <WelcomeScreen />;
}
