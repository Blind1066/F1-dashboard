import React, { useEffect, useState } from "react";
import type { ScheduleRace } from "../types";
import { getTrackPhoto, formatWeekendRange } from "../utils/trackPhotos";

interface NextRaceCardProps {
  race: ScheduleRace | null;
  season?: number;
  badgeLabel?: string;
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

export const NextRaceCard: React.FC<NextRaceCardProps> = ({ race, season, badgeLabel }) => {
  const [countdown, setCountdown] = useState<TimeRemaining>(() =>
    race ? calculateCountdown(race.raceTimes.date) : { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false }
  );
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
      <div className="next-race-card">
        <div className="next-title-row">
          <h2 className="next-title">Season Complete</h2>
        </div>
        <p className="next-venue">All races for the {season || 2026} season have concluded.</p>
      </div>
    );
  }

  const { days, hours, minutes, seconds, isPast } = countdown;
  const trackBg = getTrackPhoto(race.round, race.circuit.id, race.circuit.country);
  const weekendDates = formatWeekendRange(race);

  const defaultBadge = isPast
    ? "CURRENT GRAND PRIX"
    : season === 2027 && race.round === 1
    ? "2027 SEASON OPENER • ROUND 1"
    : `NEXT RACE • ROUND ${race.round}`;
  const chipText = badgeLabel || defaultBadge;

  return (
    <section className="next-race-card has-track-bg" aria-label="Next Formula 1 Grand Prix">
      {/* Background Track Photo Layer */}
      <div
        className="next-race-bg-photo"
        style={{ backgroundImage: `url(${trackBg})` }}
        aria-hidden="true"
      />
      <div className="next-race-bg-overlay" aria-hidden="true" />

      {/* Main Content inside Relative Wrapper */}
      <div className="next-race-content">
        <div className="next-badge-row">
          <div className="next-chip">
            <span className="pulse-dot" />
            <span>{chipText}</span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
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
            <span style={{ font: "600 13px var(--display)", textTransform: "uppercase", letterSpacing: ".06em", color: "var(--muted)" }}>
              {race.circuit.country}
            </span>
          </div>
        </div>

        <div className="next-title-row">
          <div className="next-title-col">
            <h2 className="next-title">{race.name}</h2>
            <div className="next-venue">
              <span className="venue-pin">📍</span>
              <span className="venue-circuit">{race.circuit.name}</span>
              {weekendDates && (
                <>
                  <span className="venue-bar">|</span>
                  <span className="venue-dates">{weekendDates}</span>
                </>
              )}
              <span className="venue-dot">·</span>
              <span className="venue-loc">{race.circuit.city}, {race.circuit.country}</span>
            </div>
          </div>
        </div>

        {/* Countdown to Lights Out */}
        <div className="countdown-box">
          <div className="countdown-tag">
            {isPast ? "Status" : "Countdown to Lights Out"}
          </div>
          {isPast ? (
            <div className="countdown-grid" style={{ color: "var(--accent)", fontWeight: 700 }}>
              🏁 Lights Out / Race in Progress
            </div>
          ) : (
            <div className="countdown-grid" aria-label={`Countdown: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`}>
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

        {/* Dual Timing Cards: Your Local Time vs Track Local Time */}
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

        {/* Track time offset relative to local time */}
        {race.diffText && (
          <div className="time-diff-bar">
            <span>⏱️</span>
            <span>{race.diffText}</span>
          </div>
        )}

        {/* Full Weekend Schedule */}
        {race.sessions && race.sessions.length > 0 && (
          <div className="weekend-sessions">
            <div className="weekend-head">Full Weekend Schedule</div>
            <div className="sess-table">
              <div className="sess-row head">
                <span>Session</span>
                <span>Your Local Time</span>
                <span>Track Local Time</span>
              </div>
              {race.sessions.map((s, idx) => (
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
    </section>
  );
};
