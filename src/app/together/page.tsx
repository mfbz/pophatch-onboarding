import type { Metadata } from "next";

import { TogetherScreen } from "@/app/_components/together-screen";

export const metadata: Metadata = { title: "Putting it together" };

export default function TogetherPage() {
  return <TogetherScreen />;
}
