import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "FlightEdu — Study Like You're Travelling the World",
    template: "%s | FlightEdu",
  },
  description:
    "Turn your study sessions into immersive journeys. Pick a destination, calculate your travel time, and study for the duration of your simulated flight.",
  keywords: ["study", "productivity", "gamification", "focus", "travel"],
  openGraph: {
    title: "FlightEdu",
    description: "Study Like You're Travelling the World",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
