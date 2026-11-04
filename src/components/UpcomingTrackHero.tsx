import React, { useEffect, useState } from "react";
import type { ScheduleRace } from "../types";
import { getCircuitData } from "../data/circuits";
import { TrackBlueprint } from "./TrackBlueprint";
import { LiveRaceTiming } from "./LiveRaceTiming";

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

  const [activeTab, setActiveTab] = useState<"blueprint" | "sessions" | "live">(
    countdown.isPast ? "live" : "blueprint"
  );
  const [flagFailed, setFlagFailed] = useState(false);

  // Automatically switch to live tab when race goes live
  useEffect(() => {
    if (countdown.isPast && activeTab !== "live") {
      setActiveTab("live");
    }
  }, [countdown.isPast, activeTab]);

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
          <span>
            {isPast || activeTab === "live" ? "🔴 TRACK IS LIVE" : `Upcoming Track • Round ${race.round}`}
          </span>
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

        {/* Tab switchers with Live Tab highlighted */}
        <div className="upcoming-tab-buttons" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "live"}
            className={`tab-btn live-tab-btn${activeTab === "live" ? " active" : ""}`}
            onClick={() => setActiveTab("live")}
            title="View Live Race Leaderboard & Telemetry"
          >
            <span className="live-tab-dot" />
            🔴 VIEW LIVE
          </button>
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

      {/* Grid Layout: shifts to wide view if live tab active */}
      <div className={`upcoming-grid-layout${activeTab === "live" ? " live-mode" : ""}`}>
        {/* Left Column: Countdown / Live Status & Dual Times */}
        <div className="upcoming-left-col">
          {/* Live Status or Digital Countdown Box */}
          {activeTab === "live" || isPast ? (
            <div className="live-status-active-card">
              <div className="live-status-head">
                <span className="live-beacon-dot" />
                <span className="live-status-title">RACE IS UNDERWAY LIVE</span>
              </div>
              <p className="live-status-desc">
                Real-time pitwall telemetry active: Driver positions, gaps to leader, intervals, tyre stints &amp; fastest lap.
              </p>
              <div className="live-quick-metrics">
                <div className="lqm-item">
                  <span className="lqm-lbl">Track Status</span>
                  <span className="lqm-val green">🟢 Green Flag</span>
                </div>
                <div className="lqm-item">
                  <span className="lqm-lbl">Leader</span>
                  <span className="lqm-val">P1 Lando Norris</span>
                </div>
                <div className="lqm-item">
                  <span className="lqm-lbl">Fastest Lap</span>
                  <span className="lqm-val purple">🟣 1:10.540</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="countdown-box" aria-label="Countdown to lights out">
              <div className="countdown-tag">
                Live Countdown To Lights Out
              </div>
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
            </div>
          )}

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

          {/* Quick Tab Switcher Button in Left Panel */}
          {activeTab !== "live" ? (
            <button
              type="button"
              className="track-action-btn live-btn-highlight"
              onClick={() => setActiveTab("live")}
            >
              <span>🔴 Enter Live Timing Section</span>
              <span>→</span>
            </button>
          ) : (
            <button
              type="button"
              className="track-action-btn"
              onClick={() => setActiveTab("blueprint")}
            >
              <span>🗺️ Switch to Track Blueprint</span>
              <span>→</span>
            </button>
          )}

          {/* Explore Details */}
          {onOpenDetails && (
            <button
              type="button"
              className="track-action-btn secondary"
              onClick={() => onOpenDetails(race.round)}
            >
              <span>Explore Grand Prix History</span>
              <span>↗</span>
            </button>
          )}
        </div>

        {/* Right Column: Live Telemetry / Track Blueprint / Sessions */}
        <div className="upcoming-right-col">
          {activeTab === "live" ? (
            <LiveRaceTiming race={race} />
          ) : activeTab === "blueprint" ? (
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
