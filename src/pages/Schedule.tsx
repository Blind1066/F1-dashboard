import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSchedule } from "../api/jolpica";
import { getDemoSchedule } from "../api/demo";
import type { ScheduleRace } from "../types";
import { Banner } from "../components/Banner";
import { NextRaceCard } from "../components/NextRaceCard";
import { RaceItem } from "../components/RaceItem";
import { ResultsModal } from "../components/ResultsModal";
import { SkeletonRows } from "../components/Skeleton";

type FilterType = "all" | "upcoming" | "completed";

export const Schedule: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [openRounds, setOpenRounds] = useState<Set<number>>(new Set());
  const [selectedResultsRound, setSelectedResultsRound] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery<ScheduleRace[]>({
    queryKey: ["schedule", 2026],
    queryFn: () => getSchedule(2026),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  const isDemo = isError;
  const races: ScheduleRace[] = useMemo(() => {
    if (isError) return getDemoSchedule();
    return data || [];
  }, [isError, data]);

  // Determine next race (first non-completed race)
  const nextRace = useMemo(() => {
    if (races.length === 0) return null;
    const upcoming = races.find((r) => !r.isCompleted);
    return upcoming || races[races.length - 1];
  }, [races]);

  // By default, open the sessions drawer for the next race once loaded
  const [hasDefaultOpened, setHasDefaultOpened] = useState(false);
  if (nextRace && !hasDefaultOpened && openRounds.size === 0) {
    setOpenRounds(new Set([nextRace.round]));
    setHasDefaultOpened(true);
  }

  const toggleRound = (round: number) => {
    setOpenRounds((prev) => {
      const next = new Set(prev);
      if (next.has(round)) {
        next.delete(round);
      } else {
        next.add(round);
      }
      return next;
    });
  };

  const allCount = races.length;
  const upcomingCount = races.filter((r) => !r.isCompleted).length;
  const completedCount = races.filter((r) => r.isCompleted).length;

  const filteredRaces = useMemo(() => {
    if (filter === "upcoming") {
      return races.filter((r) => !r.isCompleted);
    }
    if (filter === "completed") {
      return races.filter((r) => r.isCompleted);
    }
    return races;
  }, [races, filter]);

  if (isLoading && races.length === 0) {
    return (
      <main className="wrap">
        <header className="hero">
          <div>
            <h1 className="hero-title">F1 2026 Race Schedule</h1>
            <p className="hero-sub">Loading official FIA Formula 1 calendar timings…</p>
          </div>
        </header>
        <div style={{ marginTop: "24px", display: "grid", gap: "8px" }}>
          <SkeletonRows count={6} />
        </div>
      </main>
    );
  }

  return (
    <main className="wrap">
      {/* Fallback Banner if API failed */}
      {isDemo && (
        <Banner
          message="Couldn't reach live Jolpica API. Showing 2026 calendar schedule."
          kind="warn"
        />
      )}

      {/* Hero Header */}
      <header className="hero">
        <div>
          <h1 className="hero-title">F1 2026 Race Schedule</h1>
          <p className="hero-sub">
            Track &amp; local time conversions, live countdown to lights out, and full weekend schedules.
          </p>
        </div>
      </header>

      {/* Spotlight Card: Next Race */}
      <NextRaceCard race={nextRace} />

      {/* Schedule Calendar Section */}
      <section className="schedule-card" aria-label="Season Grand Prix Calendar">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            padding: "16px 20px",
            borderBottom: "1px solid var(--line)",
            background: "var(--surface-2)",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                font: "700 18px var(--display)",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              2026 Grand Prix Calendar
            </h2>
            <span className="tz-notice">
              Times automatically converted to your browser local time
            </span>
          </div>

          {/* Filter Pills matching ALL (23) / UPCOMING (4) / COMPLETED (19) */}
          <div className="filter-pills" role="tablist" aria-label="Filter races">
            <button
              type="button"
              role="tab"
              aria-selected={filter === "all"}
              className={`pill-btn${filter === "all" ? " active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({allCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === "upcoming"}
              className={`pill-btn${filter === "upcoming" ? " active" : ""}`}
              onClick={() => setFilter("upcoming")}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === "completed"}
              className={`pill-btn${filter === "completed" ? " active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Races List */}
        <div className="schedule-list">
          {filteredRaces.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--muted)" }}>
              No races found for this filter.
            </div>
          ) : (
            filteredRaces.map((r) => (
              <RaceItem
                key={r.round}
                race={r}
                isNext={nextRace?.round === r.round}
                isOpen={openRounds.has(r.round)}
                onToggle={() => toggleRound(r.round)}
                onOpenResults={(roundNum) => setSelectedResultsRound(roundNum)}
              />
            ))
          )}
        </div>
      </section>

      {/* Results Window Modal */}
      {selectedResultsRound !== null && (
        <ResultsModal
          round={selectedResultsRound}
          onClose={() => setSelectedResultsRound(null)}
        />
      )}
    </main>
  );
};
