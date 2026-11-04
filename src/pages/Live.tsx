import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getSchedule } from "../api/jolpica";
import { getDemoSchedule } from "../api/demo";
import type { ScheduleRace } from "../types";
import { Hero } from "../components/Hero";
import { LiveRaceTiming } from "../components/LiveRaceTiming";
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
      <main className="wrap">
        <Hero
          eyebrow="Formula 1 Pitwall"
          title="Live Race Timing & Telemetry"
          statusLine="Connecting to telemetry stream…"
        />
        <div style={{ marginTop: "24px", display: "grid", gap: "12px" }}>
          <SkeletonRows count={8} />
        </div>
      </main>
    );
  }

  return (
    <main className="wrap live-page-wrap">
      <Hero
        eyebrow="Formula 1 Pitwall Telemetry"
        title={upcomingRace ? `${upcomingRace.name} — Live Timing` : "Live Race Timing"}
        statusLine={upcomingRace ? `Live sector times, driver positions, intervals, tyre stints & fastest laps at ${upcomingRace.circuit.name}.` : "Live timing stream"}
      />

      <section style={{ marginTop: "24px", marginBottom: "40px" }}>
        <LiveRaceTiming race={upcomingRace} />
      </section>
    </main>
  );
};
