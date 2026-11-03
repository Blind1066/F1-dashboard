import React from "react";
import { Link } from "react-router-dom";
import { Hero } from "../components/Hero";

export const Live: React.FC = () => {
  return (
    <div className="wrap">
      <Hero
        eyebrow="Stage 3 Roadmap"
        title="Live Timing & Scores"
        statusLine="Real-time race telemetry, sector times, and lap charts."
      />
      <div className="card" style={{ padding: "32px", textAlign: "center", margin: "24px 0" }}>
        <p style={{ color: "var(--muted)", fontSize: "16px", marginBottom: "16px" }}>
          Live timing powered by OpenF1 driver positions, pit stop intervals, and tyre stint analytics is currently in development.
        </p>
        <Link to="/" className="nav-btn active" style={{ display: "inline-block" }}>
          ← Back to Standings
        </Link>
      </div>
    </div>
  );
};

