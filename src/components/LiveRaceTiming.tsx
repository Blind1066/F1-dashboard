import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { LiveRaceSessionState, ScheduleRace } from "../types";
import { createInitialLiveSession, tickLiveSession } from "../api/liveTiming";
import { Avatar } from "./Avatar";

interface LiveRaceTimingProps {
  race?: ScheduleRace | null;
  compact?: boolean;
}

export const LiveRaceTiming: React.FC<LiveRaceTimingProps> = ({
  race,
  compact = false,
}) => {
  const [session, setSession] = useState<LiveRaceSessionState>(() =>
    createInitialLiveSession(race)
  );
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [selectedDriverCode, setSelectedDriverCode] = useState<string | null>(null);

  // Re-initialize if race changes
  useEffect(() => {
    setSession(createInitialLiveSession(race));
  }, [race]);

  // Live real-time tick (updates every 3 seconds)
  useEffect(() => {
    if (!isLiveActive) return;
    const interval = setInterval(() => {
      setSession((prev) => tickLiveSession(prev));
    }, 3000);
    return () => clearInterval(interval);
  }, [isLiveActive]);

  const lapProgress = Math.min(100, Math.round((session.currentLap / session.totalLaps) * 100));

  // Team list for quick filtering
  const teams = Array.from(new Set(session.drivers.map((d) => d.team)));

  const filteredDrivers = filterTeam === "all"
    ? session.drivers
    : session.drivers.filter((d) => d.team === filterTeam);

  return (
    <div className={`live-timing-container${compact ? " compact" : ""}`} aria-label="Formula 1 Live Race Timing">
      {/* Top Status & Telemetry Bar */}
      <div className="live-timing-top-bar">
        <div className="live-status-group">
          <div className="live-broadcast-chip">
            <span className="live-beacon-dot" />
            <span>LIVE TIMING</span>
          </div>
          <span className="live-flag-badge green">
            🟢 {session.status}
          </span>
          <div className="live-lap-counter">
            <span className="lap-tag">LAP</span>
            <span className="lap-numbers">
              <strong>{session.currentLap}</strong> / {session.totalLaps}
            </span>
          </div>
        </div>

        {/* Live Ticker Controls & Fullscreen */}
        <div className="live-controls-group">
          <button
            type="button"
            className={`live-ticker-toggle${isLiveActive ? " active" : ""}`}
            onClick={() => setIsLiveActive((prev) => !prev)}
            title={isLiveActive ? "Pause simulated live ticker" : "Resume simulated live ticker"}
          >
            <span>{isLiveActive ? "⏸ Pause Feed" : "▶ Resume Feed"}</span>
          </button>
          <Link to="/live" className="live-fullscreen-link" title="Open full Live Pitwall">
            <span>Fullscreen Pitwall ↗</span>
          </Link>
        </div>
      </div>

      {/* Lap Progress Bar */}
      <div className="live-lap-progress-track">
        <div
          className="live-lap-progress-fill"
          style={{ width: `${lapProgress}%` }}
          aria-label={`Lap progress: ${lapProgress}%`}
        />
      </div>

      {/* Highlight Strips: Leader & Fastest Lap Banner */}
      <div className="live-highlights-bar">
        <div className="highlight-item leader-box">
          <span className="hl-label">Race Leader</span>
          <div className="hl-driver-row">
            <span className="hl-num">#{session.drivers[0].number}</span>
            <span className="hl-name">{session.drivers[0].name}</span>
            <span className="hl-team" style={{ color: session.drivers[0].colour }}>
              ({session.drivers[0].team})
            </span>
          </div>
        </div>

        <div className="highlight-item fastest-lap-box">
          <div className="hl-label-group">
            <span className="hl-purple-badge">🟣 FASTEST LAP</span>
            <span className="hl-fl-time">{session.fastestLapTime}</span>
          </div>
          <div className="hl-fl-driver">
            <span>{session.fastestLapDriver}</span>
            <span className="hl-lap-num">Lap {session.fastestLapLap}</span>
          </div>
        </div>

        <div className="highlight-item weather-box">
          <span className="hl-label">Track Conditions</span>
          <div className="hl-weather-vals">
            <span>🌡️ Track: <strong>{session.trackTemp}</strong></span>
            <span>•</span>
            <span>Air: <strong>{session.airTemp}</strong></span>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      {!compact && (
        <div className="live-filter-strip">
          <button
            type="button"
            className={`live-filter-pill${filterTeam === "all" ? " active" : ""}`}
            onClick={() => setFilterTeam("all")}
          >
            All Drivers ({session.drivers.length})
          </button>
          {teams.map((t) => (
            <button
              key={t}
              type="button"
              className={`live-filter-pill${filterTeam === "t" ? " active" : ""}`}
              onClick={() => setFilterTeam(filterTeam === t ? "all" : t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Live Timing Leaderboard Table */}
      <div className="live-table-wrapper">
        <table className="live-table">
          <thead>
            <tr>
              <th className="th-pos">POS</th>
              <th className="th-delta">+/-</th>
              <th className="th-driver">DRIVER</th>
              <th className="th-team">TEAM</th>
              <th className="th-gap">GAP</th>
              <th className="th-interval">INTERVAL</th>
              <th className="th-last">LAST LAP</th>
              <th className="th-fastest">FASTEST</th>
              <th className="th-tyre">TYRE</th>
              <th className="th-pit">PIT</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map((driver) => {
              const isSelected = selectedDriverCode === driver.code;
              const isP1 = driver.position === 1;

              return (
                <tr
                  key={driver.code}
                  className={`live-row${isP1 ? " is-p1" : ""}${driver.isFastestLap ? " has-fl" : ""}${isSelected ? " selected" : ""}`}
                  onClick={() => setSelectedDriverCode(isSelected ? null : driver.code)}
                >
                  {/* Position */}
                  <td className="td-pos">
                    <span className={`pos-badge pos-${driver.position}`}>
                      {driver.position}
                    </span>
                  </td>

                  {/* Delta (grid gain/loss) */}
                  <td className="td-delta">
                    {driver.delta > 0 ? (
                      <span className="delta-gain">▲ +{driver.delta}</span>
                    ) : driver.delta < 0 ? (
                      <span className="delta-loss">▼ {driver.delta}</span>
                    ) : (
                      <span className="delta-equal">-</span>
                    )}
                  </td>

                  {/* Driver Name & Headshot */}
                  <td className="td-driver">
                    <div className="driver-cell">
                      <div className="driver-avatar-mini" style={{ borderColor: driver.colour }}>
                        <Avatar
                          acronym={driver.code}
                          headshotUrl={driver.headshot}
                        />
                      </div>
                      <span className="driver-num">#{driver.number}</span>
                      <span className="driver-name">{driver.name}</span>
                      <span className="driver-acronym">{driver.code}</span>
                    </div>
                  </td>

                  {/* Team */}
                  <td className="td-team">
                    <div className="team-cell">
                      <span className="team-bar" style={{ background: driver.colour }} />
                      <span className="team-text">{driver.team}</span>
                    </div>
                  </td>

                  {/* Gap to Leader */}
                  <td className="td-gap">
                    <span className={`gap-val${isP1 ? " leader" : ""}`}>
                      {driver.gap}
                    </span>
                  </td>

                  {/* Interval to car ahead */}
                  <td className="td-interval">
                    <span className={`interval-val${isP1 ? " leader" : ""}`}>
                      {driver.interval}
                    </span>
                  </td>

                  {/* Last Lap */}
                  <td className="td-last">
                    <span className="lap-val">{driver.lastLap}</span>
                  </td>

                  {/* Fastest Lap with Purple highlight */}
                  <td className="td-fastest">
                    <span className={`fl-val${driver.isFastestLap ? " is-overall-fl" : ""}`}>
                      {driver.isFastestLap && <span className="fl-purple-dot">🟣 </span>}
                      {driver.fastestLap}
                    </span>
                  </td>

                  {/* Tyre compound badge */}
                  <td className="td-tyre">
                    <div className="tyre-group">
                      <span className={`tyre-badge tyre-${driver.tyre}`} title={`${driver.tyre} tyre`}>
                        {driver.tyre[0].toUpperCase()}
                      </span>
                      <span className="tyre-age">{driver.tyreAge}L</span>
                    </div>
                  </td>

                  {/* Pit stops */}
                  <td className="td-pit">
                    <span className="pit-badge">{driver.pitStops}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected Driver Detailed Telemetry Card */}
      {selectedDriverCode && (() => {
        const d = session.drivers.find((x) => x.code === selectedDriverCode);
        if (!d) return null;
        return (
          <div className="live-driver-telemetry-drawer">
            <div className="telemetry-drawer-head">
              <div className="td-driver-info">
                <Avatar acronym={d.code} headshotUrl={d.headshot} big />
                <div>
                  <h4 className="td-name">#{d.number} {d.name}</h4>
                  <span className="td-team-tag" style={{ color: d.colour }}>{d.team} • Position P{d.position}</span>
                </div>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setSelectedDriverCode(null)}
              >
                ✕ Close
              </button>
            </div>

            <div className="telemetry-metrics-grid">
              <div className="tel-card">
                <span className="tc-lbl">Gap to Leader</span>
                <span className="tc-val">{d.gap}</span>
              </div>
              <div className="tel-card">
                <span className="tc-lbl">Interval Ahead</span>
                <span className="tc-val">{d.interval}</span>
              </div>
              <div className="tel-card">
                <span className="tc-lbl">Last Lap</span>
                <span className="tc-val">{d.lastLap}</span>
              </div>
              <div className="tel-card">
                <span className="tc-lbl">Personal Best</span>
                <span className="tc-val" style={{ color: d.isFastestLap ? "#c084fc" : "inherit" }}>
                  {d.isFastestLap ? "🟣 " : ""}{d.fastestLap}
                </span>
              </div>
              <div className="tel-card">
                <span className="tc-lbl">Sector 1</span>
                <span className="tc-val">{d.sector1}s</span>
              </div>
              <div className="tel-card">
                <span className="tc-lbl">Sector 2</span>
                <span className="tc-val">{d.sector2}s</span>
              </div>
              <div className="tel-card">
                <span className="tc-lbl">Sector 3</span>
                <span className="tc-val">{d.sector3}s</span>
              </div>
              <div className="tel-card">
                <span className="tc-lbl">Tyre Compound</span>
                <span className="tc-val" style={{ textTransform: "capitalize" }}>
                  {d.tyre} ({d.tyreAge} laps)
                </span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
