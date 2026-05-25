"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      })
  );

  // Global Migration of Legacy localStorage Keys (flightedu, focuszen, voyageiq) to GoFocusGen
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const legacyPrefixes = ["flightedu", "focuszen", "voyageiq"];
      const targetPrefix = "gofocusgen";
      const keySuffixes = ["_onboarding", "_avatar", "_username", "_pilot_id", "_pilot_details"];

      for (const suffix of keySuffixes) {
        const targetKey = `${targetPrefix}${suffix}`;
        if (!localStorage.getItem(targetKey)) {
          for (const legacyPrefix of legacyPrefixes) {
            const legacyKey = `${legacyPrefix}${suffix}`;
            const val = localStorage.getItem(legacyKey);
            if (val) {
              localStorage.setItem(targetKey, val);
              console.log(`[LocalStorage Rebrand Migration] Migrated key "${legacyKey}" to "${targetKey}"`);
              break;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Local storage migration error:", e);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
