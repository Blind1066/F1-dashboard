import React, { useState } from "react";
import { type CircuitData } from "../data/circuits";

interface TrackBlueprintProps {
  circuit: CircuitData;
  compact?: boolean;
  accentColor?: string;
}

export const TrackBlueprint: React.FC<TrackBlueprintProps> = ({
  circuit,
  compact = false,
  accentColor = "var(--accent)",
}) => {
  // Default to sectors view for Interlagos (or circuits with sector paths), otherwise blueprint
  const [viewMode, setViewMode] = useState<"sectors" | "blueprint" | "map">(
    circuit.sector1Path ? "sectors" : "blueprint"
  );
  const sf = circuit.startFinish || { x: 250, y: 160 };
  const viewBox = circuit.viewBox || "0 0 500 320";

  if (compact) {
    return (
      <div className="track-mini-svg-wrap">
        <svg
          viewBox={viewBox}
          className="track-mini-svg"
          aria-hidden="true"
        >
          {/* Subtle Track Glow */}
          <path
            d={circuit.svgPath}
            fill="none"
            stroke="color-mix(in srgb, var(--accent) 25%, transparent)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Main Track Line */}
          <path
            d={circuit.svgPath}
            fill="none"
            stroke="var(--line)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {circuit.sector1Path && circuit.sector2Path && circuit.sector3Path ? (
            <>
              {/* Sector 1 (Red) */}
              <path
                d={circuit.sector1Path}
                fill="none"
                stroke="#ff3b30"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Sector 2 (Blue) */}
              <path
                d={circuit.sector2Path}
                fill="none"
                stroke="#0080ff"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Sector 3 (Yellow) */}
              <path
                d={circuit.sector3Path}
                fill="none"
                stroke="#ffcc00"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            /* Active Accent Trace */
            <path
              d={circuit.svgPath}
              fill="none"
              stroke={accentColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          )}

          {/* Start / Finish Indicator Dot */}
          <circle cx={sf.x} cy={sf.y} r="5" fill="#ffffff" stroke="var(--accent)" strokeWidth="2.5" />
        </svg>
      </div>
    );
  }

  return (
    <div className="track-blueprint-container" aria-label={`Circuit layout of ${circuit.name}`}>
      <div className="track-blueprint-header">
        <div className="track-tag">
          <span className="live-radar-dot" />
          <span>
            {viewMode === "sectors"
              ? "Official FIA Sectors • " + circuit.type
              : viewMode === "map"
              ? "Official Track Map • " + circuit.type
              : "Circuit Blueprint • " + circuit.type}
          </span>
        </div>
        <div className="track-metrics-summary">
          {circuit.id === "interlagos" && (
            <div className="track-view-modes-pill-group" role="group" aria-label="Track View Modes">
              <button
                type="button"
                className={`track-view-toggle-pill${viewMode === "sectors" ? " active" : ""}`}
                onClick={() => setViewMode("sectors")}
                title="View Real Brazil Circuit with Official FIA Sectors"
              >
                🔴 Sectors
              </button>
              <button
                type="button"
                className={`track-view-toggle-pill${viewMode === "blueprint" ? " active" : ""}`}
                onClick={() => setViewMode("blueprint")}
                title="View Neon Racing Line Blueprint"
              >
                📐 Blueprint
              </button>
              <button
                type="button"
                className={`track-view-toggle-pill${viewMode === "map" ? " active" : ""}`}
                onClick={() => setViewMode("map")}
                title="View Official FIA Track Map"
              >
                🗺️ Official Map
              </button>
            </div>
          )}
          <span>{circuit.turns} Turns</span>
          <span>•</span>
          <span>{circuit.drsZones} DRS Zones</span>
        </div>
      </div>

      <div className="track-svg-canvas">
        <svg
          viewBox={viewBox}
          className="track-hero-svg"
          aria-label={`Track map of ${circuit.name}`}
        >
          <defs>
            <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="60%" stopColor="#ff453a" />
              <stop offset="100%" stopColor="#27f4d2" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="sectorGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines background decoration */}
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

          {viewMode === "map" && circuit.id === "interlagos" ? (
            <image
              href="/assets/circuits/brazil_circuit.png"
              x="10"
              y="0"
              width="480"
              height="320"
              preserveAspectRatio="xMidYMid meet"
            />
          ) : (
            <>
              {/* Wide Track Surface Base */}
              <path
                d={circuit.svgPath}
                fill="none"
                stroke="var(--surface-2)"
                strokeWidth="24"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Outer Curb Borders */}
              <path
                d={circuit.svgPath}
                fill="none"
                stroke="var(--line)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Asphalt Track Surface */}
              <path
                d={circuit.svgPath}
                fill="none"
                stroke="#121318"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* View Mode: Official Sectors (matching user reference image) */}
              {viewMode === "sectors" && circuit.sector1Path && circuit.sector2Path && circuit.sector3Path ? (
                <g filter="url(#sectorGlow)">
                  {/* Sector 1: Red (Senna S to Reta Oposta) */}
                  <path
                    d={circuit.sector1Path}
                    fill="none"
                    stroke="#ff3b30"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Sector 2: Blue (Infield Loop) */}
                  <path
                    d={circuit.sector2Path}
                    fill="none"
                    stroke="#0080ff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Sector 3: Yellow (Junção to Main Straight) */}
                  <path
                    d={circuit.sector3Path}
                    fill="none"
                    stroke="#ffcc00"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              ) : (
                /* View Mode: Neon Racing Line Blueprint */
                <path
                  d={circuit.svgPath}
                  fill="none"
                  stroke="url(#trackGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#neonGlow)"
                />
              )}

              {/* Turn Number Badges (if available) */}
              {circuit.turnsList?.map((t) => (
                <g key={t.num} transform={`translate(${t.x}, ${t.y})`} className="turn-label-pin">
                  <circle cx="0" cy="0" r="7" fill="var(--surface)" stroke="var(--line)" strokeWidth="1" />
                  <text
                    x="0"
                    y="2.8"
                    textAnchor="middle"
                    fill="var(--text)"
                    fontSize="7"
                    fontWeight="700"
                    fontFamily="var(--display)"
                  >
                    {t.num}
                  </text>
                </g>
              ))}

              {/* Start / Finish Line Banner */}
              <g transform={`translate(${sf.x - 12}, ${sf.y - 12})`}>
                <rect x="0" y="0" width="24" height="24" rx="4" fill="var(--surface-2)" stroke="var(--line)" />
                <text x="12" y="16" textAnchor="middle" fontSize="13">🏁</text>
              </g>
            </>
          )}
        </svg>

        {/* Sector Legend Bar when in Sectors Mode */}
        {viewMode === "sectors" && circuit.sector1Path && (
          <div className="track-sectors-legend" aria-label="Official Sectors Legend">
            <div className="sector-leg-item s1">
              <span className="leg-color-bar red" />
              <span className="leg-name">SECTOR 1</span>
              <span className="leg-desc">Senna S • Curva do Sol</span>
            </div>
            <div className="sector-leg-item s2">
              <span className="leg-color-bar blue" />
              <span className="leg-name">SECTOR 2</span>
              <span className="leg-desc">Infield • Ferradura • Bico de Pato</span>
            </div>
            <div className="sector-leg-item s3">
              <span className="leg-color-bar yellow" />
              <span className="leg-name">SECTOR 3</span>
              <span className="leg-desc">Junção • Subida dos Boxes</span>
            </div>
          </div>
        )}

        {/* Floating telemetry watermarks */}
        <div className="track-compass">
          <span>N ⬆</span>
        </div>
      </div>

      {/* Track Telemetry Specifications Row */}
      <div className="track-specs-row">
        <div className="track-spec-item">
          <span className="spec-label">Circuit Length</span>
          <span className="spec-val">{circuit.lengthKm} <span className="spec-unit">km</span></span>
        </div>
        <div className="track-spec-item">
          <span className="spec-label">Number of Laps</span>
          <span className="spec-val">{circuit.laps} <span className="spec-unit">laps</span></span>
        </div>
        <div className="track-spec-item">
          <span className="spec-label">Race Distance</span>
          <span className="spec-val">{circuit.raceDistanceKm} <span className="spec-unit">km</span></span>
        </div>
        <div className="track-spec-item">
          <span className="spec-label">Lap Record</span>
          <span className="spec-val record">{circuit.lapRecord.time}</span>
          <span className="spec-sub">{circuit.lapRecord.driver} ({circuit.lapRecord.year})</span>
        </div>
      </div>
    </div>
  );
};
