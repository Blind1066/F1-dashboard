import React, { useState } from "react";
import { DriverAnalyticsView } from "../components/telemetry/DriverAnalyticsView";

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

  const currentPreset = PRESET_SESSIONS.find((s) => s.key === selectedSessionKey) || PRESET_SESSIONS[0];

  return (
    <div className="wrap telemetry-page-wrap">
      {/* Top Session Picker Banner */}
      <section className="telemetry-session-bar" aria-label="Grand Prix Session Selection">
        <div className="ts-left">
          <div className="ts-badge">FIA F1 TELEMETRY</div>
          <div className="ts-info">
            <span className="ts-gp-title">{currentPreset.name} {currentPreset.year}</span>
            <span className="ts-gp-circuit">📍 {currentPreset.circuit} · {currentPreset.country}</span>
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
            {PRESET_SESSIONS.map((s) => (
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
        initialDriverNumber={4} // Norris by default
      />
    </div>
  );
};
