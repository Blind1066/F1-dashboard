import React from "react";
import { Link } from "react-router-dom";
import { Hero } from "../components/Hero";

export const Telemetry: React.FC = () => {
  return (
    <div className="wrap">
      <Hero
        eyebrow="Stage 4 Roadmap"
        title="Car Telemetry & Replay"
        statusLine="Speed traces, throttle/brake telemetry, and 3D track replays."
      />
      <div className="card" style={{ padding: "32px", textAlign: "center", margin: "24px 0" }}>
        <p style={{ color: "var(--muted)", fontSize: "16px", marginBottom: "16px" }}>
          In-depth throttle, brake, gear, and DRS traces comparing teammates and title contenders lap-by-lap.
        </p>
        <Link to="/" className="nav-btn active" style={{ display: "inline-block" }}>
          ← Back to Standings
        </Link>
      </div>
    </div>
  );
};

