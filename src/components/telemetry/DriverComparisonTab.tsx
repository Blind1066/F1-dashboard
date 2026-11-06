import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProcessedLapSummary, TelemetryDataPoint } from "../../types/telemetry";

interface DriverComparisonTabProps {
  telemetryData: TelemetryDataPoint[];
  driverAName: string;
  driverAColour: string;
  driverBName?: string;
  driverBColour?: string;
  driverBNumber?: number;
  driversList: Array<{ number: number; code: string; name: string; team: string }>;
  onSelectCompareDriver: (driverNumber: number) => void;
  lapsA: ProcessedLapSummary[];
  lapsB: ProcessedLapSummary[];
  selectedLapNumber: number;
}

export const DriverComparisonTab: React.FC<DriverComparisonTabProps> = ({
  telemetryData,
  driverAName,
  driverAColour,
  driverBName,
  driverBColour = "#64c4ff",
  driverBNumber,
  driversList,
  onSelectCompareDriver,
  lapsA,
  lapsB,
  selectedLapNumber,
}) => {
  // If no driver B is selected yet, prompt user with top contenders
  const lapA = lapsA.find((l) => l.lapNumber === selectedLapNumber) || lapsA[0];
  const lapB = lapsB.find((l) => l.lapNumber === selectedLapNumber) || lapsB[0];

  const hasCompare = !!driverBName && !!lapB;

  // Compute sector deltas
  const s1Delta = hasCompare && lapA?.s1 && lapB?.s1 ? Number((lapA.s1 - lapB.s1).toFixed(3)) : 0;
  const s2Delta = hasCompare && lapA?.s2 && lapB?.s2 ? Number((lapA.s2 - lapB.s2).toFixed(3)) : 0;
  const s3Delta = hasCompare && lapA?.s3 && lapB?.s3 ? Number((lapA.s3 - lapB.s3).toFixed(3)) : 0;
  const totalDelta = hasCompare && lapA?.lapDuration && lapB?.lapDuration ? Number((lapA.lapDuration - lapB.lapDuration).toFixed(3)) : 0;

  // Analysis insights
  const analysisInsights = useMemo(() => {
    if (!hasCompare) return [];
    const insights: string[] = [];

    if (s1Delta < 0) {
      insights.push(`🔴 Sector 1: ${driverAName} carries +${Math.abs(s1Delta)}s advantage through Senna S and early Reta Oposta acceleration.`);
    } else {
      insights.push(`🔴 Sector 1: ${driverBName} brakes later into Turn 1 Senna S, gaining ${Math.abs(s1Delta)}s on corner entry.`);
    }

    if (s2Delta < 0) {
      insights.push(`🔵 Sector 2: ${driverAName} demonstrates superior minimum apex speed through Ferradura and Bico de Pato (+${Math.abs(s2Delta)}s).`);
    } else {
      insights.push(`🔵 Sector 2: ${driverBName} maintains better mechanical rotation in the technical middle sector (+${Math.abs(s2Delta)}s).`);
    }

    if (s3Delta < 0) {
      insights.push(`🟡 Sector 3: ${driverAName} gets earlier throttle pick-up out of Junção (Turn 12) for higher top speed into Arquibancadas (+${Math.abs(s3Delta)}s).`);
    } else {
      insights.push(`🟡 Sector 3: ${driverBName} has stronger straight-line drag reduction efficiency approaching the Start/Finish line (+${Math.abs(s3Delta)}s).`);
    }

    return insights;
  }, [hasCompare, s1Delta, s2Delta, s3Delta, driverAName, driverBName]);

  return (
    <div className="driver-comparison-container">
      {/* Driver Selector Header */}
      <div className="comparison-picker-bar">
        <div className="compare-versus-text">
          <span className="driver-pill-badge" style={{ borderColor: driverAColour, color: driverAColour }}>
            {driverAName}
          </span>
          <span className="vs-badge">VS</span>
          {hasCompare ? (
            <span className="driver-pill-badge" style={{ borderColor: driverBColour, color: driverBColour }}>
              {driverBName}
            </span>
          ) : (
            <span className="select-prompt">Select a driver below to compare</span>
          )}
        </div>

        <div className="quick-driver-pills">
          <span className="pill-lbl">Contenders:</span>
          {driversList.slice(0, 6).map((d) => (
            <button
              key={d.number}
              type="button"
              className={`compare-driver-pill${driverBNumber === d.number ? " active" : ""}`}
              onClick={() => onSelectCompareDriver(d.number)}
            >
              #{d.number} {d.code}
            </button>
          ))}
        </div>
      </div>

      {!hasCompare ? (
        <div className="comparison-empty-state">
          <div className="empty-icon">🏎️ ⚡ 🏎️</div>
          <h3>Select a Rival Driver to Begin Head-to-Head Telemetry Overlay</h3>
          <p>
            Compare speed traces, throttle pick-up points, braking zones, gear shift patterns, and lap delta across distance.
          </p>
        </div>
      ) : (
        <>
          {/* Head-to-Head Delta Cards */}
          <div className="comparison-metrics-grid">
            <div className={`comp-card ${totalDelta < 0 ? "gain" : "loss"}`}>
              <div className="comp-lbl">Lap Time Delta (Lap {selectedLapNumber})</div>
              <div className="comp-val">
                {totalDelta < 0 ? `${totalDelta}s` : `+${totalDelta}s`}
              </div>
              <div className="comp-sub">
                {totalDelta < 0 ? `${driverAName} is faster` : `${driverBName} is faster`}
              </div>
            </div>

            <div className={`comp-card ${s1Delta < 0 ? "gain" : "loss"}`}>
              <div className="comp-lbl">Sector 1 Delta</div>
              <div className="comp-val">
                {s1Delta < 0 ? `${s1Delta}s` : `+${s1Delta}s`}
              </div>
              <div className="comp-sub">Senna S &amp; Reta Oposta</div>
            </div>

            <div className={`comp-card ${s2Delta < 0 ? "gain" : "loss"}`}>
              <div className="comp-lbl">Sector 2 Delta</div>
              <div className="comp-val">
                {s2Delta < 0 ? `${s2Delta}s` : `+${s2Delta}s`}
              </div>
              <div className="comp-sub">Technical Infield Loop</div>
            </div>

            <div className={`comp-card ${s3Delta < 0 ? "gain" : "loss"}`}>
              <div className="comp-lbl">Sector 3 Delta</div>
              <div className="comp-val">
                {s3Delta < 0 ? `${s3Delta}s` : `+${s3Delta}s`}
              </div>
              <div className="comp-sub">Junção &amp; Main Straight</div>
            </div>
          </div>

          {/* Motorsport Telemetry Insights Box */}
          <div className="analyst-insights-card">
            <div className="analyst-header">
              <span className="analyst-icon">🏁</span>
              <span className="analyst-title">Motorsport Telemetry Performance Summary</span>
              <span className="analyst-badge">FIA DELTA ANALYSIS</span>
            </div>
            <ul className="analyst-bullets">
              {analysisInsights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>

          {/* 1. OVERLAID SPEED TRACES */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-title">
                <span className="chart-badge">SPEED OVERLAY</span>
                <span>Speed vs Distance Overlay (km/h)</span>
              </div>
              <div className="chart-meta">
                <span style={{ color: driverAColour }}>— {driverAName}</span>
                <span>•</span>
                <span style={{ color: driverBColour }}>--- {driverBName}</span>
              </div>
            </div>

            <div className="chart-body">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={telemetryData} syncId="f1-telemetry" margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="distance" stroke="var(--muted)" fontSize={11} unit="m" />
                  <YAxis domain={[60, 350]} stroke="var(--muted)" fontSize={11} unit=" km/h" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const pt = payload[0].payload as TelemetryDataPoint;
                      const spdA = pt.speed;
                      const spdB = pt.compareSpeed ?? spdA;
                      const diff = spdA - spdB;
                      return (
                        <div className="f1-chart-tooltip">
                          <div className="tt-dist">Track Pos: {pt.distance}m</div>
                          <div className="tt-item" style={{ color: driverAColour }}>
                            <span>{driverAName}:</span> <strong>{spdA} km/h</strong>
                          </div>
                          <div className="tt-item" style={{ color: driverBColour }}>
                            <span>{driverBName}:</span> <strong>{spdB} km/h</strong>
                          </div>
                          <div className="tt-delta">
                            Speed Advantage: {diff >= 0 ? `+${diff}` : diff} km/h ({diff >= 0 ? driverAName : driverBName})
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Line type="monotone" dataKey="speed" name={driverAName} stroke={driverAColour} strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="compareSpeed" name={driverBName} stroke={driverBColour} strokeWidth={2} strokeDasharray="4 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. TIME DELTA ACCUMULATION CURVE */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-title">
                <span className="chart-badge delta">DELTA</span>
                <span>Time Delta Over Lap Distance (Seconds)</span>
              </div>
              <div className="chart-meta">
                <span style={{ color: "#30d158" }}>Negative = {driverAName} Ahead</span>
                <span>•</span>
                <span style={{ color: "#ff453a" }}>Positive = {driverBName} Ahead</span>
              </div>
            </div>

            <div className="chart-body">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={telemetryData} syncId="f1-telemetry" margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="distance" stroke="var(--muted)" fontSize={11} unit="m" />
                  <YAxis domain={[-0.8, 0.8]} stroke="var(--muted)" fontSize={11} unit="s" />
                  <Tooltip />
                  <Area type="monotone" dataKey="delta" name="Delta Time" stroke="#c084fc" fill="rgba(192, 132, 252, 0.15)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. THROTTLE & BRAKE OVERLAP */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-title">
                <span className="chart-badge throttle">PEDAL COMPARISON</span>
                <span>Throttle &amp; Braking Application Overlap</span>
              </div>
              <div className="chart-meta">
                <span>Direct driver input comparison</span>
              </div>
            </div>

            <div className="chart-body">
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={telemetryData} syncId="f1-telemetry" margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="distance" stroke="var(--muted)" fontSize={11} unit="m" />
                  <YAxis domain={[0, 100]} stroke="var(--muted)" fontSize={11} unit="%" />
                  <Tooltip />
                  <Line type="monotone" dataKey="throttle" name={`${driverAName} Throttle`} stroke={driverAColour} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="compareThrottle" name={`${driverBName} Throttle`} stroke={driverBColour} strokeWidth={1.8} strokeDasharray="3 2" dot={false} />
                  <Line type="monotone" dataKey="brake" name={`${driverAName} Brake`} stroke="#ff453a" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="compareBrake" name={`${driverBName} Brake`} stroke="#ff9f0a" strokeWidth={1.5} strokeDasharray="3 2" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
