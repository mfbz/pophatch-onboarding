import type { Metadata } from "next";

import { ConnectScreen } from "@/app/_components/connect-screen";
import { STEP_ROBOTS } from "@/app/_lib/site-metadata";

export const metadata: Metadata = {
  title: "Connect your pages",
  robots: STEP_ROBOTS,
};

export default function ConnectPage() {
  return <ConnectScreen />;
}
