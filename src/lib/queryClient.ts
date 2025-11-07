import { QueryClient } from "@tanstack/react-query";

/**
 * Create QueryClient outside of any React component
 * This prevents re-creation on every render and is compatible with SSR/Vercel
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time before data is considered stale (1 minute)
      staleTime: 60 * 1000,
      // Disable automatic refetch on window focus for better UX
      refetchOnWindowFocus: false,
      // Retry failed requests up to 3 times
      retry: 3,
      // Retry delay increases exponentially
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});
