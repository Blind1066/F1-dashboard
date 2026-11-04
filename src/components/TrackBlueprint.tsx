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
  const [showOfficialMap, setShowOfficialMap] = useState(false);
  const sf = circuit.startFinish || { x: 250, y: 310 };

  if (compact) {
    return (
      <div className="track-mini-svg-wrap">
        <svg
          viewBox={circuit.viewBox || "0 0 500 360"}
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
          {/* Active Accent Trace */}
          <path
            d={circuit.svgPath}
            fill="none"
            stroke={accentColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
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
          <span>Circuit Blueprint • {circuit.type}</span>
        </div>
        <div className="track-metrics-summary">
          {circuit.id === "interlagos" && (
            <button
              type="button"
              className="track-view-toggle-pill"
              onClick={() => setShowOfficialMap((prev) => !prev)}
              title="Toggle between Neon Blueprint and Official FIA Track Map"
            >
              {showOfficialMap ? "📐 Blueprint View" : "🗺️ Official FIA Map"}
            </button>
          )}
          <span>{circuit.turns} Turns</span>
          <span>•</span>
          <span>{circuit.drsZones} DRS Zones</span>
        </div>
      </div>

      <div className="track-svg-canvas">
        <svg
          viewBox={circuit.viewBox || "0 0 500 360"}
          className="track-hero-svg"
          aria-label={`Track map of ${circuit.name}`}
        >
          {showOfficialMap && circuit.id === "interlagos" ? (
            <image
              href="/assets/circuits/brazil_circuit.png"
              x="0"
              y="0"
              width="500"
              height="360"
              preserveAspectRatio="xMidYMid meet"
            />
          ) : (
            <>
              <defs>
                <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="60%" stopColor="#ff453a" />
                  <stop offset="100%" stopColor="#27f4d2" />
                </linearGradient>
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid lines background decoration */}
              <g className="track-grid-pattern" opacity="0.12">
                <line x1="50" y1="0" x2="50" y2="360" stroke="currentColor" strokeDasharray="3 3" />
                <line x1="150" y1="0" x2="150" y2="360" stroke="currentColor" strokeDasharray="3 3" />
                <line x1="250" y1="0" x2="250" y2="360" stroke="currentColor" strokeDasharray="3 3" />
                <line x1="350" y1="0" x2="350" y2="360" stroke="currentColor" strokeDasharray="3 3" />
                <line x1="450" y1="0" x2="450" y2="360" stroke="currentColor" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="currentColor" strokeDasharray="3 3" />
                <line x1="0" y1="180" x2="500" y2="180" stroke="currentColor" strokeDasharray="3 3" />
                <line x1="0" y1="270" x2="500" y2="270" stroke="currentColor" strokeDasharray="3 3" />
              </g>

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
                stroke="var(--surface)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Racing Line (Neon with subtle pulse glow) */}
              <path
                d={circuit.svgPath}
                fill="none"
                stroke="url(#trackGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#neonGlow)"
              />

              {/* Start / Finish Line Banner */}
              <g transform={`translate(${sf.x - 12}, ${sf.y - 12})`}>
                <rect x="0" y="0" width="24" height="24" rx="4" fill="var(--surface-2)" stroke="var(--line)" />
                <text x="12" y="16" textAnchor="middle" fontSize="13">🏁</text>
              </g>
            </>
          )}
        </svg>

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

