import React, { useEffect, useState } from "react";
import { DriverAnalyticsView } from "../components/telemetry/DriverAnalyticsView";
import { getSessions } from "../api/openf1";
import type { OpenF1Session } from "../types/telemetry";

interface SessionPreset {
  key: number;
  name: string;
  circuit: string;
  country: string;
  year: number;
}

const PRESET_SESSIONS: SessionPreset[] = [
  { key: 9636, name: "São Paulo Grand Prix", circuit: "Autódromo José Carlos Pace (Interlagos)", country: "Brazil", year: 2024 },
  { key: 9662, name: "Abu Dhabi Grand Prix", circuit: "Yas Marina Circuit", country: "United Arab Emirates", year: 2024 },
  { key: 9590, name: "Italian Grand Prix", circuit: "Autodromo Nazionale Monza", country: "Italy", year: 2024 },
  { key: 9558, name: "British Grand Prix", circuit: "Silverstone Circuit", country: "United Kingdom", year: 2024 },
  { key: 9574, name: "Belgian Grand Prix", circuit: "Circuit de Spa-Francorchamps", country: "Belgium", year: 2024 },
  { key: 9523, name: "Monaco Grand Prix", circuit: "Circuit de Monaco", country: "Monaco", year: 2024 },
];

export const Telemetry: React.FC = () => {
  const [selectedSessionKey, setSelectedSessionKey] = useState<number>(9636);
  const [realSessions, setRealSessions] = useState<OpenF1Session[]>([]);

  useEffect(() => {
    getSessions(2024, "Race").then((sess) => {
      if (sess && sess.length > 0) {
        setRealSessions(sess);
      }
    });
  }, []);

  const currentRealSession = realSessions.find((s) => s.session_key === selectedSessionKey);
  const currentPreset = PRESET_SESSIONS.find((s) => s.key === selectedSessionKey) || PRESET_SESSIONS[0];

  const gpName = currentRealSession
    ? `${currentRealSession.circuit_short_name || currentRealSession.country_name} Grand Prix`
    : currentPreset.name;
  const gpCircuit = currentRealSession
    ? `${currentRealSession.circuit_short_name} (${currentRealSession.location})`
    : currentPreset.circuit;
  const gpCountry = currentRealSession ? currentRealSession.country_name : currentPreset.country;
  const gpYear = currentRealSession ? currentRealSession.year : currentPreset.year;

  return (
    <div className="telemetry-fullscreen-page">
      {/* Top Session Picker Banner */}
      <section className="telemetry-session-bar" aria-label="Grand Prix Session Selection">
        <div className="ts-left">
          <div className="ts-badge">OPENF1 API LIVE</div>
          <div className="ts-info">
            <span className="ts-gp-title">{gpName} {gpYear}</span>
            <span className="ts-gp-circuit">📍 {gpCircuit} · {gpCountry} · Session #{selectedSessionKey}</span>
          </div>
        </div>

        <div className="ts-right">
          <label htmlFor="gp-session-select" className="ts-select-label">Select Grand Prix:</label>
          <select
            id="gp-session-select"
            className="ts-dropdown"
            value={selectedSessionKey}
            onChange={(e) => setSelectedSessionKey(Number(e.target.value))}
          >
            {realSessions.length > 0
              ? realSessions.map((s) => (
                  <option key={s.session_key} value={s.session_key}>
                    {s.year} {s.country_name} GP ({s.circuit_short_name})
                  </option>
                ))
              : PRESET_SESSIONS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.year} {s.name} ({s.country})
                  </option>
                ))}
          </select>
        </div>
      </section>

      {/* Main Full-Featured Driver Analytics View */}
      <DriverAnalyticsView
        sessionKey={selectedSessionKey}
        initialDriverNumber={1} // Verstappen by default (winner of 9636)
        isFullscreenWindow={true}
      />
    </div>
  );
};
