import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

// Sensible caching strategy: historical data long (1 hour), live/active data short (15s)
export const QUERY_STALE_TIMES = {
  historical: 1000 * 60 * 60, // 1 hour for past race results, schedules, standings
  live: 1000 * 15,            // 15 seconds for live/active telemetry & timing
  default: 1000 * 60 * 5,     // 5 minutes general default
} as const;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIMES.default,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours in cache
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

queryClient.setQueryDefaults(["results"], { staleTime: QUERY_STALE_TIMES.historical });
queryClient.setQueryDefaults(["standings"], { staleTime: QUERY_STALE_TIMES.historical });
queryClient.setQueryDefaults(["races"], { staleTime: QUERY_STALE_TIMES.historical });
queryClient.setQueryDefaults(["schedule"], { staleTime: QUERY_STALE_TIMES.historical });
queryClient.setQueryDefaults(["sessions"], { staleTime: QUERY_STALE_TIMES.historical });
queryClient.setQueryDefaults(["live"], { staleTime: QUERY_STALE_TIMES.live });
queryClient.setQueryDefaults(["telemetry"], { staleTime: QUERY_STALE_TIMES.live });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
