import type { Metadata } from "next";

import { ConnectScreen } from "@/app/_components/connect-screen";

export const metadata: Metadata = { title: "Connect your pages" };

export default function ConnectPage() {
  return <ConnectScreen />;
}
