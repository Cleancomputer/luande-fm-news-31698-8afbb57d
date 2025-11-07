import { QueryClient } from "@tanstack/react-query";

/**
 * QueryClient instance for React Query (TanStack Query)
 * Created outside component to prevent re-creation on renders
 * Optimized for Vercel deployment and mobile browsers
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});
