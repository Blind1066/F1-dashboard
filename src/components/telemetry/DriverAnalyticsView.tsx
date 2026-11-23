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
  getAllDriverProfiles,
  getDriverIntervals,
  getDriverPerformanceProfile,
  getDriverPitStops,
  getDriverPositions,
  getDriverStints,
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
  sessionKey?: number; // OpenF1 session key if available (default 9636 for São Paulo)
  sessionName?: string;
  circuitName?: string;
  countryName?: string;
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
  initialDriverNumber = 1,
  raceDetails,
  onBackToClassification,
  onCloseModal,
  isFullscreenWindow = false,
  sessionKey = 9636, // 2024 São Paulo GP default
  sessionName,
  circuitName,
  countryName,
}) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTabType>("overview");

  // Derive initial driver number from row or ID (default 1: Max Verstappen P1)
  const defaultNum = useMemo(() => {
    if (initialDriverNumber) return initialDriverNumber;
    if (raceDetails && initialDriverId) {
      const match = raceDetails.results.find((r) => r.driver.id === initialDriverId);
      if (match?.driver.number) return Number(match.driver.number);
    }
    return 1;
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
  const [telemetrySource, setTelemetrySource] = useState<"live" | "simulated">("simulated");

  // Complete 20-driver grid with official São Paulo GP grid & finishing positions
  const driversList = useMemo(() => {
    let list: Array<{
      number: number;
      code: string;
      name: string;
      team: string;
      colour?: string;
      headshot?: string;
      nationality?: string;
      position?: number | string;
      grid?: number;
      delta?: number;
      fastestLap?: string;
      avgLap?: string;
      totalLaps?: number;
    }> = [];

    if (openf1Drivers.length > 0) {
      list = openf1Drivers.map((d, idx) => {
        const prof = getDriverPerformanceProfile(d.driver_number);
        return {
          number: d.driver_number,
          code: d.name_acronym,
          name: d.full_name,
          team: d.team_name,
          colour: d.team_colour ? `#${d.team_colour}` : prof.teamColor || getTeamColour(d.team_name),
          headshot: d.headshot_url || prof.headshot,
          nationality: d.country_code || prof.nationality,
          position: prof.finishPosition || idx + 1,
          grid: prof.startGrid || idx + 1,
          delta: prof.delta ?? 0,
          fastestLap: prof.fastestLapDisplay,
          avgLap: prof.avgLapTimeDisplay,
          totalLaps: 69,
        };
      });
    } else if (raceDetails?.results && raceDetails.results.length > 0) {
      list = raceDetails.results.map((r) => {
        const num = Number(r.driver.number) || 1;
        const prof = getDriverPerformanceProfile(num);
        return {
          number: num,
          code: r.driver.code,
          name: r.driver.name,
          team: r.team.name,
          colour: r.team.colour || prof.teamColor,
          headshot: r.driver.headshot || prof.headshot,
          nationality: r.driver.nationality || prof.nationality,
          position: prof.finishPosition || r.position,
          grid: prof.startGrid || r.grid,
          delta: prof.delta ?? r.delta,
          fastestLap: prof.fastestLapDisplay || r.fastestLap?.time,
          avgLap: prof.avgLapTimeDisplay,
          totalLaps: 69,
        };
      });
    } else {
      // Official 20-driver grid from DRIVER_PERFORMANCE_PROFILES
      list = getAllDriverProfiles().map((p) => ({
        number: p.number,
        code: p.code,
        name: p.name,
        team: p.team,
        colour: p.teamColor,
        headshot: p.headshot,
        nationality: p.nationality,
        position: p.finishPosition,
        grid: p.startGrid,
        delta: p.delta,
        fastestLap: p.fastestLapDisplay,
        avgLap: p.avgLapTimeDisplay,
        totalLaps: 69,
      }));
    }

    // Sort strictly by official finishing position P1 through P20
    return list.sort((a, b) => Number(a.position || 99) - Number(b.position || 99));
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
        const resA = await getCarDataForLap(
          sessionKey,
          primaryDriverNumber,
          currentLapObj.date_start,
          lapDurationA,
          4309
        );

        if (!isMounted) return;

        if (!compareDriverNumber) {
          setTelemetrySource(resA.source);
          if (resA.data && resA.data.length > 0) {
            setRealTelemetry(resA.data);
            setOpenF1DataPointsCount(resA.data.length);
          }
          setIsLoadingTelemetry(false);
          return;
        }

        const lapBObj = rawLapsB.find((l) => l.lap_number === selectedLapNumber);
        const lapDurationB = lapBObj?.lap_duration;
        if (lapBObj && lapBObj.date_start && typeof lapDurationB === "number" && lapDurationB > 0) {
          const resB = await getCarDataForLap(
            sessionKey,
            compareDriverNumber,
            lapBObj.date_start,
            lapDurationB,
            4309
          );

          if (!isMounted) return;

          setTelemetrySource(resA.source === "live" && resB.source === "live" ? "live" : resA.source);

          if (resA.data && resA.data.length > 0 && resB.data && resB.data.length > 0) {
            const aligned = alignTelemetryPair(resA.data, resB.data, 4309, 25);
            setRealTelemetry(aligned);
            setOpenF1DataPointsCount(aligned.length);
          } else if (resA.data && resA.data.length > 0) {
            setRealTelemetry(resA.data);
            setOpenF1DataPointsCount(resA.data.length);
          }
        } else if (resA.data && resA.data.length > 0) {
          setTelemetrySource(resA.source);
          setRealTelemetry(resA.data);
          setOpenF1DataPointsCount(resA.data.length);
        }
      } catch (err) {
        console.warn("OpenF1 car_data fetch notice:", err);
        setTelemetrySource("simulated");
      } finally {
        if (isMounted) setIsLoadingTelemetry(false);
      }
    };

    fetchRealTelemetry();

    return () => {
      isMounted = false;
    };
  }, [sessionKey, primaryDriverNumber, compareDriverNumber, selectedLapNumber, rawLapsA, rawLapsB]);

  // Laps datasets for Driver A and Driver B (Real OpenF1 prioritized or Distinct Realistic Driver Physics)
  const lapsA: ProcessedLapSummary[] = useMemo(() => {
    if (openf1LapsA.length > 0) return openf1LapsA;

    const profA = getDriverPerformanceProfile(primaryDriverNumber);
    return generateRealisticLaps(
      primaryDriverNumber,
      profA.code,
      71,
      profA.baseLapTime
    );
  }, [openf1LapsA, primaryDriverNumber]);

  const lapsB: ProcessedLapSummary[] = useMemo(() => {
    if (openf1LapsB.length > 0) return openf1LapsB;
    if (!compareDriverInfo) return [];

    const profB = getDriverPerformanceProfile(compareDriverInfo.number);
    return generateRealisticLaps(
      compareDriverInfo.number,
      profB.code,
      compareDriverInfo.totalLaps || 71,
      profB.baseLapTime
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

  // Telemetry data points for selected lap (Real OpenF1 car_data prioritized or Distinct Driver Physics)
  const telemetryData: TelemetryDataPoint[] = useMemo(() => {
    if (realTelemetry.length > 10) return realTelemetry;

    const profA = getDriverPerformanceProfile(primaryDriverNumber);
    const currentLapA = lapsA.find((l) => l.lapNumber === selectedLapNumber) || lapsA[0];
    const rawA = generateRealisticLapTelemetry(
      primaryDriverNumber,
      selectedLapNumber,
      currentLapA?.lapDuration || profA.baseLapTime,
      4309,
      200,
      false
    );

    if (!compareDriverInfo) {
      return rawA;
    }

    const profB = getDriverPerformanceProfile(compareDriverInfo.number);
    const currentLapB = lapsB.find((l) => l.lapNumber === selectedLapNumber) || lapsB[0];
    const rawB = generateRealisticLapTelemetry(
      compareDriverInfo.number,
      selectedLapNumber,
      currentLapB?.lapDuration || profB.baseLapTime,
      4309,
      200,
      true
    );

    return alignTelemetryPair(rawA, rawB, 4309, 25);
  }, [realTelemetry, lapsA, lapsB, selectedLapNumber, primaryDriverNumber, compareDriverInfo]);

  // Stints for Driver A (Real OpenF1 stints prioritized or Distinct Driver Strategy)
  const stints = useMemo(() => {
    if (realStints.length > 0) return realStints;
    return getDriverStints(primaryDriverNumber);
  }, [primaryDriverNumber, realStints]);

  // Pit stops for Driver A (Real OpenF1 pit stops prioritized or Distinct Driver Pit Stop)
  const pitStops = useMemo(() => {
    if (realPitStops.length > 0) return realPitStops;
    return getDriverPitStops(primaryDriverNumber);
  }, [primaryDriverNumber, realPitStops]);

  // Position and Interval progressions
  const positionsA = useMemo(() => {
    if (realPositions.length > 0) return realPositions;
    return getDriverPositions(primaryDriverNumber, lapsA.length || 71);
  }, [realPositions, primaryDriverNumber, lapsA.length]);

  const intervalsA = useMemo(() => {
    if (realIntervals.length > 0) return realIntervals;
    return getDriverIntervals(primaryDriverNumber, lapsA.length || 71);
  }, [realIntervals, primaryDriverNumber, lapsA.length]);

  const positionsB = useMemo(() => {
    if (!compareDriverInfo) return [];
    return getDriverPositions(compareDriverInfo.number, lapsA.length || 71);
  }, [compareDriverInfo, lapsA.length]);

  const grandPrixTitle =
    raceDetails?.raceName ||
    (countryName ? `${countryName} Grand Prix` : "Brazilian Grand Prix");
  const sessionTitle = sessionName || (circuitName ? `Official Race · ${circuitName}` : "Official Race Classification · Interlagos");

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
        dataSource={telemetrySource}
      />

      {/* OpenF1 Official Real Data Status Bar */}
      <div className="openf1-live-status-bar">
        <div className="openf1-status-left">
          <span className={`live-radar-dot ${telemetrySource === "live" ? "green" : "amber"}`} />
          <span className="openf1-status-text">
            <strong>{telemetrySource === "live" ? "Live OpenF1 data" : "Simulated data - OpenF1 unavailable"}</strong>
            {" · "}
            {openf1LapsA.length > 0 ? `${openf1LapsA.length} Official Laps Loaded` : "Syncing Laps..."}
            {" · "}
            Lap #{selectedLapNumber} Telemetry ({openF1DataPointsCount > 0 ? `${openF1DataPointsCount} Data Points` : "Fetching Car ECU Traces..."})
          </span>
        </div>
        <div className="openf1-status-right">
          <span className={`badge-data-source ${telemetrySource === "live" ? "live" : "simulated"}`}>
            {telemetrySource === "live" ? "🟢 Live OpenF1 data" : "🟡 Simulated data - OpenF1 unavailable"}
          </span>
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

            {/* Official São Paulo Grand Prix Starting Grid & Race Classification Table */}
            <div className="card telemetry-classification-card" style={{ marginTop: "20px" }}>
              <div className="classification-card-header">
                <div>
                  <div className="overview-eyebrow">
                    <span className="live-radar-dot" />
                    <span>Official Session Classification · Interlagos</span>
                  </div>
                  <h3 className="classification-title">
                    São Paulo Grand Prix — Starting Grid &amp; Race Results
                  </h3>
                  <p className="classification-sub">
                    Click any driver row to inspect their synchronized telemetry, braking points, throttle traces, and tyre strategy.
                  </p>
                </div>
                <div className="classification-header-tag">
                  <span>69 LAPS</span>
                  <span className="sep">•</span>
                  <span>AUTÓDROMO JOSÉ CARLOS PACE</span>
                </div>
              </div>

              <div className="table-container">
                <table className="telemetry-grid-table">
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>Pos</th>
                      <th style={{ width: "50px" }}>No</th>
                      <th>Driver</th>
                      <th>Team</th>
                      <th style={{ textAlign: "center" }}>Start Grid</th>
                      <th style={{ textAlign: "center" }}>Positions +/-</th>
                      <th style={{ textAlign: "right" }}>Fastest Lap</th>
                      <th style={{ textAlign: "right" }}>Status / Laps</th>
                      <th style={{ width: "110px", textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driversList.map((d) => {
                      const isSelected = d.number === primaryDriverNumber;
                      const isComparing = d.number === compareDriverNumber;
                      const deltaVal = Number(d.delta ?? 0);
                      const isWinner = d.position === 1;

                      return (
                        <tr
                          key={d.number}
                          className={`grid-table-row${isSelected ? " selected-primary" : ""}${isComparing ? " selected-compare" : ""}`}
                          onClick={() => setPrimaryDriverNumber(d.number)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>
                            <span className={`grid-pos-pill${isWinner ? " winner" : ""}`}>
                              {d.position ? `P${d.position}` : "-"}
                            </span>
                          </td>
                          <td>
                            <span className="driver-num-tag" style={{ color: d.colour }}>
                              #{d.number}
                            </span>
                          </td>
                          <td>
                            <div className="grid-driver-cell">
                              <span
                                className="team-bar-indicator"
                                style={{ background: d.colour || "#e10600" }}
                              />
                              <span className="grid-driver-name">{d.name}</span>
                              <span className="grid-driver-code">{d.code}</span>
                            </div>
                          </td>
                          <td>
                            <span className="grid-team-name">{d.team}</span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span className="grid-start-pill">
                              P{d.grid ?? "-"}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {deltaVal > 0 ? (
                              <span className="delta-gain-pill">▲ +{deltaVal}</span>
                            ) : deltaVal < 0 ? (
                              <span className="delta-loss-pill">▼ {deltaVal}</span>
                            ) : (
                              <span className="delta-held-pill">= held</span>
                            )}
                          </td>
                          <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                            {d.number === 1 ? (
                              <span style={{ color: "#d946ef", fontWeight: 700 }}>
                                🟣 {d.fastestLap || "1:20.472"}
                              </span>
                            ) : (
                              <span>{d.fastestLap || "-"}</span>
                            )}
                          </td>
                          <td style={{ textAlign: "right", color: "var(--muted)" }}>
                            {d.position && Number(d.position) > 17
                              ? (d.position === 18 || d.position === 19 ? "DNS" : "DSQ")
                              : d.position === 16 || d.position === 17
                              ? "DNF"
                              : "69 Laps"}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              className={`telemetry-view-btn${isSelected ? " active" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPrimaryDriverNumber(d.number);
                              }}
                            >
                              {isSelected ? "Selected" : "Analyze"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
            positions={positionsA}
            intervals={intervalsA}
            laps={lapsA}
            pitStops={pitStops}
            raceControl={realRaceControl}
            driverName={primaryDriverInfo.name}
            driverColour={primaryDriverInfo.colour || getTeamColour(primaryDriverInfo.team)}
            compareDriverName={compareDriverInfo?.name}
            compareDriverColour={compareDriverInfo?.colour || "#64c4ff"}
            comparePositions={positionsB}
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
