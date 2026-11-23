import React from "react";
import { Avatar } from "../Avatar";
import { getTeamColour } from "../../api/telemetryDemo";

interface DriverAnalyticsHeaderProps {
  primaryDriver: {
    number: number;
    code: string;
    name: string;
    team: string;
    colour?: string;
    headshot?: string;
    nationality?: string;
    position?: number | string;
    grid?: number;
    delta?: number;
    fastestLap?: string;
    avgLap?: string;
    totalLaps?: number;
  };
  compareDriver?: {
    number: number;
    code: string;
    name: string;
    team: string;
    colour?: string;
  } | null;
  driversList: Array<{
    number: number;
    code: string;
    name: string;
    team: string;
    position?: number | string;
    grid?: number;
  }>;
  grandPrixName: string;
  sessionName: string;
  dataSource?: "live" | "simulated";
  onSelectPrimaryDriver: (driverNumber: number) => void;
  onSelectCompareDriver: (driverNumber: number | null) => void;
  onBackToClassification?: () => void;
  onCloseModal?: () => void;
  isFullscreenWindow?: boolean;
}

export const DriverAnalyticsHeader: React.FC<DriverAnalyticsHeaderProps> = ({
  primaryDriver,
  compareDriver,
  driversList,
  grandPrixName,
  sessionName,
  dataSource = "simulated",
  onSelectPrimaryDriver,
  onSelectCompareDriver,
  onBackToClassification,
  onCloseModal,
}) => {
  const [isBrowserFullscreen, setIsBrowserFullscreen] = React.useState(false);

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsBrowserFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const teamColor = primaryDriver.colour || getTeamColour(primaryDriver.team);
  const compareTeamColor = compareDriver?.colour || (compareDriver ? getTeamColour(compareDriver.team) : "#666");

  return (
    <header className="telemetry-header">
      {/* Top Bar with Back navigation, Session Badge & Fullscreen controls */}
      <div className="telemetry-top-nav">
        <div className="telemetry-top-nav-left">
          {onBackToClassification && (
            <button
              type="button"
              className="back-btn"
              onClick={onBackToClassification}
              title="Return to full race classification"
            >
              <span>←</span>
              <span>Back to Classification</span>
            </button>
          )}

          <div className="telemetry-session-tag">
            <span className="live-radar-dot" />
            <span className="session-gp">{grandPrixName}</span>
            <span className="sep">•</span>
            <span className="session-type">{sessionName}</span>
            <span className="badge-official">PITWALL TELEMETRY</span>
            <span className={`badge-data-source ${dataSource === "live" ? "live" : "simulated"}`}>
              {dataSource === "live" ? "🟢 Live OpenF1 data" : "🟡 Simulated data - OpenF1 unavailable"}
            </span>
          </div>
        </div>

        <div className="telemetry-top-nav-right">
          <button
            type="button"
            className="telemetry-action-pill-btn"
            onClick={toggleBrowserFullscreen}
            title={isBrowserFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen"}
          >
            <span>{isBrowserFullscreen ? "🗗" : "⛶"}</span>
            <span>{isBrowserFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>

          {onCloseModal && (
            <button
              type="button"
              className="telemetry-action-pill-btn close"
              onClick={onCloseModal}
              title="Close telemetry window"
            >
              <span>✕</span>
              <span>Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Driver Profile & Performance Stats Card */}
      <div className="telemetry-profile-card">
        <div className="driver-identity-group">
          <div className="driver-photo-wrap" style={{ borderColor: teamColor }}>
            <Avatar
              acronym={primaryDriver.code}
              headshotUrl={primaryDriver.headshot}
            />
            <span className="driver-num-badge" style={{ background: teamColor }}>
              #{primaryDriver.number}
            </span>
          </div>

          <div className="driver-meta">
            <div className="driver-name-row">
              <h1 className="driver-heading">{primaryDriver.name}</h1>
              {primaryDriver.nationality && (
                <span className="driver-nat-badge">{primaryDriver.nationality}</span>
              )}
            </div>

            <div className="driver-team-row">
              <span className="team-pill-indicator" style={{ background: teamColor }} />
              <span className="team-name-text">{primaryDriver.team}</span>
              <span className="code-pill">{primaryDriver.code}</span>
            </div>
          </div>
        </div>

        {/* Quick Performance Metrics Badges */}
        <div className="quick-stats-strip">
          <div className="qstat-item">
            <span className="qstat-lbl">Finish Pos</span>
            <span className="qstat-val pos-highlight">
              {primaryDriver.position ? `P${primaryDriver.position}` : "P1"}
            </span>
          </div>

          <div className="qstat-item">
            <span className="qstat-lbl">Grid Start</span>
            <span className="qstat-val">P{primaryDriver.grid ?? 1}</span>
          </div>

          <div className="qstat-item">
            <span className="qstat-lbl">Positions</span>
            {primaryDriver.delta && primaryDriver.delta > 0 ? (
              <span className="qstat-val delta-gain">▲ +{primaryDriver.delta}</span>
            ) : primaryDriver.delta && primaryDriver.delta < 0 ? (
              <span className="qstat-val delta-loss">▼ {primaryDriver.delta}</span>
            ) : (
              <span className="qstat-val delta-same">0 (held)</span>
            )}
          </div>

          <div className="qstat-item">
            <span className="qstat-lbl">Fastest Lap</span>
            <span className="qstat-val purple">
              🟣 {primaryDriver.fastestLap || "1:10.540"}
            </span>
          </div>

          <div className="qstat-item">
            <span className="qstat-lbl">Average Lap</span>
            <span className="qstat-val">{primaryDriver.avgLap || "1:14.280"}</span>
          </div>

          <div className="qstat-item">
            <span className="qstat-lbl">Total Laps</span>
            <span className="qstat-val">{primaryDriver.totalLaps || 71} laps</span>
          </div>
        </div>

        {/* Driver Selection & Comparison Pickers */}
        <div className="driver-selectors-box">
          <div className="selector-field">
            <label htmlFor="primary-driver-select" className="selector-label">
              Primary Driver:
            </label>
            <select
              id="primary-driver-select"
              className="driver-select-dropdown"
              value={primaryDriver.number}
              onChange={(e) => onSelectPrimaryDriver(Number(e.target.value))}
            >
              {driversList.map((d) => (
                <option key={d.number} value={d.number}>
                  {d.position ? `P${d.position} · ` : ""}#{d.number} {d.name} (Grid: P{d.grid ?? "-"} · {d.team})
                </option>
              ))}
            </select>
          </div>

          <div className="selector-field">
            <label htmlFor="compare-driver-select" className="selector-label">
              Compare With:
            </label>
            <select
              id="compare-driver-select"
              className="driver-select-dropdown compare"
              style={compareDriver ? { borderColor: compareTeamColor, boxShadow: `0 0 8px ${compareTeamColor}33` } : undefined}
              value={compareDriver ? compareDriver.number : ""}
              onChange={(e) => {
                const val = e.target.value;
                onSelectCompareDriver(val ? Number(val) : null);
              }}
            >
              <option value="">(No Comparison)</option>
              {driversList
                .filter((d) => d.number !== primaryDriver.number)
                .map((d) => (
                  <option key={d.number} value={d.number}>
                    {d.position ? `P${d.position} · ` : ""}#{d.number} {d.name} (Grid: P{d.grid ?? "-"} · {d.team})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
