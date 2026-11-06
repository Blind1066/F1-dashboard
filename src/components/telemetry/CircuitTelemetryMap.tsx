import React, { useMemo, useState } from "react";
import { CIRCUITS_DATA } from "../../data/circuits";
import type { TelemetryDataPoint } from "../../types/telemetry";

interface CircuitTelemetryMapProps {
  circuitId?: string;
  telemetryData: TelemetryDataPoint[];
  driverAName: string;
  driverAColour: string;
  driverBName?: string;
  driverBColour?: string;
}

export const CircuitTelemetryMap: React.FC<CircuitTelemetryMapProps> = ({
  circuitId = "interlagos",
  telemetryData,
  driverAName,
  driverAColour,
  driverBName,
  driverBColour = "#64c4ff",
}) => {
  const [scrubberIndex, setScrubberIndex] = useState(0);
  const [mapMode, setMapMode] = useState<"speed" | "braking" | "sectors">("speed");

  const circuit = CIRCUITS_DATA[circuitId] || CIRCUITS_DATA.interlagos;
  const viewBox = circuit.viewBox || "-10 -10 520 350";

  // Current car telemetry from scrubber
  const currentPt = telemetryData[scrubberIndex] || telemetryData[0] || {
    distance: 0,
    speed: 310,
    throttle: 100,
    brake: 0,
    gear: 8,
    rpm: 11400,
  };

  // Interpolate car coordinate along SVG path using fraction of distance
  const totalLength = telemetryData[telemetryData.length - 1]?.distance || 4309;
  const progressFraction = (currentPt.distance / (totalLength || 1));

  // Map fraction to turn / circuit coordinates
  // We can compute position along the circuit path
  const carCoords = useMemo(() => {
    // Interlagos key coordinate interpolation points
    const anchorPoints = [
      { x: 213, y: 42 },   // S/F
      { x: 79, y: 78 },    // T1 Senna S
      { x: 64, y: 134 },   // T3 Curva do Sol
      { x: 282, y: 278 },  // T4 Descida do Lago
      { x: 303, y: 175 },  // T6 Ferradura
      { x: 220, y: 96 },   // T8 Laranjinha
      { x: 295, y: 55 },   // T9 Pinheirinho
      { x: 330, y: 93 },   // T10 Bico de Pato
      { x: 378, y: 94 },   // T11 Mergulho
      { x: 375, y: 174 },  // T12 Junção
      { x: 385, y: 50 },   // T14 Arquibancadas
      { x: 213, y: 42 },   // Back to S/F
    ];

    const idxFloat = progressFraction * (anchorPoints.length - 1);
    const baseIdx = Math.floor(idxFloat);
    const rem = idxFloat - baseIdx;
    const p1 = anchorPoints[baseIdx];
    const p2 = anchorPoints[Math.min(anchorPoints.length - 1, baseIdx + 1)];

    return {
      x: Math.round(p1.x + (p2.x - p1.x) * rem),
      y: Math.round(p1.y + (p2.y - p1.y) * rem),
    };
  }, [progressFraction]);

  return (
    <div className="circuit-telemetry-container">
      {/* Map Control Bar: Heatmap mode toggle & Scrubber */}
      <div className="circuit-map-controls">
        <div className="map-mode-pills" role="tablist">
          <button
            type="button"
            className={`pill-btn${mapMode === "speed" ? " active" : ""}`}
            onClick={() => setMapMode("speed")}
          >
            🔥 Speed Heatmap
          </button>
          <button
            type="button"
            className={`pill-btn${mapMode === "braking" ? " active" : ""}`}
            onClick={() => setMapMode("braking")}
          >
            🛑 Braking Zones
          </button>
          <button
            type="button"
            className={`pill-btn${mapMode === "sectors" ? " active" : ""}`}
            onClick={() => setMapMode("sectors")}
          >
            🔴 Official Sectors
          </button>
        </div>

        {/* Live Scrubber Readout */}
        <div className="telemetry-scrubber-readout">
          <div className="scrub-metric">
            <span className="lbl">Speed</span>
            <span className="val">{currentPt.speed} km/h</span>
          </div>
          <div className="scrub-metric">
            <span className="lbl">Throttle</span>
            <span className="val" style={{ color: "#30d158" }}>{currentPt.throttle}%</span>
          </div>
          <div className="scrub-metric">
            <span className="lbl">Brake</span>
            <span className="val" style={{ color: currentPt.brake > 0 ? "#ff453a" : "var(--muted)" }}>
              {currentPt.brake > 0 ? `${currentPt.brake}%` : "OFF"}
            </span>
          </div>
          <div className="scrub-metric">
            <span className="lbl">Gear</span>
            <span className="val" style={{ color: "#c084fc" }}>G{currentPt.gear}</span>
          </div>
          <div className="scrub-metric">
            <span className="lbl">RPM</span>
            <span className="val">{currentPt.rpm}</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas with Real Track & Telemetry Overlays */}
      <div className="circuit-canvas-box">
        <svg viewBox={viewBox} className="circuit-telemetry-svg" aria-label="Circuit Telemetry Map">
          <defs>
            <linearGradient id="speedHeatmapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff453a" />
              <stop offset="25%" stopColor="#ffd60a" />
              <stop offset="50%" stopColor="#30d158" />
              <stop offset="75%" stopColor="#007aff" />
              <stop offset="100%" stopColor="#ff453a" />
            </linearGradient>

            <filter id="carGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines background */}
          <g className="track-grid-pattern" opacity="0.08">
            <line x1="50" y1="-10" x2="50" y2="340" stroke="currentColor" strokeDasharray="3 3" />
            <line x1="150" y1="-10" x2="150" y2="340" stroke="currentColor" strokeDasharray="3 3" />
            <line x1="250" y1="-10" x2="250" y2="340" stroke="currentColor" strokeDasharray="3 3" />
            <line x1="350" y1="-10" x2="350" y2="340" stroke="currentColor" strokeDasharray="3 3" />
            <line x1="450" y1="-10" x2="450" y2="340" stroke="currentColor" strokeDasharray="3 3" />
            <line x1="-10" y1="80" x2="510" y2="80" stroke="currentColor" strokeDasharray="3 3" />
            <line x1="-10" y1="160" x2="510" y2="160" stroke="currentColor" strokeDasharray="3 3" />
            <line x1="-10" y1="240" x2="510" y2="240" stroke="currentColor" strokeDasharray="3 3" />
          </g>

          {/* Base Asphalt Track Surface */}
          <path
            d={circuit.svgPath}
            fill="none"
            stroke="var(--surface-2)"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={circuit.svgPath}
            fill="none"
            stroke="var(--line)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={circuit.svgPath}
            fill="none"
            stroke="#121318"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* MODE 1: SPEED HEATMAP */}
          {mapMode === "speed" && (
            <path
              d={circuit.svgPath}
              fill="none"
              stroke="url(#speedHeatmapGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          )}

          {/* MODE 2: BRAKING ZONES */}
          {mapMode === "braking" && (
            <>
              <path
                d={circuit.svgPath}
                fill="none"
                stroke="#30d158"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
              />
              {/* Heavy braking zone callouts on track */}
              <circle cx={79} cy={78} r={16} fill="rgba(255, 69, 58, 0.4)" stroke="#ff453a" strokeWidth={2} />
              <text x={79} y={82} textAnchor="middle" fill="#ffffff" fontSize={8} fontWeight={700}>-215</text>

              <circle cx={282} cy={278} r={16} fill="rgba(255, 69, 58, 0.4)" stroke="#ff453a" strokeWidth={2} />
              <text x={282} y={282} textAnchor="middle" fill="#ffffff" fontSize={8} fontWeight={700}>-195</text>

              <circle cx={330} cy={93} r={14} fill="rgba(255, 69, 58, 0.4)" stroke="#ff453a" strokeWidth={2} />
              <text x={330} y={97} textAnchor="middle" fill="#ffffff" fontSize={8} fontWeight={700}>-90</text>
            </>
          )}

          {/* MODE 3: OFFICIAL SECTORS */}
          {mapMode === "sectors" && circuit.sector1Path && circuit.sector2Path && circuit.sector3Path && (
            <g>
              <path d={circuit.sector1Path} fill="none" stroke="#ff3b30" strokeWidth="5" strokeLinecap="round" />
              <path d={circuit.sector2Path} fill="none" stroke="#0080ff" strokeWidth="5" strokeLinecap="round" />
              <path d={circuit.sector3Path} fill="none" stroke="#ffcc00" strokeWidth="5" strokeLinecap="round" />
            </g>
          )}

          {/* Turn Number Pins */}
          {circuit.turnsList?.map((t) => (
            <g key={t.num} transform={`translate(${t.x}, ${t.y})`} className="turn-label-pin">
              <circle cx="0" cy="0" r="7" fill="var(--surface)" stroke="var(--line)" strokeWidth="1" />
              <text x="0" y="2.8" textAnchor="middle" fill="var(--text)" fontSize="7" fontWeight="700">
                {t.num}
              </text>
            </g>
          ))}

          {/* Live Animated Driver Car Blip */}
          <g transform={`translate(${carCoords.x}, ${carCoords.y})`} filter="url(#carGlow)">
            <circle cx="0" cy="0" r="10" fill={driverAColour} stroke="#ffffff" strokeWidth={2.5} />
            <circle cx="0" cy="0" r="18" fill="none" stroke={driverAColour} strokeWidth={1.5} opacity="0.6">
              <animate attributeName="r" values="10;22;10" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">
              {driverAName.slice(0, 3).toUpperCase()}
            </text>
          </g>

          {/* Start / Finish line flag */}
          <g transform="translate(201, 30)">
            <rect x="0" y="0" width="24" height="24" rx="4" fill="var(--surface-2)" stroke="var(--line)" />
            <text x="12" y="16" textAnchor="middle" fontSize="13">🏁</text>
          </g>
        </svg>

        {/* Legend */}
        <div className="circuit-map-legend">
          {driverBName && (
            <div className="braking-legend" style={{ marginRight: "1rem" }}>
              <span className="badge" style={{ color: driverAColour, borderColor: driverAColour }}>
                ● {driverAName}
              </span>
              <span className="badge" style={{ color: driverBColour, borderColor: driverBColour }}>
                ● {driverBName}
              </span>
            </div>
          )}
          {mapMode === "speed" && (
            <div className="speed-heatmap-bar">
              <span className="hl-label">70 km/h (Apex)</span>
              <div className="gradient-bar" />
              <span className="hl-label">335 km/h (Straight)</span>
            </div>
          )}
          {mapMode === "braking" && (
            <div className="braking-legend">
              <span className="badge red">🔴 Heavy Braking (&gt;4G)</span>
              <span className="badge green">🟢 Full Throttle Tractions</span>
            </div>
          )}
          {mapMode === "sectors" && (
            <div className="braking-legend">
              <span className="badge red">🔴 Sector 1</span>
              <span className="badge blue">🔵 Sector 2</span>
              <span className="badge yellow">🟡 Sector 3</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Lap Distance Scrubber */}
      <div className="lap-scrubber-control">
        <div className="scrubber-label-row">
          <span>Scrub Position Along Lap ({driverAName}{driverBName ? ` vs ${driverBName}` : ""}):</span>
          <strong>{currentPt.distance}m / {totalLength}m</strong>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(1, telemetryData.length - 1)}
          value={scrubberIndex}
          onChange={(e) => setScrubberIndex(Number(e.target.value))}
          className="telemetry-slider"
          aria-label="Lap Distance Scrubber"
        />
      </div>
    </div>
  );
};
