"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Live `matchMedia` result. The server render and hydration always see
 * `false`, so markup never mismatches; the real value arrives right after.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
