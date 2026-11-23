import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProcessedLapSummary } from "../../types/telemetry";
import { formatLapTime } from "../../api/telemetryDemo";

interface LapAnalysisTabProps {
  lapsA: ProcessedLapSummary[];
  lapsB?: ProcessedLapSummary[];
  driverAName: string;
  driverAColour: string;
  driverBName?: string;
  driverBColour?: string;
  selectedLapNumber: number;
  onSelectLap: (lap: number) => void;
}

interface LapDotProps {
  cx?: number;
  cy?: number;
  payload?: {
    isFastest?: boolean;
    isPB?: boolean;
    [key: string]: unknown;
  };
}

export const LapAnalysisTab: React.FC<LapAnalysisTabProps> = ({
  lapsA,
  lapsB = [],
  driverAName,
  driverAColour,
  driverBName,
  driverBColour = "#64c4ff",
  selectedLapNumber,
  onSelectLap,
}) => {
  const [filterValidOnly, setFilterValidOnly] = useState(true);

  // Compute key metrics
  const validLapsA = useMemo(() => {
    return lapsA.filter((l) => !l.isPitOut && l.lapDuration < 120);
  }, [lapsA]);

  const fastestLapA = useMemo(() => {
    if (!validLapsA.length) return lapsA[0];
    return [...validLapsA].sort((a, b) => a.lapDuration - b.lapDuration)[0];
  }, [validLapsA, lapsA]);

  const bestS1 = useMemo(() => {
    const s1s = lapsA.filter((l) => l.s1 && l.s1 > 10).map((l) => l.s1 as number);
    return s1s.length ? Math.min(...s1s) : 18.158;
  }, [lapsA]);

  const bestS2 = useMemo(() => {
    const s2s = lapsA.filter((l) => l.s2 && l.s2 > 10).map((l) => l.s2 as number);
    return s2s.length ? Math.min(...s2s) : 34.020;
  }, [lapsA]);

  const bestS3 = useMemo(() => {
    const s3s = lapsA.filter((l) => l.s3 && l.s3 > 10).map((l) => l.s3 as number);
    return s3s.length ? Math.min(...s3s) : 18.362;
  }, [lapsA]);

  const theoreticalBest = Number((bestS1 + bestS2 + bestS3).toFixed(3));
  const theoreticalGain = fastestLapA
    ? Number((fastestLapA.lapDuration - theoreticalBest).toFixed(3))
    : 0;

  const avgLapTimeA = useMemo(() => {
    if (!validLapsA.length) return 74.0;
    const sum = validLapsA.reduce((acc, l) => acc + l.lapDuration, 0);
    return Number((sum / validLapsA.length).toFixed(3));
  }, [validLapsA]);

  // Consistency analysis (standard deviation of valid laps)
  const consistencyStats = useMemo(() => {
    if (validLapsA.length < 3) return { stdDev: 0.35, rating: "96.5%" };
    const mean = avgLapTimeA;
    const variance =
      validLapsA.reduce((sum, l) => sum + Math.pow(l.lapDuration - mean, 2), 0) /
      validLapsA.length;
    const stdDev = Number(Math.sqrt(variance).toFixed(3));
    // Score based on stdDev: 0.2s = 99%, 0.8s = 90%
    const score = Math.max(80, Math.min(99.5, 100 - stdDev * 12)).toFixed(1);
    return { stdDev, rating: `${score}%` };
  }, [validLapsA, avgLapTimeA]);

  // Chart data: Lap vs Time and Delta to Driver B
  const chartData = useMemo(() => {
    return lapsA.map((lA) => {
      const lB = lapsB.find((b) => b.lapNumber === lA.lapNumber);
      const delta = lB ? Number((lA.lapDuration - lB.lapDuration).toFixed(3)) : undefined;
      return {
        lap: lA.lapNumber,
        driverATime: lA.lapDuration,
        driverBTime: lB?.lapDuration,
        delta,
        s1: lA.s1,
        s2: lA.s2,
        s3: lA.s3,
        compound: lA.compound,
        isPitOut: lA.isPitOut,
        isPB: lA.isPersonalBest,
        isFastest: lA.isOverallFastest,
      };
    });
  }, [lapsA, lapsB]);

  const displayedLaps = filterValidOnly
    ? lapsA.filter((l) => !l.isPitOut && l.lapDuration < 120)
    : lapsA;

  return (
    <div className="lap-analysis-container">
      {/* Overview Stat Cards */}
      <div className="lap-stats-grid">
        <div className="lstat-card fastest">
          <div className="lstat-label">Fastest Lap</div>
          <div className="lstat-val purple">
            🟣 {fastestLapA?.lapDurationDisplay || "--:--.---"}
          </div>
          <div className="lstat-meta">Lap #{fastestLapA?.lapNumber || "-"} ({fastestLapA?.compound || "MEDIUM"})</div>
        </div>

        <div className="lstat-card">
          <div className="lstat-label">Theoretical Best</div>
          <div className="lstat-val green">
            ✨ {formatLapTime(theoreticalBest)}
          </div>
          <div className="lstat-meta">
            S1: {bestS1}s · S2: {bestS2}s · S3: {bestS3}s (-{theoreticalGain > 0 ? theoreticalGain : 0}s gain)
          </div>
        </div>

        <div className="lstat-card">
          <div className="lstat-label">Average Race Pace</div>
          <div className="lstat-val">{formatLapTime(avgLapTimeA)}</div>
          <div className="lstat-meta">{validLapsA.length} clean laps counted</div>
        </div>

        <div className="lstat-card">
          <div className="lstat-label">Pace Consistency</div>
          <div className="lstat-val gold">{consistencyStats.rating}</div>
          <div className="lstat-meta">±{consistencyStats.stdDev}s standard deviation</div>
        </div>
      </div>

      {/* 1. LAP TIME EVOLUTION CHART */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div className="chart-title">
            <span className="chart-badge">PACE</span>
            <span>Lap Time Evolution Throughout Race</span>
          </div>
          <div className="chart-meta">
            <span>Points: {chartData.length} laps</span>
            <span>•</span>
            <span style={{ color: "var(--muted)" }}>Lower is faster</span>
          </div>
        </div>

        <div className="chart-body">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="lap" stroke="var(--muted)" fontSize={11} unit="L" />
              <YAxis domain={["dataMin - 1", "dataMax + 2"]} stroke="var(--muted)" fontSize={11} unit="s" />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="f1-chart-tooltip">
                      <div className="tt-dist">Lap {d.lap}</div>
                      <div className="tt-item" style={{ color: driverAColour }}>
                        <span>{driverAName}:</span> <strong>{formatLapTime(d.driverATime)}</strong>
                      </div>
                      {d.driverBTime && (
                        <div className="tt-item" style={{ color: driverBColour }}>
                          <span>{driverBName}:</span> <strong>{formatLapTime(d.driverBTime)}</strong>
                        </div>
                      )}
                      {d.delta !== undefined && (
                        <div className="tt-delta">
                          Delta: {d.delta > 0 ? `+${d.delta}` : d.delta}s
                        </div>
                      )}
                      <div className="tt-sub">Tyre: {d.compound}</div>
                    </div>
                  );
                }}
              />
              <ReferenceLine y={fastestLapA?.lapDuration} stroke="#a855f7" strokeDasharray="3 3" label={{ value: "FL", fill: "#a855f7", fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="driverATime"
                name={driverAName}
                stroke={driverAColour}
                strokeWidth={2.5}
                dot={(props: LapDotProps) => {
                  const { cx, cy, payload } = props;
                  if (!payload) return null;
                  if (payload.isFastest) {
                    return <circle cx={cx} cy={cy} r={5} fill="#a855f7" stroke="#ffffff" strokeWidth={2} />;
                  }
                  if (payload.isPB) {
                    return <circle cx={cx} cy={cy} r={3} fill="#30d158" />;
                  }
                  return <circle cx={cx} cy={cy} r={1.5} fill={driverAColour} />;
                }}
              />
              {driverBName && (
                <Line
                  type="monotone"
                  dataKey="driverBTime"
                  name={driverBName}
                  stroke={driverBColour}
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. SECTOR TIMES PROGRESSION */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div className="chart-title">
            <span className="chart-badge">SECTORS</span>
            <span>Sector Breakdown per Lap (S1, S2, S3)</span>
          </div>
          <div className="chart-meta">
            <span style={{ color: "#ff3b30" }}>🔴 S1: ~{bestS1}s</span>
            <span>•</span>
            <span style={{ color: "#0080ff" }}>🔵 S2: ~{bestS2}s</span>
            <span>•</span>
            <span style={{ color: "#ffcc00" }}>🟡 S3: ~{bestS3}s</span>
          </div>
        </div>

        <div className="chart-body">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData.slice(0, 35)} margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="lap" stroke="var(--muted)" fontSize={11} unit="L" />
              <YAxis domain={[0, 90]} stroke="var(--muted)" fontSize={11} unit="s" />
              <Tooltip />
              <Bar dataKey="s1" name="Sector 1" stackId="a" fill="#ff3b30" />
              <Bar dataKey="s2" name="Sector 2" stackId="a" fill="#0080ff" />
              <Bar dataKey="s3" name="Sector 3" stackId="a" fill="#ffcc00" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. LAP-BY-LAP TIMING DATA TABLE */}
      <div className="lap-table-wrap">
        <div className="lap-table-header-row">
          <h3 className="section-subtitle">Lap Timing Classification Table</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              type="button"
              className={`pill-btn${filterValidOnly ? " active" : ""}`}
              onClick={() => setFilterValidOnly((v) => !v)}
              style={{ fontSize: "11px", padding: "3px 10px" }}
            >
              {filterValidOnly ? "Filtered: Green Flag Laps" : "Show All Laps"}
            </button>
            <span className="table-hint">Click any row to load telemetry for that lap</span>
          </div>
        </div>

        <table className="f1-lap-table">
          <thead>
            <tr>
              <th>Lap</th>
              <th>Sector 1</th>
              <th>Sector 2</th>
              <th>Sector 3</th>
              <th>Lap Time</th>
              <th>Delta to Best</th>
              <th>Speed Trap</th>
              <th>Tyre</th>
              <th>Tyre Age</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {displayedLaps.map((lap) => {
              const deltaToBest = fastestLapA
                ? Number((lap.lapDuration - fastestLapA.lapDuration).toFixed(3))
                : 0;
              const isSelected = lap.lapNumber === selectedLapNumber;

              return (
                <tr
                  key={lap.lapNumber}
                  className={`lap-row${isSelected ? " selected" : ""}${lap.isOverallFastest ? " fastest-lap" : ""}`}
                  onClick={() => onSelectLap(lap.lapNumber)}
                >
                  <td className="lap-num-cell">
                    <strong>#{lap.lapNumber}</strong>
                  </td>
                  <td className={lap.s1 && lap.s1 <= bestS1 + 0.05 ? "pb-green" : ""}>
                    {lap.s1 ? `${lap.s1.toFixed(3)}s` : "-"}
                  </td>
                  <td className={lap.s2 && lap.s2 <= bestS2 + 0.05 ? "pb-green" : ""}>
                    {lap.s2 ? `${lap.s2.toFixed(3)}s` : "-"}
                  </td>
                  <td className={lap.s3 && lap.s3 <= bestS3 + 0.05 ? "pb-green" : ""}>
                    {lap.s3 ? `${lap.s3.toFixed(3)}s` : "-"}
                  </td>
                  <td className="lap-time-cell">
                    <strong>{lap.lapDurationDisplay}</strong>
                    {lap.isOverallFastest && <span className="fl-purple-badge">🟣 FL</span>}
                  </td>
                  <td className="delta-cell">
                    {deltaToBest === 0 ? (
                      <span className="best-mark">BEST</span>
                    ) : (
                      <span>+{deltaToBest}s</span>
                    )}
                  </td>
                  <td>{lap.speedTrap ? `${lap.speedTrap} km/h` : "-"}</td>
                  <td>
                    <span className={`tyre-compound-badge ${lap.compound.toLowerCase()}`}>
                      {lap.compound[0]}
                    </span>
                  </td>
                  <td>{lap.tyreAge} laps</td>
                  <td>
                    {lap.isPitOut ? (
                      <span className="pit-badge">PIT OUT</span>
                    ) : lap.lapDuration > 110 ? (
                      <span className="in-pit-badge">IN PIT</span>
                    ) : (
                      <span className="clean-badge">CLEAN</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
