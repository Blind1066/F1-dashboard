import React from "react";
import { DriverAnalyticsView } from "../components/telemetry/DriverAnalyticsView";

// Dedicated single Grand Prix: Brazilian Grand Prix (São Paulo GP at Autódromo José Carlos Pace, Interlagos)
const BRAZIL_GP_SESSION = {
  key: 9636,
  name: "Brazilian Grand Prix",
  officialName: "Formula 1 Grande Prêmio de São Paulo",
  circuit: "Autódromo José Carlos Pace (Interlagos)",
  country: "Brazil",
  location: "São Paulo",
  laps: 71,
  circuitLengthKm: "4.309",
};

export const Telemetry: React.FC = () => {
  return (
    <div className="telemetry-fullscreen-page">
      {/* Top Session Banner: Single Grand Prix Showcase */}
      <section className="telemetry-session-bar" aria-label="Brazilian Grand Prix Telemetry">
        <div className="ts-left">
          <div className="ts-badge">🔴 LIVE PITWALL TELEMETRY</div>
          <div className="ts-info">
            <span className="ts-gp-title">{BRAZIL_GP_SESSION.name} · São Paulo</span>
            <span className="ts-gp-circuit">
              📍 {BRAZIL_GP_SESSION.circuit} · {BRAZIL_GP_SESSION.country} · {BRAZIL_GP_SESSION.laps} Laps ({BRAZIL_GP_SESSION.circuitLengthKm} km) · Session #{BRAZIL_GP_SESSION.key}
            </span>
          </div>
        </div>

        <div className="ts-right">
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
        sessionKey={BRAZIL_GP_SESSION.key}
        initialDriverNumber={1} // P1: Max Verstappen (The First) by default
        isFullscreenWindow={true}
      />
    </div>
  );
};
