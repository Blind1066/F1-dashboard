import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DriverAnalyticsView } from "../components/telemetry/DriverAnalyticsView";
import { getSessions } from "../api/openf1";
import type { OpenF1Session } from "../types/telemetry";

const FALLBACK_SESSION_KEY = 9636; // São Paulo GP fallback

export const Telemetry: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedSessionKey, setSelectedSessionKey] = useState<number>(FALLBACK_SESSION_KEY);

  // Load OpenF1 sessions for the selected year and session_name=Race
  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery<OpenF1Session[]>({
    queryKey: ["sessions", selectedYear],
    queryFn: () => getSessions(selectedYear, "Race"),
  });

  // When sessions list loads or year changes, default to the latest completed race
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      const now = new Date();
      // Sort chronologically ascending
      const sorted = [...sessions].sort(
        (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
      );
      // Find completed races (date_end in the past)
      const completed = sorted.filter((s) => new Date(s.date_end).getTime() <= now.getTime());
      const latest = completed.length > 0 ? completed[completed.length - 1] : sorted[sorted.length - 1];
      if (latest) {
        setSelectedSessionKey(latest.session_key);
      }
    }
  }, [sessions]);

  const activeSession = sessions.find((s) => s.session_key === selectedSessionKey);
  const grandPrixName = activeSession?.location
    ? `${activeSession.location} Grand Prix`
    : activeSession?.country_name
    ? `${activeSession.country_name} Grand Prix`
    : "Brazilian Grand Prix";
  const circuitName = activeSession?.circuit_short_name || "Interlagos";
  const countryName = activeSession?.country_name || "Brazil";

  return (
    <div className="telemetry-fullscreen-page">
      {/* Top Session Banner with Season & Race Selector */}
      <section className="telemetry-session-bar" aria-label="Formula 1 Telemetry Sessions">
        <div className="ts-left">
          <div className="ts-badge">⏱️ Historical session data</div>
          <div className="ts-info">
            <span className="ts-gp-title">{grandPrixName} · {activeSession?.location || "São Paulo"}</span>
            <span className="ts-gp-circuit">
              📍 {circuitName} · {countryName} · Session #{selectedSessionKey}
            </span>
          </div>
        </div>

        <div className="ts-right">
          <div className="telemetry-session-selector-group" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <label className="ts-select-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>Season:</span>
              <select
                className="ts-dropdown"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                <option value={2026}>2026</option>
              </select>
            </label>

            <label className="ts-select-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>Race:</span>
              <select
                className="ts-dropdown"
                value={selectedSessionKey}
                onChange={(e) => setSelectedSessionKey(Number(e.target.value))}
                disabled={isLoadingSessions && sessions.length === 0}
              >
                {sessions.length > 0 ? (
                  sessions.map((s) => (
                    <option key={s.session_key} value={s.session_key}>
                      {s.location || s.country_name} ({s.circuit_short_name}) #{s.session_key}
                    </option>
                  ))
                ) : (
                  <option value={FALLBACK_SESSION_KEY}>São Paulo (Interlagos) #9636 Fallback</option>
                )}
              </select>
            </label>
          </div>

          <div className="ts-telemetry-badge-group">
            <span className="ts-channel-tag">Speed (km/h)</span>
            <span className="ts-channel-tag">Throttle (%)</span>
            <span className="ts-channel-tag">Brake (%)</span>
            <span className="ts-channel-tag">Gear (1-8)</span>
            <span className="ts-channel-tag">RPM</span>
            <span className="ts-channel-tag">DRS</span>
          </div>
        </div>
      </section>

      {/* Main Full-Featured Driver Analytics View */}
      <DriverAnalyticsView
        sessionKey={selectedSessionKey}
        sessionName={`Official Race · ${circuitName}`}
        circuitName={circuitName}
        countryName={countryName}
        initialDriverNumber={1}
        isFullscreenWindow={true}
      />
    </div>
  );
};
