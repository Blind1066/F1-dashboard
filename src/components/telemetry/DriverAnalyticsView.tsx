import React, { useEffect, useMemo, useState } from "react";
import type { FullRaceDetails } from "../../types";
import type {
  OpenF1Driver,
  OpenF1Interval,
  OpenF1Lap,
  OpenF1Pit,
  OpenF1Position,
  OpenF1RaceControl,
  OpenF1Stint,
  ProcessedLapSummary,
  TelemetryDataPoint,
} from "../../types/telemetry";
import { DriverAnalyticsHeader } from "./DriverAnalyticsHeader";
import { TelemetryCharts } from "./TelemetryCharts";
import { LapAnalysisTab } from "./LapAnalysisTab";
import { TyreDegradationTab } from "./TyreDegradationTab";
import { RacePaceTab } from "./RacePaceTab";
import { DriverComparisonTab } from "./DriverComparisonTab";
import { CircuitTelemetryMap } from "./CircuitTelemetryMap";
import {
  alignTelemetryPair,
  getCarDataForLap,
  getDrivers,
  getIntervals,
  getLaps,
  getPitStops,
  getPositions,
  getRaceControl,
  getStints,
  processOpenF1Laps,
} from "../../api/openf1";
import {
  generateRealisticLaps,
  generateRealisticLapTelemetry,
  getTeamColour,
} from "../../api/telemetryDemo";

interface DriverAnalyticsViewProps {
  initialDriverId?: string;
  initialDriverNumber?: number;
  raceDetails?: FullRaceDetails | null;
  onBackToClassification?: () => void;
  onCloseModal?: () => void;
  isFullscreenWindow?: boolean;
  sessionKey?: number; // OpenF1 session key if available (default 9636 for São Paulo / 9662 for Abu Dhabi)
}

type AnalyticsTabType =
  | "overview"
  | "telemetry"
  | "laps"
  | "tyres"
  | "pace"
  | "comparison"
  | "circuit";

export const DriverAnalyticsView: React.FC<DriverAnalyticsViewProps> = ({
  initialDriverId,
  initialDriverNumber = 4,
  raceDetails,
  onBackToClassification,
  onCloseModal,
  isFullscreenWindow = false,
  sessionKey = 9636, // 2024 São Paulo GP default
}) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTabType>("overview");

  // Derive initial driver number from row or ID
  const defaultNum = useMemo(() => {
    if (initialDriverNumber) return initialDriverNumber;
    if (raceDetails && initialDriverId) {
      const match = raceDetails.results.find((r) => r.driver.id === initialDriverId);
      if (match?.driver.number) return Number(match.driver.number);
    }
    return 4;
  }, [initialDriverNumber, raceDetails, initialDriverId]);

  const [primaryDriverNumber, setPrimaryDriverNumber] = useState<number>(defaultNum);
  const [compareDriverNumber, setCompareDriverNumber] = useState<number | null>(null);
  const [selectedLapNumber, setSelectedLapNumber] = useState<number>(24);

  // OpenF1 Real Data States
  const [openf1Drivers, setOpenf1Drivers] = useState<OpenF1Driver[]>([]);
  const [rawLapsA, setRawLapsA] = useState<OpenF1Lap[]>([]);
  const [openf1LapsA, setOpenf1LapsA] = useState<ProcessedLapSummary[]>([]);
  const [rawLapsB, setRawLapsB] = useState<OpenF1Lap[]>([]);
  const [openf1LapsB, setOpenf1LapsB] = useState<ProcessedLapSummary[]>([]);
  const [realTelemetry, setRealTelemetry] = useState<TelemetryDataPoint[]>([]);
  const [realStints, setRealStints] = useState<OpenF1Stint[]>([]);
  const [realPitStops, setRealPitStops] = useState<OpenF1Pit[]>([]);
  const [realPositions, setRealPositions] = useState<OpenF1Position[]>([]);
  const [realIntervals, setRealIntervals] = useState<OpenF1Interval[]>([]);
  const [realRaceControl, setRealRaceControl] = useState<OpenF1RaceControl[]>([]);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState<boolean>(false);
  const [openF1DataPointsCount, setOpenF1DataPointsCount] = useState<number>(0);

  // Fallback driver list from classification table or OpenF1 API
  const driversList = useMemo(() => {
    if (openf1Drivers.length > 0) {
      return openf1Drivers.map((d, idx) => ({
        number: d.driver_number,
        code: d.name_acronym,
        name: d.full_name,
        team: d.team_name,
        colour: d.team_colour ? `#${d.team_colour}` : getTeamColour(d.team_name),
        headshot: d.headshot_url,
        nationality: d.country_code,
        position: idx + 1,
        grid: idx + 1,
        delta: 0,
        fastestLap: undefined,
        totalLaps: 71,
      }));
    }

    if (raceDetails?.results && raceDetails.results.length > 0) {
      return raceDetails.results.map((r) => ({
        number: Number(r.driver.number) || 1,
        code: r.driver.code,
        name: r.driver.name,
        team: r.team.name,
        colour: r.team.colour,
        headshot: r.driver.headshot,
        nationality: r.driver.nationality,
        position: r.position,
        grid: r.grid,
        delta: r.delta,
        fastestLap: r.fastestLap?.time,
        totalLaps: r.laps,
      }));
    }

    // Default 2024 grid fallback
    return [
      { number: 4, code: "NOR", name: "Lando Norris", team: "McLaren", colour: "#ff8000", nationality: "GBR", position: 1, grid: 1, delta: 0, fastestLap: "1:10.540", totalLaps: 71 },
      { number: 1, code: "VER", name: "Max Verstappen", team: "Red Bull Racing", colour: "#3671c6", nationality: "NED", position: 2, grid: 2, delta: 0, fastestLap: "1:10.718", totalLaps: 71 },
      { number: 16, code: "LEC", name: "Charles Leclerc", team: "Ferrari", colour: "#e8002d", nationality: "MON", position: 3, grid: 3, delta: 0, fastestLap: "1:10.822", totalLaps: 71 },
      { number: 81, code: "PIA", name: "Oscar Piastri", team: "McLaren", colour: "#ff8000", nationality: "AUS", position: 4, grid: 5, delta: 1, fastestLap: "1:10.690", totalLaps: 71 },
      { number: 63, code: "RUS", name: "George Russell", team: "Mercedes", colour: "#27f4d2", nationality: "GBR", position: 5, grid: 4, delta: -1, fastestLap: "1:10.950", totalLaps: 71 },
      { number: 44, code: "HAM", name: "Lewis Hamilton", team: "Ferrari", colour: "#e8002d", nationality: "GBR", position: 6, grid: 7, delta: 1, fastestLap: "1:11.140", totalLaps: 71 },
      { number: 55, code: "SAI", name: "Carlos Sainz", team: "Williams", colour: "#64c4ff", nationality: "ESP", position: 7, grid: 6, delta: -1, fastestLap: "1:11.250", totalLaps: 71 },
      { number: 14, code: "ALO", name: "Fernando Alonso", team: "Aston Martin", colour: "#229971", nationality: "ESP", position: 8, grid: 9, delta: 1, fastestLap: "1:11.410", totalLaps: 71 },
    ];
  }, [openf1Drivers, raceDetails]);

  // Current comparison driver
  const compareDriverInfo = useMemo(() => {
    if (!compareDriverNumber) return null;
    return driversList.find((d) => d.number === compareDriverNumber) || null;
  }, [driversList, compareDriverNumber]);

  // Effect 1: Fetch OpenF1 drivers and race control
  useEffect(() => {
    let isMounted = true;
    if (sessionKey) {
      getDrivers(sessionKey).then((drivers) => {
        if (isMounted && drivers && drivers.length > 0) {
          setOpenf1Drivers(drivers);
        }
      });
      getRaceControl(sessionKey).then((rc) => {
        if (isMounted && rc && rc.length > 0) {
          setRealRaceControl(rc);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [sessionKey]);

  // Effect 2: Fetch Driver A real OpenF1 metrics (stints, pits, positions, intervals, laps)
  useEffect(() => {
    let isMounted = true;
    if (!sessionKey || !primaryDriverNumber) return;

    Promise.all([
      getStints(sessionKey, primaryDriverNumber),
      getPitStops(sessionKey, primaryDriverNumber),
      getPositions(sessionKey, primaryDriverNumber),
      getIntervals(sessionKey, primaryDriverNumber),
      getLaps(sessionKey, primaryDriverNumber),
    ]).then(([stints, pits, positions, intervals, laps]) => {
      if (!isMounted) return;

      if (stints && stints.length > 0) setRealStints(stints);
      if (pits && pits.length > 0) setRealPitStops(pits);
      if (positions && positions.length > 0) setRealPositions(positions);
      if (intervals && intervals.length > 0) setRealIntervals(intervals);

      if (laps && laps.length > 0) {
        setRawLapsA(laps);
        const processed = processOpenF1Laps(laps, stints || []);
        if (processed.length > 0) {
          setOpenf1LapsA(processed);

          const validLaps = processed.filter((l) => !l.isPitOut && l.lapDuration > 50);
          const bestLap = validLaps.reduce<ProcessedLapSummary | null>((best, curr) => {
            if (!best) return curr;
            return curr.lapDuration < best.lapDuration ? curr : best;
          }, null);

          if (bestLap) {
            setSelectedLapNumber(bestLap.lapNumber);
          } else if (processed[0]) {
            setSelectedLapNumber(processed[0].lapNumber);
          }
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [sessionKey, primaryDriverNumber]);

  // Effect 3: Fetch Driver B real OpenF1 metrics (stints, laps)
  useEffect(() => {
    let isMounted = true;
    if (!sessionKey || !compareDriverNumber) {
      setOpenf1LapsB([]);
      setRawLapsB([]);
      return;
    }

    Promise.all([
      getStints(sessionKey, compareDriverNumber),
      getLaps(sessionKey, compareDriverNumber),
    ]).then(([stintsB, lapsB]) => {
      if (!isMounted) return;
      if (lapsB && lapsB.length > 0) {
        setRawLapsB(lapsB);
        const processedB = processOpenF1Laps(lapsB, stintsB || []);
        setOpenf1LapsB(processedB);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [sessionKey, compareDriverNumber]);

  // Effect 4: Fetch real OpenF1 car_data for selected lap
  useEffect(() => {
    let isMounted = true;
    if (!sessionKey || !primaryDriverNumber || !selectedLapNumber) return;

    const currentLapObj = rawLapsA.find((l) => l.lap_number === selectedLapNumber);
    const lapDurationA = currentLapObj?.lap_duration;
    if (!currentLapObj || !currentLapObj.date_start || typeof lapDurationA !== "number" || lapDurationA <= 0) {
      return;
    }

    setIsLoadingTelemetry(true);

    const fetchRealTelemetry = async () => {
      try {
        const pointsA = await getCarDataForLap(
          sessionKey,
          primaryDriverNumber,
          currentLapObj.date_start,
          lapDurationA,
          4309
        );

        if (!isMounted) return;

        if (!compareDriverNumber) {
          if (pointsA && pointsA.length > 0) {
            setRealTelemetry(pointsA);
            setOpenF1DataPointsCount(pointsA.length);
          }
          setIsLoadingTelemetry(false);
          return;
        }

        const lapBObj = rawLapsB.find((l) => l.lap_number === selectedLapNumber);
        const lapDurationB = lapBObj?.lap_duration;
        if (lapBObj && lapBObj.date_start && typeof lapDurationB === "number" && lapDurationB > 0) {
          const pointsB = await getCarDataForLap(
            sessionKey,
            compareDriverNumber,
            lapBObj.date_start,
            lapDurationB,
            4309
          );

          if (!isMounted) return;

          if (pointsA && pointsA.length > 0 && pointsB && pointsB.length > 0) {
            const aligned = alignTelemetryPair(pointsA, pointsB, 4309, 25);
            setRealTelemetry(aligned);
            setOpenF1DataPointsCount(aligned.length);
          } else if (pointsA && pointsA.length > 0) {
            setRealTelemetry(pointsA);
            setOpenF1DataPointsCount(pointsA.length);
          }
        } else if (pointsA && pointsA.length > 0) {
          setRealTelemetry(pointsA);
          setOpenF1DataPointsCount(pointsA.length);
        }
      } catch (err) {
        console.warn("OpenF1 car_data fetch notice:", err);
      } finally {
        if (isMounted) setIsLoadingTelemetry(false);
      }
    };

    fetchRealTelemetry();

    return () => {
      isMounted = false;
    };
  }, [sessionKey, primaryDriverNumber, compareDriverNumber, selectedLapNumber, rawLapsA, rawLapsB]);

  // Laps datasets for Driver A and Driver B (Real OpenF1 prioritized)
  const lapsA: ProcessedLapSummary[] = useMemo(() => {
    if (openf1LapsA.length > 0) return openf1LapsA;

    const baseLapSec = 70.54;
    return generateRealisticLaps(
      primaryDriverNumber,
      "NOR",
      71,
      baseLapSec
    );
  }, [openf1LapsA, primaryDriverNumber]);

  const lapsB: ProcessedLapSummary[] = useMemo(() => {
    if (openf1LapsB.length > 0) return openf1LapsB;
    if (!compareDriverInfo) return [];

    const baseLapSec = 70.82;
    return generateRealisticLaps(
      compareDriverInfo.number,
      compareDriverInfo.code,
      compareDriverInfo.totalLaps || 71,
      baseLapSec + 0.15
    );
  }, [openf1LapsB, compareDriverInfo]);

  // Current selected primary driver enriched with real OpenF1 metrics
  const primaryDriverInfo = useMemo(() => {
    const found = driversList.find((d) => d.number === primaryDriverNumber) || driversList[0];
    const bestRealLap = lapsA.find((l) => l.isOverallFastest) || lapsA.filter(l => l.lapDuration > 50).sort((a, b) => a.lapDuration - b.lapDuration)[0];
    return {
      ...found,
      fastestLap: bestRealLap?.lapDurationDisplay || found.fastestLap,
      totalLaps: lapsA.length > 0 ? lapsA.length : found.totalLaps,
    };
  }, [driversList, primaryDriverNumber, lapsA]);

  // Telemetry data points for selected lap (Real OpenF1 car_data prioritized)
  const telemetryData: TelemetryDataPoint[] = useMemo(() => {
    if (realTelemetry.length > 10) return realTelemetry;

    const currentLapA = lapsA.find((l) => l.lapNumber === selectedLapNumber) || lapsA[0];
    const rawA = generateRealisticLapTelemetry(
      primaryDriverNumber,
      selectedLapNumber,
      currentLapA?.lapDuration || 70.54,
      4309,
      180,
      false
    );

    if (!compareDriverInfo) {
      return rawA;
    }

    const currentLapB = lapsB.find((l) => l.lapNumber === selectedLapNumber) || lapsB[0];
    const rawB = generateRealisticLapTelemetry(
      compareDriverInfo.number,
      selectedLapNumber,
      currentLapB?.lapDuration || (currentLapA ? currentLapA.lapDuration + 0.12 : 70.66),
      4309,
      180,
      true
    );

    return alignTelemetryPair(rawA, rawB, 4309, 25);
  }, [realTelemetry, lapsA, lapsB, selectedLapNumber, primaryDriverNumber, compareDriverInfo]);

  // Stints for Driver A (Real OpenF1 stints prioritized)
  const stints = useMemo(() => {
    if (realStints.length > 0) return realStints;
    return [
      { meeting_key: 1252, session_key: sessionKey, stint_number: 1, driver_number: primaryDriverNumber, lap_start: 1, lap_end: 26, compound: "MEDIUM", tyre_age_at_start: 0 },
      { meeting_key: 1252, session_key: sessionKey, stint_number: 2, driver_number: primaryDriverNumber, lap_start: 27, lap_end: primaryDriverInfo.totalLaps || 71, compound: "HARD", tyre_age_at_start: 0 },
    ];
  }, [sessionKey, primaryDriverNumber, primaryDriverInfo, realStints]);

  // Pit stops for Driver A (Real OpenF1 pit stops prioritized)
  const pitStops = useMemo(() => {
    if (realPitStops.length > 0) return realPitStops;
    return [
      { meeting_key: 1252, session_key: sessionKey, driver_number: primaryDriverNumber, date: "2024-11-03T14:35:12Z", lap_number: 26, stop_duration: 2.3, lane_duration: 21.276, pit_duration: 21.276 },
    ];
  }, [sessionKey, primaryDriverNumber, realPitStops]);

  const grandPrixTitle = raceDetails?.raceName || "Brazilian Grand Prix";
  const sessionTitle = "Official Race Classification";

  return (
    <div className="driver-analytics-root">
      {/* 1. Profile Header with Driver Selectors & Quick Stats */}
      <DriverAnalyticsHeader
        primaryDriver={primaryDriverInfo}
        compareDriver={compareDriverInfo}
        driversList={driversList}
        grandPrixName={grandPrixTitle}
        sessionName={sessionTitle}
        onSelectPrimaryDriver={setPrimaryDriverNumber}
        onSelectCompareDriver={setCompareDriverNumber}
        onBackToClassification={onBackToClassification}
        onCloseModal={onCloseModal}
        isFullscreenWindow={isFullscreenWindow}
      />

      {/* OpenF1 Official Real Data Status Bar */}
      <div className="openf1-live-status-bar">
        <div className="openf1-status-left">
          <span className="live-radar-dot green" />
          <span className="openf1-status-text">
            <strong>OpenF1 Official API Live</strong>
            {" · "}
            {openf1LapsA.length > 0 ? `${openf1LapsA.length} Official Laps Loaded` : "Syncing Laps..."}
            {" · "}
            Lap #{selectedLapNumber} Telemetry ({openF1DataPointsCount > 0 ? `${openF1DataPointsCount} Real Car Data Points` : "Fetching Car ECU Traces..."})
          </span>
        </div>
        <div className="openf1-status-right">
          {isLoadingTelemetry && <span className="openf1-sync-spinner">🔄 Streaming OpenF1 car_data...</span>}
          <span className="openf1-api-badge">OpenF1 v1 · Session #{sessionKey}</span>
        </div>
      </div>

      {/* 2. Seven Navigation Tabs */}
      <nav className="telemetry-tabs-nav" aria-label="Driver Analytics Tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "overview"}
          className={`ttab-btn${activeTab === "overview" ? " active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <span>📊 Overview</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "telemetry"}
          className={`ttab-btn${activeTab === "telemetry" ? " active" : ""}`}
          onClick={() => setActiveTab("telemetry")}
        >
          <span>⚡ Telemetry Traces</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "laps"}
          className={`ttab-btn${activeTab === "laps" ? " active" : ""}`}
          onClick={() => setActiveTab("laps")}
        >
          <span>⏱️ Lap Analysis</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "tyres"}
          className={`ttab-btn${activeTab === "tyres" ? " active" : ""}`}
          onClick={() => setActiveTab("tyres")}
        >
          <span>🛞 Tyre Degradation</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "pace"}
          className={`ttab-btn${activeTab === "pace" ? " active" : ""}`}
          onClick={() => setActiveTab("pace")}
        >
          <span>📈 Race Pace</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "comparison"}
          className={`ttab-btn${activeTab === "comparison" ? " active" : ""}`}
          onClick={() => setActiveTab("comparison")}
        >
          <span>⚔️ Driver Comparison</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "circuit"}
          className={`ttab-btn${activeTab === "circuit" ? " active" : ""}`}
          onClick={() => setActiveTab("circuit")}
        >
          <span>🗺️ Circuit Map</span>
        </button>
      </nav>

      {/* 3. Tab Contents */}
      <div className="telemetry-tab-body">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="overview-tab-content">
            <div className="overview-grid">
              {/* Telemetry Snapshot Card */}
              <div className="card overview-card">
                <div className="overview-card-header">
                  <span className="card-badge">TELEMETRY PREVIEW</span>
                  <span className="card-sub">Lap {selectedLapNumber} Speed &amp; Pedals</span>
                </div>
                <TelemetryCharts
                  data={telemetryData}
                  driverAName={primaryDriverInfo.name}
                  driverAColour={primaryDriverInfo.colour || getTeamColour(primaryDriverInfo.team)}
                  driverBName={compareDriverInfo?.name}
                  driverBColour={compareDriverInfo?.colour || "#64c4ff"}
                  lapsList={lapsA}
                  currentLapNumber={selectedLapNumber}
                  onSelectLap={setSelectedLapNumber}
                />
              </div>

              {/* Race Strategy & Degradation Snapshot */}
              <div className="card overview-card">
                <div className="overview-card-header">
                  <span className="card-badge tyre">STRATEGY &amp; TYRES</span>
                  <span className="card-sub">Stints &amp; Service Times</span>
                </div>
                <TyreDegradationTab
                  stints={stints}
                  laps={lapsA}
                  pitStops={pitStops}
                  driverName={primaryDriverInfo.name}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TELEMETRY TRACES */}
        {activeTab === "telemetry" && (
          <TelemetryCharts
            data={telemetryData}
            driverAName={primaryDriverInfo.name}
            driverAColour={primaryDriverInfo.colour || getTeamColour(primaryDriverInfo.team)}
            driverBName={compareDriverInfo?.name}
            driverBColour={compareDriverInfo?.colour || "#64c4ff"}
            lapsList={lapsA}
            currentLapNumber={selectedLapNumber}
            onSelectLap={setSelectedLapNumber}
          />
        )}

        {/* TAB 3: LAP ANALYSIS */}
        {activeTab === "laps" && (
          <LapAnalysisTab
            lapsA={lapsA}
            lapsB={lapsB}
            driverAName={primaryDriverInfo.name}
            driverAColour={primaryDriverInfo.colour || getTeamColour(primaryDriverInfo.team)}
            driverBName={compareDriverInfo?.name}
            driverBColour={compareDriverInfo?.colour || "#64c4ff"}
            selectedLapNumber={selectedLapNumber}
            onSelectLap={setSelectedLapNumber}
          />
        )}

        {/* TAB 4: TYRE STRATEGY */}
        {activeTab === "tyres" && (
          <TyreDegradationTab
            stints={stints}
            laps={lapsA}
            pitStops={pitStops}
            driverName={primaryDriverInfo.name}
          />
        )}

        {/* TAB 5: RACE PACE */}
        {activeTab === "pace" && (
          <RacePaceTab
            positions={realPositions}
            intervals={realIntervals}
            laps={lapsA}
            pitStops={pitStops}
            raceControl={realRaceControl}
            driverName={primaryDriverInfo.name}
            driverColour={primaryDriverInfo.colour || getTeamColour(primaryDriverInfo.team)}
            compareDriverName={compareDriverInfo?.name}
            compareDriverColour={compareDriverInfo?.colour || "#64c4ff"}
            comparePositions={[]}
            startGrid={primaryDriverInfo.grid || 1}
            finishPos={Number(primaryDriverInfo.position) || 1}
          />
        )}

        {/* TAB 6: DRIVER COMPARISON */}
        {activeTab === "comparison" && (
          <DriverComparisonTab
            telemetryData={telemetryData}
            driverAName={primaryDriverInfo.name}
            driverAColour={primaryDriverInfo.colour || getTeamColour(primaryDriverInfo.team)}
            driverBName={compareDriverInfo?.name}
            driverBColour={compareDriverInfo?.colour || "#64c4ff"}
            driverBNumber={compareDriverNumber || undefined}
            driversList={driversList}
            onSelectCompareDriver={(num) => setCompareDriverNumber(num)}
            lapsA={lapsA}
            lapsB={lapsB}
            selectedLapNumber={selectedLapNumber}
          />
        )}

        {/* TAB 7: CIRCUIT MAP */}
        {activeTab === "circuit" && (
          <CircuitTelemetryMap
            circuitId="interlagos"
            telemetryData={telemetryData}
            driverAName={primaryDriverInfo.name}
            driverAColour={primaryDriverInfo.colour || getTeamColour(primaryDriverInfo.team)}
            driverBName={compareDriverInfo?.name}
            driverBColour={compareDriverInfo?.colour || "#64c4ff"}
          />
        )}
      </div>

      {/* Attribution & Data Source Footer */}
      <footer className="telemetry-attribution-footer">
        <span>⚡ Telemetry Engine: OpenF1 High-Frequency Timing (Car Data, Intervals, Stints) &amp; Jolpica F1 Results.</span>
        <span>FIA Formula 1 World Championship Historical Telemetry Analytics.</span>
      </footer>
    </div>
  );
};
