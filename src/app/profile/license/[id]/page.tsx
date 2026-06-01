import { Suspense } from "react";
import LicenseClient from "./LicenseClient";

interface LicensePageProps {
  params: Promise<{ id: string }>;
}

export default async function LicensePage({ params }: LicensePageProps) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 text-white">
        <span className="size-10 rounded-full border-2 border-electric-400 border-t-transparent animate-spin" />
        <p className="mt-4 text-white/50 text-sm font-mono tracking-wider">RETRIEVING PILOT CREDENTIALS...</p>
      </div>
    }>
      <LicenseClient id={resolvedParams?.id || ""} />
    </Suspense>
  );
}

