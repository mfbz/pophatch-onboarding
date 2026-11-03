import type { Metadata, Viewport } from "next";
import { DM_Sans, Familjen_Grotesk } from "next/font/google";

import { OnboardingProvider } from "@/app/_lib/onboarding-provider";

import "./globals.css";

// The Stage System's two faces, self-hosted by next/font so the page makes no font request at
// runtime and never shifts when they load.
const body = DM_Sans({ variable: "--font-body", subsets: ["latin"] });
const display = Familjen_Grotesk({
  variable: "--font-display-face",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PopHatch",
  description: "Your manager, from one link.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0A2EB0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <OnboardingProvider>{children}</OnboardingProvider>
      </body>
    </html>
  );
}
