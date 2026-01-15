import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      // Check if we are running in JUCE environment or if fetch fails (likely file:// protocol)
      const isJUCE = typeof window !== 'undefined' && (window as any).JUCE;

      try {
        // If in JUCE, don't even try to fetch API, return empty/default data immediately
        // This prevents console errors and "Network Error" alerts
        if (isJUCE) {
          console.log('[API] Skipping fetch in JUCE mode:', queryKey.join("/"));
          return []; // Return empty array (valid for /api/presets) or null
        }

        const res = await fetch(queryKey.join("/") as string, {
          credentials: "include",
        });

        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
          return null;
        }

        await throwIfResNotOk(res);
        return await res.json();
      } catch (e) {
        if (isJUCE) {
          console.warn('[API] Fetch failed in JUCE (expected), returning fallback:', e);
          return []; // Safe fallback
        }
        throw e;
      }
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
