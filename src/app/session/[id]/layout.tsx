import { ReactNode, Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SessionLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-navy-950 text-white">
        <div className="text-center">
          <div className="size-12 rounded-full border-2 border-electric-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="font-display text-lg tracking-wider text-white/60">Preparing Telemetry Cabin...</p>
        </div>
      </main>
    }>
      {children}
    </Suspense>
  );
}
