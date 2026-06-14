import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "GoFocusGen — Study Like You're Travelling the World",
    template: "%s | GoFocusGen",
  },
  description:
    "Turn your study sessions into immersive journeys. Pick a destination, calculate your travel time, and study for the duration of your simulated flight.",
  keywords: ["study", "productivity", "gamification", "focus", "travel"],
  openGraph: {
    title: "GoFocusGen",
    description: "Study Like You're Travelling the World",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || "";

  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
