import type { Metadata } from "next";

import { LinkScreen } from "@/app/_components/link-screen";

export const metadata: Metadata = { title: "Your link" };

export default function Home() {
  return <LinkScreen />;
}
