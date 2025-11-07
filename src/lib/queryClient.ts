import { QueryClient } from "@tanstack/react-query";

/**
 * QueryClient configuration for Vercel deployment
 * Created outside of any React component to prevent re-creation
 * Compatible with SSR and client-side rendering
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 1 minute
      staleTime: 60 * 1000,
      // Disable refetch on window focus for better mobile UX
      refetchOnWindowFocus: false,
      // Retry failed requests with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Enable network mode for offline support
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      // Mutations work in online mode only
      networkMode: 'online',
    },
  },
});
