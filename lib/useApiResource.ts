import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";

/** Small fetch-on-mount hook shared by backend-wired pages — deliberately
 * plain (no cache, no dedupe) rather than pulling in a query library. */
export function useApiResource<T>(
  fetcher: (() => Promise<T>) | null,
  deps: unknown[],
  options?: { pollWhile: (data: T) => boolean; pollIntervalMs?: number; maxPolls?: number }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    if (!fetcher) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let polls = 0;
    setLoading(true);
    setError(null);
    const load = async (quiet = false) => {
      let again = false;
      try {
        const result = await fetcher();
        if (!cancelled) setData(result);
        again = options?.pollWhile(result) ?? false;
      } catch (err) {
        if (!cancelled && !quiet) setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
        // Preserve the displayed result if a background refresh fails.
        again = quiet;
      } finally {
        if (!cancelled) setLoading(false);
      }
      if (!cancelled && again && polls < (options?.maxPolls ?? 30)) {
        polls += 1;
        timer = setTimeout(() => { void load(true); }, options?.pollIntervalMs ?? 10000);
      }
    };
    void load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refreshIndex]);

  return { data, loading, error, refetch: () => setRefreshIndex((n) => n + 1), setData };
}
