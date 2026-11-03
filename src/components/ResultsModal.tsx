import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRaceResults } from "../api/jolpica";
import { getDemoRaceResults } from "../api/demo";
import type { FullRaceDetails } from "../types";
import { Avatar } from "./Avatar";
import { SkeletonRows } from "./Skeleton";

interface ResultsModalProps {
  round: number | null;
  onClose: () => void;
}

type TabType = "race" | "qualifying" | "sprint";

export const ResultsModal: React.FC<ResultsModalProps> = ({ round, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>("race");

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const { data, isLoading, isError } = useQuery<FullRaceDetails>({
    queryKey: ["results", 2026, round],
    queryFn: () => (round ? getRaceResults(2026, round) : Promise.reject("No round")),
    enabled: round !== null,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });

  const details: FullRaceDetails | null = useMemo(() => {
    if (!round) return null;
    if (isError) return getDemoRaceResults(round);
    return data || null;
  }, [round, isError, data]);

  if (!round) return null;

  // Stat computations
  const winner = details?.results?.[0];
  const poleDriver = details?.qualifying?.[0]?.driver || details?.results?.find((r) => r.grid === 1)?.driver;
  const poleTime = details?.qualifying?.[0]?.q3 || details?.qualifying?.[0]?.q2 || details?.qualifying?.[0]?.q1;
  const fastestLapRow = details?.results?.find((r) => r.fastestLap?.rank === 1) || details?.results?.[0];
  const totalLaps = winner?.laps || 0;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="results-modal-title"
    >
      <div
        className="results-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <div className="modal-eyebrow">
              <span>ROUND {String(round).padStart(2, "0")}</span>
              <span>•</span>
              <span>OFFICIAL CLASSIFICATION</span>
            </div>
            <h2 id="results-modal-title" className="modal-title">
              {details?.raceName || `Round ${round} Grand Prix`}
            </h2>
            <div className="modal-sub">
              {details?.flagUrl && (
                <img
                  src={details.flagUrl}
                  alt={details.country}
                  className="race-flag-img"
                  style={{ width: "22px", height: "15px" }}
                />
              )}
              <span>📍 {details?.circuitName}</span>
              <span>·</span>
              <span>{details?.locality}, {details?.country}</span>
              {details?.date && (
                <>
                  <span>·</span>
                  <span>{new Date(details.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close race results"
          >
            ✕
          </button>
        </div>

        {/* Highlights / Fast-F1 telemetry summaries with driver images */}
        {details && !isLoading && (
          <div className="modal-stat-cards">
            {winner && (
              <div className="modal-stat-card">
                <div className="modal-stat-avatar-row">
                  <Avatar
                    acronym={winner.driver.code}
                    headshotUrl={winner.driver.headshot}
                  />
                  <div className="modal-stat-content">
                    <div className="modal-stat-lbl">🥇 Race Winner</div>
                    <div className="modal-stat-val">{winner.driver.name}</div>
                    <div className="modal-stat-sub">{winner.team.name} · {winner.time}</div>
                  </div>
                </div>
              </div>
            )}
            {poleDriver && (
              <div className="modal-stat-card">
                <div className="modal-stat-avatar-row">
                  <Avatar
                    acronym={poleDriver.code}
                    headshotUrl={poleDriver.headshot}
                  />
                  <div className="modal-stat-content">
                    <div className="modal-stat-lbl">⚡ Pole Position</div>
                    <div className="modal-stat-val">{poleDriver.name}</div>
                    <div className="modal-stat-sub">
                      {poleTime ? `Time: ${poleTime}` : "Grid P1"}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {fastestLapRow && (
              <div className="modal-stat-card">
                <div className="modal-stat-avatar-row">
                  <Avatar
                    acronym={fastestLapRow.driver.code}
                    headshotUrl={fastestLapRow.driver.headshot}
                  />
                  <div className="modal-stat-content">
                    <div className="modal-stat-lbl">
                      <span style={{ color: "#c084fc" }}>🟣</span> Fastest Lap
                    </div>
                    <div className="modal-stat-val">{fastestLapRow.driver.name}</div>
                    <div className="modal-stat-sub">
                      {fastestLapRow.fastestLap
                        ? `${fastestLapRow.fastestLap.time} (Lap ${fastestLapRow.fastestLap.lap})`
                        : fastestLapRow.team.name}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="modal-stat-card">
              <div className="modal-stat-avatar-row">
                <div className="stat-circle-icon">🏁</div>
                <div className="modal-stat-content">
                  <div className="modal-stat-lbl">Race Distance</div>
                  <div className="modal-stat-val">{totalLaps} Laps</div>
                  <div className="modal-stat-sub">Full Grand Prix Distance</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session Tabs */}
        {details && (
          <div className="modal-tabs">
            <button
              type="button"
              className={`pill-btn${activeTab === "race" ? " active" : ""}`}
              onClick={() => setActiveTab("race")}
            >
              Race Classification ({details.results.length})
            </button>
            {details.qualifying && details.qualifying.length > 0 && (
              <button
                type="button"
                className={`pill-btn${activeTab === "qualifying" ? " active" : ""}`}
                onClick={() => setActiveTab("qualifying")}
              >
                Qualifying ({details.qualifying.length})
              </button>
            )}
            {details.sprint && details.sprint.length > 0 && (
              <button
                type="button"
                className={`pill-btn${activeTab === "sprint" ? " active" : ""}`}
                onClick={() => setActiveTab("sprint")}
              >
                Sprint ({details.sprint.length})
              </button>
            )}
          </div>
        )}

        {/* Modal Body / Tables */}
        <div className="modal-body">
          {isLoading ? (
            <div style={{ padding: "24px", display: "grid", gap: "8px" }}>
              <SkeletonRows count={8} />
            </div>
          ) : !details ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
              No results available for this round.
            </div>
          ) : activeTab === "race" ? (
            <table className="results-table">
              <thead>
                <tr>
                  <th style={{ width: "45px" }}>Pos</th>
                  <th>Driver</th>
                  <th>Team</th>
                  <th>Grid</th>
                  <th>Laps</th>
                  <th>Time / Gap</th>
                  <th>Fastest Lap</th>
                  <th style={{ textAlign: "right", paddingRight: "20px" }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {details.results.map((row) => (
                  <tr key={row.driver.id}>
                    <td style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                      {row.positionText}
                    </td>
                    <td>
                      <div className="driver-cell">
                        <Avatar
                          acronym={row.driver.code}
                          headshotUrl={row.driver.headshot}
                        />
                        <div className="name-block">
                          <span className="driver-fullname">{row.driver.name}</span>
                          <span className="driver-subtext">
                            <span>#{row.driver.number}</span>
                            <span>{row.driver.code}</span>
                            {row.driver.nationality && <span>· {row.driver.nationality}</span>}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="team-cell">
                        <span
                          className="team-bar-pill"
                          style={{ background: row.team.colour }}
                        />
                        <span>{row.team.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="grid-cell">
                        <span>P{row.grid}</span>
                        {row.delta > 0 && (
                          <span className="delta-gain" title={`Gained ${row.delta} positions`}>
                            ▲ +{row.delta}
                          </span>
                        )}
                        {row.delta < 0 && (
                          <span className="delta-loss" title={`Lost ${Math.abs(row.delta)} positions`}>
                            ▼ {row.delta}
                          </span>
                        )}
                        {row.delta === 0 && (
                          <span className="delta-same">-</span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{row.laps}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
                      {row.time}
                    </td>
                    <td>
                      {row.fastestLap ? (
                        row.fastestLap.rank === 1 ? (
                          <span className="fl-badge" title="Fastest Lap of the race">
                            <span>🟣</span>
                            <span>{row.fastestLap.time}</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                            {row.fastestLap.time}
                          </span>
                        )
                      ) : (
                        <span style={{ color: "var(--muted)" }}>-</span>
                      )}
                    </td>
                    <td className="pts-cell">
                      {row.points > 0 ? `+${row.points}` : "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === "qualifying" && details.qualifying ? (
            <table className="results-table">
              <thead>
                <tr>
                  <th style={{ width: "45px" }}>Pos</th>
                  <th>Driver</th>
                  <th>Team</th>
                  <th>Q1</th>
                  <th>Q2</th>
                  <th>Q3</th>
                </tr>
              </thead>
              <tbody>
                {details.qualifying.map((row) => (
                  <tr key={row.driver.id}>
                    <td style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                      {row.position}
                    </td>
                    <td>
                      <div className="driver-cell">
                        <Avatar
                          acronym={row.driver.code}
                          headshotUrl={row.driver.headshot}
                        />
                        <div className="name-block">
                          <span className="driver-fullname">{row.driver.name}</span>
                          <span className="driver-subtext">
                            <span>#{row.driver.number}</span>
                            <span>{row.driver.code}</span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="team-cell">
                        <span
                          className="team-bar-pill"
                          style={{ background: row.team.colour }}
                        />
                        <span>{row.team.name}</span>
                      </div>
                    </td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{row.q1 || "-"}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{row.q2 || "-"}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                      {row.q3 || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === "sprint" && details.sprint ? (
            <table className="results-table">
              <thead>
                <tr>
                  <th style={{ width: "45px" }}>Pos</th>
                  <th>Driver</th>
                  <th>Team</th>
                  <th>Grid</th>
                  <th>Laps</th>
                  <th>Time / Gap</th>
                  <th style={{ textAlign: "right", paddingRight: "20px" }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {details.sprint.map((row) => (
                  <tr key={row.driver.id}>
                    <td style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                      {row.positionText}
                    </td>
                    <td>
                      <div className="driver-cell">
                        <Avatar
                          acronym={row.driver.code}
                          headshotUrl={row.driver.headshot}
                        />
                        <div className="name-block">
                          <span className="driver-fullname">{row.driver.name}</span>
                          <span className="driver-subtext">
                            <span>#{row.driver.number}</span>
                            <span>{row.driver.code}</span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="team-cell">
                        <span
                          className="team-bar-pill"
                          style={{ background: row.team.colour }}
                        />
                        <span>{row.team.name}</span>
                      </div>
                    </td>
                    <td>P{row.grid}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{row.laps}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
                      {row.time}
                    </td>
                    <td className="pts-cell">
                      {row.points > 0 ? `+${row.points}` : "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div>
            Data sourced via Fast-F1 &amp; Jolpica F1 API (Official FIA Classifications).
          </div>
          <button
            type="button"
            className="pill-btn"
            onClick={onClose}
            style={{ padding: "4px 12px", fontSize: "12px" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

