import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { ScheduleRace } from "../types";
import { getCircuitData } from "../data/circuits";
import { TrackBlueprint } from "./TrackBlueprint";

interface NextRacesTilesProps {
  races: ScheduleRace[];
  onOpenDetails?: (round: number) => void;
}

function getDaysUntil(date: Date): string {
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return "Racing now";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 1) return "In 1 day";
  return `In ${days} days`;
}

export const NextRacesTiles: React.FC<NextRacesTilesProps> = ({
  races,
  onOpenDetails,
}) => {
  const [expandedRound, setExpandedRound] = useState<number | null>(null);

  if (!races || races.length === 0) {
    return null;
  }

  const toggleExpand = (round: number) => {
    setExpandedRound((prev) => (prev === round ? null : round));
  };

  return (
    <section className="next-races-section" aria-label="Next 3 Championship Races">
      {/* Section Title Bar */}
      <div className="section-title-bar">
        <div>
          <div className="section-eyebrow">
            <span className="racing-stripe" />
            <span>Championship Horizon</span>
          </div>
          <h2 className="section-heading">NEXT 3 RACES</h2>
        </div>
        <Link to="/schedule" className="view-all-link">
          <span>View 2026 Season Schedule</span>
          <span>→</span>
        </Link>
      </div>

      {/* 3 Big Tiles Grid */}
      <div className="big-tiles-grid">
        {races.map((race, index) => {
          const circuit = getCircuitData(
            race.circuit.id,
            race.circuit.name,
            race.circuit.country,
            race.circuit.city
          );
          const isExpanded = expandedRound === race.round;
          const daysText = getDaysUntil(race.raceTimes.date);

          return (
            <article key={race.round} className="big-race-tile">
              {/* Top Banner: Round badge & Flag & Date */}
              <div className="tile-top-bar">
                <div className="tile-round-chip">
                  <span className="tile-order-num">#{index + 1}</span>
                  <span>ROUND {race.round}</span>
                </div>

                <div className="tile-flag-row">
                  {race.circuit.flagUrl ? (
                    <img
                      src={race.circuit.flagUrl}
                      alt={race.circuit.country}
                      className="race-flag-img-sm"
                    />
                  ) : (
                    <span>{race.circuit.flag}</span>
                  )}
                  <span className="tile-country">{race.circuit.country}</span>
                </div>
              </div>

              {/* Race Title & Circuit */}
              <div className="tile-header">
                <h3 className="tile-title">{race.name}</h3>
                <div className="tile-venue">
                  <span>📍</span>
                  <span className="tile-venue-name">{race.circuit.name}</span>
                </div>
                <div className="tile-city">{race.circuit.city}, {race.circuit.country}</div>
              </div>

              {/* Circuit SVG Silhouette */}
              <div className="tile-track-preview">
                <TrackBlueprint circuit={circuit} compact />
              </div>

              {/* Telemetry Stats Strip */}
              <div className="tile-stats-strip">
                <div className="tile-stat">
                  <span className="stat-label">Length</span>
                  <span className="stat-val">{circuit.lengthKm} km</span>
                </div>
                <div className="tile-stat-sep" />
                <div className="tile-stat">
                  <span className="stat-label">Laps</span>
                  <span className="stat-val">{circuit.laps}</span>
                </div>
                <div className="tile-stat-sep" />
                <div className="tile-stat">
                  <span className="stat-label">Turns</span>
                  <span className="stat-val">{circuit.turns}</span>
                </div>
              </div>

              {/* Date & Countdown Footer */}
              <div className="tile-footer">
                <div className="tile-timing-info">
                  <div className="tile-date-label">Race Day (Your Time)</div>
                  <div className="tile-date-val">
                    {race.raceTimes.localDate} • {race.raceTimes.localTime}
                  </div>
                </div>
                <div className="tile-countdown-pill">{daysText}</div>
              </div>

              {/* Action Buttons */}
              <div className="tile-action-row">
                <button
                  type="button"
                  className={`tile-btn sessions-btn${isExpanded ? " active" : ""}`}
                  onClick={() => toggleExpand(race.round)}
                  aria-expanded={isExpanded}
                >
                  <span>{isExpanded ? "Hide Sessions" : "Weekend Sessions"}</span>
                  <span>{isExpanded ? "▲" : "▼"}</span>
                </button>
                {onOpenDetails && (
                  <button
                    type="button"
                    className="tile-btn full-btn"
                    onClick={() => onOpenDetails(race.round)}
                    title="View details in schedule"
                  >
                    <span>Details ↗</span>
                  </button>
                )}
              </div>

              {/* Expanded Sessions Drawer inside the Big Tile */}
              {isExpanded && (
                <div className="tile-expanded-sessions">
                  <div className="tile-sess-head">
                    <span>Session</span>
                    <span>Local Time</span>
                  </div>
                  {race.sessions?.map((sess, sIdx) => (
                    <div
                      key={sIdx}
                      className={`tile-sess-item${sess.isMain ? " main" : ""}`}
                    >
                      <span className="sess-title">
                        {sess.isMain && <span>🔴 </span>}
                        {sess.name}
                      </span>
                      <span className="sess-time">{sess.times.localDisplay}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};
