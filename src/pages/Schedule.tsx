import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
type SeasonView = 2026 | 2027;

interface SeasonScheduleSectionProps {
  season: 2026 | 2027;
  title: string;
  badgeLabel: string;
  badgeType: "active" | "provisional";
  races: ScheduleRace[];
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  openRounds: Set<string>;
  onToggleRound: (roundKey: string) => void;
  onOpenResults: (round: number) => void;
  nextRace: ScheduleRace | null;
}

const SeasonScheduleSection: React.FC<SeasonScheduleSectionProps> = ({
  season,
  title,
  badgeLabel,
  badgeType,
  races,
  filter,
  onFilterChange,
  openRounds,
  onToggleRound,
  onOpenResults,
  nextRace,
}) => {
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

  return (
    <section className="schedule-card" aria-label={`${season} Grand Prix Calendar`}>
      <div className="schedule-card-header">
        <div className="schedule-card-heading-group">
          <div className="schedule-season-badge-row">
            <span className={`season-chip-pill ${badgeType}`}>{badgeLabel}</span>
            <span className="schedule-rounds-pill">
              {completedCount > 0 ? `${completedCount} / ${allCount} Complete` : `${allCount} Rounds Scheduled`}
            </span>
          </div>
          <h2 className="schedule-section-h2">{title}</h2>
          <span className="tz-notice">
            Times automatically converted to your local time zone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
          </span>
        </div>

        {/* Filter Pills */}
        <div className="filter-pills" role="tablist" aria-label={`Filter ${season} races`}>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            className={`pill-btn${filter === "all" ? " active" : ""}`}
            onClick={() => onFilterChange("all")}
          >
            All ({allCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "upcoming"}
            className={`pill-btn${filter === "upcoming" ? " active" : ""}`}
            onClick={() => onFilterChange("upcoming")}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "completed"}
            className={`pill-btn${filter === "completed" ? " active" : ""}`}
            onClick={() => onFilterChange("completed")}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Races List */}
      <div className="schedule-list">
        {filteredRaces.length === 0 ? (
          <div className="schedule-empty-state">
            No races found for the "{filter}" filter in the {season} season.
          </div>
        ) : (
          filteredRaces.map((r) => {
            const roundKey = `${season}-${r.round}`;
            return (
              <RaceItem
                key={roundKey}
                race={r}
                isNext={nextRace?.round === r.round && !r.isCompleted}
                isOpen={openRounds.has(roundKey)}
                onToggle={() => onToggleRound(roundKey)}
                onOpenResults={(roundNum) => onOpenResults(roundNum)}
              />
            );
          })
        )}
      </div>
    </section>
  );
};

export const Schedule: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse initial season from search params
  const paramSeason = searchParams.get("season");
  const initialSeason: SeasonView = paramSeason === "2027" ? 2027 : 2026;

  const [seasonView, setSeasonView] = useState<SeasonView>(initialSeason);
  const [filter2026, setFilter2026] = useState<FilterType>("all");
  const [filter2027, setFilter2027] = useState<FilterType>("all");
  const [openRounds, setOpenRounds] = useState<Set<string>>(new Set());
  const [selectedResultsRound, setSelectedResultsRound] = useState<number | null>(null);

  // Sync state to URL parameter
  const handleSeasonChange = (view: SeasonView) => {
    setSeasonView(view);
    setSearchParams({ season: String(view) }, { replace: true });
  };

  // 1. Fetch 2026 Schedule
  const query2026 = useQuery<ScheduleRace[]>({
    queryKey: ["schedule", 2026],
    queryFn: () => getSchedule(2026),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  // 2. Fetch 2027 Schedule
  const query2027 = useQuery<ScheduleRace[]>({
    queryKey: ["schedule", 2027],
    queryFn: () => getSchedule(2027),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  const races2026: ScheduleRace[] = useMemo(() => {
    if (query2026.isError || !query2026.data || query2026.data.length === 0) {
      return getDemoSchedule(2026);
    }
    return query2026.data;
  }, [query2026.isError, query2026.data]);

  const races2027: ScheduleRace[] = useMemo(() => {
    if (query2027.isError || !query2027.data || query2027.data.length === 0) {
      return getDemoSchedule(2027);
    }
    return query2027.data;
  }, [query2027.isError, query2027.data]);

  // Determine next race for 2026
  const nextRace2026 = useMemo(() => {
    if (races2026.length === 0) return null;
    const upcoming = races2026.find((r) => !r.isCompleted);
    return upcoming || races2026[races2026.length - 1];
  }, [races2026]);

  // Determine next race for 2027 (Season Opener Round 1)
  const nextRace2027 = useMemo(() => {
    if (races2027.length === 0) return null;
    const upcoming = races2027.find((r) => !r.isCompleted);
    return upcoming || races2027[0];
  }, [races2027]);

  // Default opened sessions drawer for next race
  useEffect(() => {
    if (seasonView === 2026 && nextRace2026 && openRounds.size === 0) {
      setOpenRounds(new Set([`2026-${nextRace2026.round}`]));
    } else if (seasonView === 2027 && nextRace2027 && openRounds.size === 0) {
      setOpenRounds(new Set([`2027-${nextRace2027.round}`]));
    }
  }, [seasonView, nextRace2026, nextRace2027, openRounds.size]);

  const toggleRound = (roundKey: string) => {
    setOpenRounds((prev) => {
      const next = new Set(prev);
      if (next.has(roundKey)) {
        next.delete(roundKey);
      } else {
        next.add(roundKey);
      }
      return next;
    });
  };

  const isLoading = (query2026.isLoading && races2026.length === 0) || (query2027.isLoading && races2027.length === 0);

  if (isLoading) {
    return (
      <main className="wrap">
        <header className="hero">
          <div>
            <h1 className="hero-title">Formula 1 Race Schedule</h1>
            <p className="hero-sub">Loading official Formula 1 calendar timings…</p>
          </div>
        </header>
        <div style={{ marginTop: "24px", display: "grid", gap: "8px" }}>
          <SkeletonRows count={6} />
        </div>
      </main>
    );
  }

  const isDemo = query2026.isError;

  return (
    <main className="wrap schedule-page-wrap">
      {/* Fallback Banner if 2026 live API is unavailable */}
      {isDemo && (
        <Banner
          message="Couldn't reach live Jolpica API. Displaying official 2026 &amp; provisional 2027 calendar schedules."
          kind="warn"
        />
      )}

      {/* Hero Header */}
      <header className="hero schedule-hero">
        <div>
          <div className="schedule-hero-tag">
            <span className="live-radar-dot" />
            <span>FIA Formula 1 World Championship Calendar</span>
          </div>
          <h1 className="hero-title">
            {seasonView === 2026 ? "F1 2026 Championship Schedule" : "F1 2027 Provisional Schedule"}
          </h1>
          <p className="hero-sub">
            Track &amp; local time conversions, live countdown to lights out, weekend sessions, and full multi-season calendars.
          </p>
        </div>
      </header>

      {/* Season Switcher Navigation Bar (2026 / 2027) */}
      <section className="season-switcher-nav" role="tablist" aria-label="Formula 1 Seasons">
        <button
          type="button"
          role="tab"
          aria-selected={seasonView === 2026}
          className={`season-nav-btn${seasonView === 2026 ? " active" : ""}`}
          onClick={() => handleSeasonChange(2026)}
        >
          <div className="season-nav-btn-content">
            <div className="season-nav-top-line">
              <span className="season-badge-pill active-badge">ACTIVE</span>
              <span className="season-rounds-sub">23 Rounds</span>
            </div>
            <div className="season-nav-title">2026 Championship</div>
            <div className="season-nav-meta">Current Active Season</div>
          </div>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={seasonView === 2027}
          className={`season-nav-btn${seasonView === 2027 ? " active" : ""}`}
          onClick={() => handleSeasonChange(2027)}
        >
          <div className="season-nav-btn-content">
            <div className="season-nav-top-line">
              <span className="season-badge-pill prov-badge">PROVISIONAL</span>
              <span className="season-rounds-sub">23 Rounds</span>
            </div>
            <div className="season-nav-title">2027 Calendar</div>
            <div className="season-nav-meta">Upcoming Season</div>
          </div>
        </button>
      </section>

      {/* VIEW MODE 1: 2026 */}
      {seasonView === 2026 && (
        <div className="season-view-container">
          {/* Spotlight Card: Next Race 2026 */}
          <NextRaceCard race={nextRace2026} season={2026} />

          {/* 2026 Calendar Section */}
          <SeasonScheduleSection
            season={2026}
            title="2026 Grand Prix Calendar"
            badgeLabel="2026 ACTIVE SEASON"
            badgeType="active"
            races={races2026}
            filter={filter2026}
            onFilterChange={setFilter2026}
            openRounds={openRounds}
            onToggleRound={toggleRound}
            onOpenResults={(roundNum) => setSelectedResultsRound(roundNum)}
            nextRace={nextRace2026}
          />
        </div>
      )}

      {/* VIEW MODE 2: 2027 */}
      {seasonView === 2027 && (
        <div className="season-view-container">
          {/* Spotlight Card: 2027 Season Opener */}
          <NextRaceCard
            race={nextRace2027}
            season={2027}
            badgeLabel="2027 SEASON OPENER • ROUND 1"
          />

          {/* 2027 Calendar Section */}
          <SeasonScheduleSection
            season={2027}
            title="2027 Provisional Grand Prix Calendar"
            badgeLabel="2027 PROVISIONAL CALENDAR"
            badgeType="provisional"
            races={races2027}
            filter={filter2027}
            onFilterChange={setFilter2027}
            openRounds={openRounds}
            onToggleRound={toggleRound}
            onOpenResults={(roundNum) => setSelectedResultsRound(roundNum)}
            nextRace={nextRace2027}
          />
        </div>
      )}

      {/* Results Window Modal (if opened for any finished race) */}
      {selectedResultsRound !== null && (
        <ResultsModal
          round={selectedResultsRound}
          onClose={() => setSelectedResultsRound(null)}
        />
      )}
    </main>
  );
};
