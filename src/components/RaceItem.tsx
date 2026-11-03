import React, { useState } from "react";
import type { ScheduleRace } from "../types";

interface RaceItemProps {
  race: ScheduleRace;
  isNext: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onOpenResults: (round: number) => void;
}

export const RaceItem: React.FC<RaceItemProps> = ({
  race,
  isNext,
  isOpen,
  onToggle,
  onOpenResults,
}) => {
  const [flagFailed, setFlagFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const statusClass = isNext ? "next" : race.isCompleted ? "completed" : "upcoming";
  const statusLabel = isNext ? "Next Race" : race.isCompleted ? "Completed" : "Upcoming";

  const handleRowClick = () => {
    if (race.isCompleted) {
      onOpenResults(race.round);
    } else {
      onToggle();
    }
  };

  return (
    <article
      className={`race-item${isNext ? " is-next" : ""}${race.isCompleted ? " is-completed" : ""}`}
      aria-expanded={isOpen}
    >
      <div
        className="race-summary"
        onClick={handleRowClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleRowClick();
          }
        }}
        aria-label={`Round ${race.round}: ${race.name}, ${race.isCompleted ? "click to view race results" : "click to toggle sessions"}`}
      >
        <div className="race-round-badge">
          R{String(race.round).padStart(2, "0")}
        </div>

        <div className="race-flag">
          {!flagFailed && race.circuit.flagUrl ? (
            <img
              src={race.circuit.flagUrl}
              alt={race.circuit.country}
              className="race-flag-img"
              onError={() => setFlagFailed(true)}
            />
          ) : (
            <span>{race.circuit.flag}</span>
          )}
        </div>

        <div className="race-info">
          <div className="race-title-line">
            <h3 className="race-title">{race.name}</h3>
            <span className={`status-pill ${statusClass}`}>{statusLabel}</span>
          </div>
          <div className="race-subvenue">
            {race.circuit.name} · {race.circuit.city}, {race.circuit.country}
          </div>
        </div>

        <div className="race-times-dual">
          <div className="race-time-block">
            <span className="race-time-lbl">Local Time</span>
            <span className="race-time-val local">{race.raceTimes.localDisplay}</span>
          </div>
          <div className="race-time-block">
            <span className="race-time-lbl">Track Time ({race.raceTimes.trackTzName})</span>
            <span className="race-time-val track">{race.raceTimes.trackDisplay}</span>
          </div>
        </div>

        {/* Action Button: Results for finished races, Sessions drawer for upcoming */}
        <div>
          {race.isCompleted ? (
            <button
              type="button"
              className="results-btn"
              onClick={(e) => {
                e.stopPropagation();
                onOpenResults(race.round);
              }}
              aria-label={`View Round ${race.round} Results`}
            >
              <span>Results</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              className={`drawer-btn${isOpen ? " open" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              aria-label={isOpen ? "Hide weekend sessions" : "Show weekend sessions"}
            >
              <span>Sessions</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Race Winner Row (if completed and winner recorded) */}
      {race.winner && (
        <div
          className="winner-row"
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            onOpenResults(race.round);
          }}
          title="Click to view full race results"
        >
          <span>🏆 Race Winner:</span>
          <span className="winner-pill">
            {!logoFailed && race.winner.logo ? (
              <img
                src={race.winner.logo}
                alt=""
                className="mini-team-logo"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: race.winner.colour,
                }}
              />
            )}
            <span>{race.winner.driver}</span>
            <span style={{ color: "var(--muted)", fontWeight: 500 }}>
              ({race.winner.team})
            </span>
          </span>
        </div>
      )}

      {/* Sessions Accordion Drawer - ONLY for upcoming races */}
      {!race.isCompleted && isOpen && race.sessions && race.sessions.length > 0 && (
        <div className="race-drawer">
          <div style={{ font: "700 12px var(--display)", textTransform: "uppercase", letterSpacing: ".08em", color: "var(--muted)", marginBottom: "4px" }}>
            Weekend Schedule · {race.diffText}
          </div>
          <div className="drawer-grid">
            {race.sessions.map((s, idx) => (
              <div key={idx} className={`sess-card${s.isMain ? " main" : ""}`}>
                <div className="sess-card-title">
                  {s.isMain && <span style={{ marginRight: "4px" }}>🔴</span>}
                  {s.name}
                </div>
                <div className="sess-card-time">
                  <div className="loc">🕒 {s.times.localDisplay}</div>
                  <div className="trk">🏁 {s.times.trackDisplay} ({s.times.trackTzName})</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
