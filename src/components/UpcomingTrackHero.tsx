import React, { useEffect, useState } from "react";
import type { ScheduleRace } from "../types";
import { getCircuitData } from "../data/circuits";
import { TrackBlueprint } from "./TrackBlueprint";

interface UpcomingTrackHeroProps {
  race: ScheduleRace | null;
  onOpenDetails?: (round: number) => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateCountdown(targetDate: Date): TimeRemaining {
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, isPast: false };
}

export const UpcomingTrackHero: React.FC<UpcomingTrackHeroProps> = ({
  race,
  onOpenDetails,
}) => {
  const [countdown, setCountdown] = useState<TimeRemaining>(() =>
    race
      ? calculateCountdown(race.raceTimes.date)
      : { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false }
  );
  const [activeTab, setActiveTab] = useState<"blueprint" | "sessions">("blueprint");
  const [flagFailed, setFlagFailed] = useState(false);

  useEffect(() => {
    if (!race) return;
    const update = () => {
      setCountdown(calculateCountdown(race.raceTimes.date));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [race]);

  if (!race) {
    return (
      <div className="upcoming-hero-card">
        <h2 className="upcoming-hero-title">Season Complete</h2>
        <p style={{ color: "var(--muted)" }}>
          All Grand Prix rounds for the current championship season have concluded.
        </p>
      </div>
    );
  }

  const { days, hours, minutes, seconds, isPast } = countdown;
  const circuitData = getCircuitData(
    race.circuit.id,
    race.circuit.name,
    race.circuit.country,
    race.circuit.city
  );

  return (
    <section className="upcoming-hero-card" aria-label="Upcoming Track Showcase">
      {/* Top Banner: Round Badge, Country Flag, Dates */}
      <div className="upcoming-top-bar">
        <div className="upcoming-pill">
          <span className="live-radar-dot" />
          <span>Upcoming Track • Round {race.round}</span>
        </div>

        <div className="upcoming-flag-group">
          {!flagFailed && race.circuit.flagUrl ? (
            <img
              src={race.circuit.flagUrl}
              alt={race.circuit.country}
              className="race-flag-img"
              onError={() => setFlagFailed(true)}
            />
          ) : (
            <span style={{ fontSize: "20px" }}>{race.circuit.flag}</span>
          )}
          <span className="upcoming-country-text">
            {race.circuit.city}, {race.circuit.country}
          </span>
        </div>
      </div>

      {/* Main Hero Header */}
      <div className="upcoming-header-main">
        <div>
          <h1 className="upcoming-hero-title">{race.name}</h1>
          <div className="upcoming-circuit-meta">
            <span className="circuit-name-icon">🏁</span>
            <span className="circuit-name-text">{race.circuit.name}</span>
            <span className="meta-sep">•</span>
            <span className="circuit-dates-text">
              {race.raceTimes.localDate} ({race.raceTimes.localTime})
            </span>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="upcoming-tab-buttons" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "blueprint"}
            className={`tab-btn${activeTab === "blueprint" ? " active" : ""}`}
            onClick={() => setActiveTab("blueprint")}
          >
            🗺️ Track Blueprint
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "sessions"}
            className={`tab-btn${activeTab === "sessions" ? " active" : ""}`}
            onClick={() => setActiveTab("sessions")}
          >
            ⏱️ Weekend Sessions ({race.sessions?.length || 0})
          </button>
        </div>
      </div>

      {/* 2-Column Content Grid */}
      <div className="upcoming-grid-layout">
        {/* Left Column: Countdown & Dual Times */}
        <div className="upcoming-left-col">
          {/* Digital Countdown Box */}
          <div className="countdown-box" aria-label="Countdown to lights out">
            <div className="countdown-tag">
              {isPast ? "Session Status" : "Live Countdown To Lights Out"}
            </div>
            {isPast ? (
              <div
                className="countdown-grid"
                style={{ color: "var(--accent)", fontWeight: 700 }}
              >
                🏁 Lights Out / Grand Prix Underway
              </div>
            ) : (
              <div
                className="countdown-grid"
                aria-label={`${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`}
              >
                <div className="cd-unit">
                  <span className="cd-val">{String(days).padStart(2, "0")}</span>
                  <span className="cd-lbl">Days</span>
                </div>
                <span className="cd-sep">:</span>
                <div className="cd-unit">
                  <span className="cd-val">{String(hours).padStart(2, "0")}</span>
                  <span className="cd-lbl">Hours</span>
                </div>
                <span className="cd-sep">:</span>
                <div className="cd-unit">
                  <span className="cd-val">{String(minutes).padStart(2, "0")}</span>
                  <span className="cd-lbl">Mins</span>
                </div>
                <span className="cd-sep">:</span>
                <div className="cd-unit">
                  <span className="cd-val">{String(seconds).padStart(2, "0")}</span>
                  <span className="cd-lbl">Secs</span>
                </div>
              </div>
            )}
          </div>

          {/* Dual Timing: Local vs Track */}
          <div className="timing-dual">
            <div className="timing-card local">
              <div className="timing-card-head">
                <span className="timing-tag local">🕒 Your Local Time</span>
                <span className="tz-pill">{race.raceTimes.localTzName}</span>
              </div>
              <div className="timing-time">{race.raceTimes.localTime}</div>
              <div className="timing-date">{race.raceTimes.localDate}</div>
            </div>

            <div className="timing-card track">
              <div className="timing-card-head">
                <span className="timing-tag track">🏁 Track Local Time</span>
                <span className="tz-pill">{race.raceTimes.trackTzName}</span>
              </div>
              <div className="timing-time">{race.raceTimes.trackTime}</div>
              <div className="timing-date">{race.raceTimes.trackDate}</div>
            </div>
          </div>

          {/* Track Offset */}
          {race.diffText && (
            <div className="time-diff-bar">
              <span>⏱️</span>
              <span>{race.diffText}</span>
            </div>
          )}

          {/* Action Button */}
          {onOpenDetails && (
            <button
              type="button"
              className="track-action-btn"
              onClick={() => onOpenDetails(race.round)}
            >
              <span>Explore Full Grand Prix Details</span>
              <span>→</span>
            </button>
          )}
        </div>

        {/* Right Column: Blueprint or Sessions Drawer */}
        <div className="upcoming-right-col">
          {activeTab === "blueprint" ? (
            <TrackBlueprint circuit={circuitData} />
          ) : (
            <div className="weekend-sessions" style={{ marginTop: 0 }}>
              <div className="weekend-head">Official Weekend Session Timings</div>
              <div className="sess-table">
                <div className="sess-row head">
                  <span>Session</span>
                  <span>Your Local Time</span>
                  <span>Track Local Time</span>
                </div>
                {race.sessions?.map((s, idx) => (
                  <div key={idx} className={`sess-row${s.isMain ? " main" : ""}`}>
                    <span className="sess-name">
                      {s.isMain && <span>🔴</span>}
                      {s.name}
                    </span>
                    <span className="sess-local">{s.times.localDisplay}</span>
                    <span className="sess-track">{s.times.trackDisplay}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
