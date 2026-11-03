import type { Metadata } from "next";

import { FoundScreen } from "@/app/_components/found-screen";

export const metadata: Metadata = { title: "Found you" };

export default function FoundPage() {
  return <FoundScreen />;
}
