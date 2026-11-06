import React, { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TelemetryDataPoint } from "../../types/telemetry";
import { computeTelemetryStats } from "../../api/telemetryDemo";

interface TelemetryChartsProps {
  data: TelemetryDataPoint[];
  driverAName: string;
  driverAColour: string;
  driverBName?: string;
  driverBColour?: string;
  lapsList?: Array<{ lapNumber: number; lapDurationDisplay: string; isFastest?: boolean }>;
  currentLapNumber: number;
  onSelectLap: (lapNumber: number) => void;
  circuitLengthM?: number;
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({
  data,
  driverAName,
  driverAColour,
  driverBName,
  driverBColour = "#64c4ff",
  lapsList = [],
  currentLapNumber,
  onSelectLap,
  circuitLengthM = 4309,
}) => {
  const [activeChannel, setActiveChannel] = useState<"all" | "speed" | "throttle-brake" | "gear-rpm">("all");

  const stats = useMemo(() => computeTelemetryStats(data), [data]);

  // Gear distribution histogram
  const gearDistribution = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    for (const pt of data) {
      if (counts[pt.gear] !== undefined) counts[pt.gear]++;
    }
    const total = data.length || 1;
    return Object.entries(counts).map(([g, cnt]) => ({
      gear: `G${g}`,
      pct: Number(((cnt / total) * 100).toFixed(1)),
    }));
  }, [data]);

  const hasCompare = !!driverBName;

  // Formatting tooltips
  const formatDistanceTick = (val: number) => `${val}m`;

  return (
    <div className="telemetry-section-container">
      {/* Telemetry Control Bar: Lap selector & Chart filter toggles */}
      <div className="telemetry-controls-bar">
        <div className="lap-selector-group">
          <label htmlFor="telemetry-lap-picker" className="control-label">
            Selected Lap:
          </label>
          <select
            id="telemetry-lap-picker"
            className="lap-picker-select"
            value={currentLapNumber}
            onChange={(e) => onSelectLap(Number(e.target.value))}
          >
            {lapsList.map((l) => (
              <option key={l.lapNumber} value={l.lapNumber}>
                Lap {l.lapNumber} {l.lapDurationDisplay ? `(${l.lapDurationDisplay})` : ""} {l.isFastest ? "🟣 FASTEST" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Channel Filters */}
        <div className="channel-filter-pills" role="tablist">
          <button
            type="button"
            className={`pill-btn${activeChannel === "all" ? " active" : ""}`}
            onClick={() => setActiveChannel("all")}
          >
            All Channels
          </button>
          <button
            type="button"
            className={`pill-btn${activeChannel === "speed" ? " active" : ""}`}
            onClick={() => setActiveChannel("speed")}
          >
            Speed Only
          </button>
          <button
            type="button"
            className={`pill-btn${activeChannel === "throttle-brake" ? " active" : ""}`}
            onClick={() => setActiveChannel("throttle-brake")}
          >
            Pedals (Throttle &amp; Brake)
          </button>
          <button
            type="button"
            className={`pill-btn${activeChannel === "gear-rpm" ? " active" : ""}`}
            onClick={() => setActiveChannel("gear-rpm")}
          >
            Gears &amp; RPM
          </button>
        </div>

        {/* Legend Indicator */}
        <div className="telemetry-legend-indicators">
          <div className="legend-chip">
            <span className="dot" style={{ background: driverAColour }} />
            <span>{driverAName}</span>
          </div>
          {hasCompare && (
            <div className="legend-chip">
              <span className="dot" style={{ background: driverBColour }} />
              <span>{driverBName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Synchronized Metrics Header Cards */}
      <div className="telemetry-stats-row">
        <div className="tstat-card">
          <div className="tstat-header">
            <span className="tstat-icon">⚡</span>
            <span className="tstat-label">Maximum Speed</span>
          </div>
          <div className="tstat-value">{stats.maxSpeed} <span className="unit">km/h</span></div>
          <div className="tstat-sub">Average: {stats.avgSpeed} km/h</div>
        </div>

        <div className="tstat-card">
          <div className="tstat-header">
            <span className="tstat-icon">🎯</span>
            <span className="tstat-label">Speed Trap (ST)</span>
          </div>
          <div className="tstat-value">{stats.speedTrap} <span className="unit">km/h</span></div>
          <div className="tstat-sub">Reta Oposta straight beam</div>
        </div>

        <div className="tstat-card">
          <div className="tstat-header">
            <span className="tstat-icon">🏎️</span>
            <span className="tstat-label">Full Throttle %</span>
          </div>
          <div className="tstat-value">{stats.fullThrottlePct}%</div>
          <div className="tstat-sub">{stats.timeAcceleratingSec}s spent on power</div>
        </div>

        <div className="tstat-card">
          <div className="tstat-header">
            <span className="tstat-icon">🛑</span>
            <span className="tstat-label">Braking Zones</span>
          </div>
          <div className="tstat-value">{stats.brakeEventsCount} <span className="unit">events</span></div>
          <div className="tstat-sub">{stats.totalBrakingSec}s total duration (~{stats.avgDeceleration}G max)</div>
        </div>
      </div>

      {/* 1. SPEED VS DISTANCE CHART */}
      {(activeChannel === "all" || activeChannel === "speed") && (
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title">
              <span className="chart-badge">SPEED</span>
              <span>Speed vs Distance (km/h)</span>
            </div>
            <div className="chart-meta">
              <span>Track: {circuitLengthM}m</span>
              <span>•</span>
              <span>Max: {stats.maxSpeed} km/h</span>
              <span>•</span>
              <span>Min Apex: {stats.minSpeed} km/h</span>
            </div>
          </div>

          <div className="chart-body">
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={data} syncId="f1-telemetry" margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="distance" tickFormatter={formatDistanceTick} stroke="var(--muted)" fontSize={11} />
                <YAxis domain={[50, 350]} stroke="var(--muted)" fontSize={11} unit=" km/h" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const pt = payload[0].payload as TelemetryDataPoint;
                    return (
                      <div className="f1-chart-tooltip">
                        <div className="tt-dist">Track Pos: {pt.distance}m</div>
                        <div className="tt-item" style={{ color: driverAColour }}>
                          <span>{driverAName}:</span> <strong>{pt.speed} km/h</strong>
                        </div>
                        {hasCompare && pt.compareSpeed !== undefined && (
                          <div className="tt-item" style={{ color: driverBColour }}>
                            <span>{driverBName}:</span> <strong>{pt.compareSpeed} km/h</strong>
                          </div>
                        )}
                        {hasCompare && pt.compareSpeed !== undefined && (
                          <div className="tt-delta">
                            Delta: {pt.speed >= pt.compareSpeed ? `+${pt.speed - pt.compareSpeed}` : pt.speed - pt.compareSpeed} km/h
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="speed"
                  name={driverAName}
                  stroke={driverAColour}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#ffffff", stroke: driverAColour }}
                />
                {hasCompare && (
                  <Line
                    type="monotone"
                    dataKey="compareSpeed"
                    name={driverBName}
                    stroke={driverBColour}
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    dot={false}
                    activeDot={{ r: 4, fill: "#ffffff", stroke: driverBColour }}
                  />
                )}
                {/* Speed Trap callout marker */}
                <ReferenceLine x={1550} stroke="#ffcc00" strokeDasharray="3 3" label={{ value: "ST", fill: "#ffcc00", fontSize: 10 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 2. THROTTLE & BRAKE APPLICATION VS DISTANCE */}
      {(activeChannel === "all" || activeChannel === "throttle-brake") && (
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title">
              <span className="chart-badge throttle">PEDALS</span>
              <span>Throttle &amp; Brake Application (%)</span>
            </div>
            <div className="chart-meta">
              <span style={{ color: "#30d158" }}>🟢 Throttle</span>
              <span>•</span>
              <span style={{ color: "#ff453a" }}>🔴 Brake</span>
            </div>
          </div>

          <div className="chart-body">
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={data} syncId="f1-telemetry" margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="throttleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#30d158" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#30d158" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="brakeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff453a" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#ff453a" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="distance" tickFormatter={formatDistanceTick} stroke="var(--muted)" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="var(--muted)" fontSize={11} unit="%" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const pt = payload[0].payload as TelemetryDataPoint;
                    return (
                      <div className="f1-chart-tooltip">
                        <div className="tt-dist">Track Pos: {pt.distance}m</div>
                        <div className="tt-item" style={{ color: "#30d158" }}>
                          <span>Throttle:</span> <strong>{pt.throttle}%</strong>
                        </div>
                        <div className="tt-item" style={{ color: "#ff453a" }}>
                          <span>Brake:</span> <strong>{pt.brake > 0 ? `${pt.brake}%` : "OFF"}</strong>
                        </div>
                        {hasCompare && pt.compareThrottle !== undefined && (
                          <div className="tt-sub">
                            {driverBName} Throttle: {pt.compareThrottle}% | Brake: {pt.compareBrake ? `${pt.compareBrake}%` : "OFF"}
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="throttle" name="Throttle" stroke="#30d158" strokeWidth={2} fillOpacity={1} fill="url(#throttleGrad)" dot={false} />
                <Area type="monotone" dataKey="brake" name="Brake" stroke="#ff453a" strokeWidth={2} fillOpacity={1} fill="url(#brakeGrad)" dot={false} />
                {hasCompare && (
                  <Line type="monotone" dataKey="compareThrottle" name={`${driverBName} Throttle`} stroke={driverBColour} strokeWidth={1.5} strokeDasharray="3 2" dot={false} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 3. GEAR & RPM PROFILE */}
      {(activeChannel === "all" || activeChannel === "gear-rpm") && (
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title">
              <span className="chart-badge gear">POWERTRAIN</span>
              <span>Gear Selection (1-8) &amp; Engine RPM</span>
            </div>
            <div className="chart-meta">
              <span>Shift Events: {stats.gearChangesCount}</span>
              <span>•</span>
              <span>Rev Limit: 12,500 RPM</span>
            </div>
          </div>

          <div className="chart-body">
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={data} syncId="f1-telemetry" margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="distance" tickFormatter={formatDistanceTick} stroke="var(--muted)" fontSize={11} />
                <YAxis yAxisId="gearAxis" domain={[1, 8]} stroke="#c084fc" fontSize={11} unit=" G" tickCount={8} />
                <YAxis yAxisId="rpmAxis" orientation="right" domain={[7000, 13000]} stroke="#f59e0b" fontSize={11} unit=" rpm" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const pt = payload[0].payload as TelemetryDataPoint;
                    return (
                      <div className="f1-chart-tooltip">
                        <div className="tt-dist">Track Pos: {pt.distance}m</div>
                        <div className="tt-item" style={{ color: "#c084fc" }}>
                          <span>Gear:</span> <strong>G{pt.gear}</strong>
                        </div>
                        <div className="tt-item" style={{ color: "#f59e0b" }}>
                          <span>RPM:</span> <strong>{pt.rpm} RPM</strong>
                        </div>
                        {pt.drs && <div className="tt-badge drs">DRS OPEN</div>}
                      </div>
                    );
                  }}
                />
                <Line yAxisId="gearAxis" type="stepAfter" dataKey="gear" name="Gear" stroke="#c084fc" strokeWidth={2.5} dot={false} />
                <Line yAxisId="rpmAxis" type="monotone" dataKey="rpm" name="RPM" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeOpacity={0.8} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gear Distribution Strip */}
          <div className="gear-distribution-strip">
            <span className="strip-title">Gear Usage:</span>
            {gearDistribution.map((g) => (
              <div key={g.gear} className="gear-dist-item">
                <span className="g-lbl">{g.gear}</span>
                <span className="g-val">{g.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
