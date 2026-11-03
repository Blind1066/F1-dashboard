import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSchedule } from "../api/jolpica";
import { getDemoSchedule } from "../api/demo";
import type { ScheduleRace } from "../types";
import { Banner } from "../components/Banner";
import { UpcomingTrackHero } from "../components/UpcomingTrackHero";
import { NextRacesTiles } from "../components/NextRacesTiles";
import { ResultsModal } from "../components/ResultsModal";
import { SkeletonRows } from "../components/Skeleton";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedResultsRound, setSelectedResultsRound] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery<ScheduleRace[]>({
    queryKey: ["schedule", 2026],
    queryFn: () => getSchedule(2026),
    staleTime: 1000 * 60 * 30, // 30 mins
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

  // Determine next 3 races after the upcoming one
  const nextThreeRaces = useMemo(() => {
    if (races.length === 0) return [];
    if (!nextRace) return races.slice(0, 3);

    const nextIndex = races.findIndex((r) => r.round === nextRace.round);
    if (nextIndex === -1) return [];

    // Slice 3 races immediately after nextRace
    const after = races.slice(nextIndex + 1, nextIndex + 4);
    if (after.length >= 3) return after;

    // If season is near the end, fill up to 3 using upcoming or earlier rounds
    const remainingNeeded = 3 - after.length;
    const fill = races.filter((r) => r.round !== nextRace.round && !after.some((a) => a.round === r.round)).slice(0, remainingNeeded);
    return [...after, ...fill];
  }, [races, nextRace]);

  // Season statistics
  const totalRaces = races.length;
  const completedRaces = races.filter((r) => r.isCompleted).length;
  const progressPercent = totalRaces > 0 ? Math.round((completedRaces / totalRaces) * 100) : 0;

  if (isLoading && races.length === 0) {
    return (
      <main className="wrap">
        <header className="hero">
          <div>
            <h1 className="hero-title">Formula 1 2026 Season</h1>
            <p className="hero-sub">Loading track telemetry &amp; upcoming Grand Prix timings…</p>
          </div>
        </header>
        <div style={{ marginTop: "24px", display: "grid", gap: "12px" }}>
          <SkeletonRows count={6} />
        </div>
      </main>
    );
  }

  const handleOpenDetails = (round: number) => {
    const target = races.find((r) => r.round === round);
    if (target?.isCompleted) {
      setSelectedResultsRound(round);
    } else {
      navigate("/schedule");
    }
  };

  return (
    <main className="wrap home-wrap">
      {/* Fallback Banner */}
      {isDemo && (
        <Banner
          message="Live API unreachable. Displaying cached official 2026 calendar & track telemetry."
          kind="warn"
        />
      )}

      {/* Season Overview Bar */}
      <section className="season-overview-strip" aria-label="Season Status">
        <div className="season-overview-left">
          <div className="season-badge">FIA F1 2026</div>
          <div className="season-progress-label">
            <span>Season Progress:</span>
            <strong>{completedRaces} of {totalRaces} Rounds Complete</strong>
            <span className="season-pct">({progressPercent}%)</span>
          </div>
        </div>

        <div className="season-progress-bar-container">
          <div
            className="season-progress-fill"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        <div className="season-links">
          <Link to="/schedule" className="overview-pill-link">
            📅 Full Calendar ({totalRaces})
          </Link>
          <Link to="/standings" className="overview-pill-link highlight">
            🏆 Championship Standings
          </Link>
        </div>
      </section>

      {/* 1. UPCOMING TRACK (HERO SPOTLIGHT) */}
      <UpcomingTrackHero
        race={nextRace}
        onOpenDetails={handleOpenDetails}
      />

      {/* 2. NEXT 3 RACES (BIG TILES) */}
      <NextRacesTiles
        races={nextThreeRaces}
        onOpenDetails={handleOpenDetails}
      />

      {/* 3. QUICK CHAMPIONSHIP & CALENDAR CARDS */}
      <section className="home-dashboard-grid" aria-label="Quick Navigation">
        <article className="home-card-cta">
          <div className="cta-icon">🏆</div>
          <div className="cta-content">
            <h3 className="cta-title">2026 Championship Standings</h3>
            <p className="cta-desc">
              Explore live Driver &amp; Constructor title standings, points deltas, and historical round-by-round progressions.
            </p>
            <Link to="/standings" className="cta-link-btn">
              View World Standings →
            </Link>
          </div>
        </article>

        <article className="home-card-cta">
          <div className="cta-icon">🏁</div>
          <div className="cta-content">
            <h3 className="cta-title">Full 2026 Grand Prix Schedule</h3>
            <p className="cta-desc">
              Complete calendar across all 23 races with dual local and circuit time zones, weekend sessions, and FIA classifications.
            </p>
            <Link to="/schedule" className="cta-link-btn">
              Explore Full Calendar →
            </Link>
          </div>
        </article>
      </section>

      {/* Classification Modal if opened */}
      {selectedResultsRound !== null && (
        <ResultsModal
          round={selectedResultsRound}
          onClose={() => setSelectedResultsRound(null)}
        />
      )}
    </main>
  );
};
