import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getSchedule } from "../api/jolpica";
import { getDemoSchedule } from "../api/demo";
import type { ScheduleRace } from "../types";
import { LiveInteractiveDashboard } from "../components/LiveInteractiveDashboard";
import { SkeletonRows } from "../components/Skeleton";

export const Live: React.FC = () => {
  const { data, isLoading, isError } = useQuery<ScheduleRace[]>({
    queryKey: ["schedule", 2026],
    queryFn: () => getSchedule(2026),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  const races: ScheduleRace[] = isError ? getDemoSchedule() : data || [];
  const upcomingRace = races.find((r) => !r.isCompleted) || races[races.length - 1];

  if (isLoading && races.length === 0) {
    return (
      <main className="wrap" style={{ padding: "32px 16px" }}>
        <h1 style={{ font: "700 28px var(--display)", textTransform: "uppercase" }}>
          Connecting to Formula 1 Telemetry Stream…
        </h1>
        <div style={{ marginTop: "24px", display: "grid", gap: "12px" }}>
          <SkeletonRows count={8} />
        </div>
      </main>
    );
  }

  return (
    <div className="fullscreen-pitwall-page">
      <LiveInteractiveDashboard race={upcomingRace} />
    </div>
  );
};
