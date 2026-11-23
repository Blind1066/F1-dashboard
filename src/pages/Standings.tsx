import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRaces, getStandings } from "../api/jolpica";
import { DEMO_RACES, DEMO_STANDINGS } from "../api/demo";
import type { Race, StandingsData } from "../types";
import { Hero } from "../components/Hero";
import { SeasonSelect } from "../components/SeasonSelect";
import { RoundSelect } from "../components/RoundSelect";
import { Banner } from "../components/Banner";
import { LeaderCard } from "../components/LeaderCard";
import { StandingsTable } from "../components/StandingsTable";

export const Standings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const year = 2026;

  // 1. Initial Round parsed from URL
  const paramRound = searchParams.get("round");

  const [round, setRound] = useState<number | null>(() => {
    const parsed = Number(paramRound);
    return parsed > 0 ? parsed : null;
  });

  // 2. Query completed races for 2026
  const racesQuery = useQuery({
    queryKey: ["races", year],
    queryFn: () => getRaces(year),
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  // Determine effective races list (live or demo)
  const isRacesError = racesQuery.isError;
  const races: Race[] = useMemo(() => {
    if (isRacesError) return DEMO_RACES;
    return racesQuery.data || [];
  }, [isRacesError, racesQuery.data]);

  // Determine active round: default to latest completed round
  useEffect(() => {
    if (races.length > 0) {
      const availableRounds = races.map((r) => r.round);
      if (round === null || !availableRounds.includes(round)) {
        const latestRound = races[races.length - 1].round;
        setRound(latestRound);
      }
    }
  }, [races, round]);

  // Keep search params in the URL synchronized (?year=2026&round=RR)
  useEffect(() => {
    if (round !== null) {
      setSearchParams({ year: "2026", round: String(round) }, { replace: true });
    }
  }, [round, setSearchParams]);

  // 3. Query Standings for (year, round)
  const standingsQuery = useQuery({
    queryKey: ["standings", year, round],
    queryFn: () => (round !== null ? getStandings(year, round) : Promise.resolve(null)),
    enabled: round !== null && !isRacesError,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  const isDemo = isRacesError || standingsQuery.isError;
  const demoReason =
    racesQuery.error instanceof Error
      ? racesQuery.error.message
      : standingsQuery.error instanceof Error
      ? standingsQuery.error.message
      : "API unavailable";

  const standingsData: StandingsData = useMemo(() => {
    if (isDemo) return DEMO_STANDINGS;
    return standingsQuery.data || { drivers: [], teams: [] };
  }, [isDemo, standingsQuery.data]);

  const isLoading =
    (racesQuery.isLoading || (round !== null && standingsQuery.isLoading)) && !isDemo;

  const handleRoundChange = (newRound: number) => {
    setRound(newRound);
  };

  // Status line text
  const currentRace = races.find((r) => r.round === round) || races[0];
  let statusLine = "Loading…";
  if (isDemo) {
    statusLine = "Showing sample data";
  } else if (!isLoading && currentRace) {
    const when = currentRace.date
      ? new Date(currentRace.date).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";
    statusLine = `After Round ${currentRace.round} · ${currentRace.name}${when ? " · " + when : ""}`;
  }

  return (
    <main className="wrap">
      <Hero
        eyebrow="Championship standings"
        title="Driver &amp; Constructor Standings"
        statusLine={statusLine}
        controls={
          <>
            <SeasonSelect value={year} disabled={isLoading} />
            <RoundSelect
              races={races}
              selectedRound={round ?? 0}
              onChange={handleRoundChange}
              disabled={isLoading || isDemo}
            />
          </>
        }
      />

      {isDemo && (
        <Banner
          message={`Couldn't load live data (${demoReason}). Showing sample data instead.`}
          kind="warn"
        />
      )}

      {/* Championship Leaders */}
      {!isLoading && standingsData.drivers.length > 0 && (
        <LeaderCard drivers={standingsData.drivers} teams={standingsData.teams} />
      )}

      {/* Drivers' & Constructors' Standings Grid */}
      <StandingsTable
        drivers={standingsData.drivers}
        teams={standingsData.teams}
        loading={isLoading}
      />
    </main>
  );
};

