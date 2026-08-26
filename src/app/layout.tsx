import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://gofocusgen.vercel.app"),
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
    url: "https://gofocusgen.vercel.app",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "GoFocusGen Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GoFocusGen",
    description: "Study Like You're Travelling the World",
    images: ["/logo.png"],
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
    <html lang="en" className="min-h-screen">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
