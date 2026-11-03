import React from "react";
import { Link } from "react-router-dom";
import { Hero } from "../components/Hero";

export const News: React.FC = () => {
  return (
    <div className="wrap">
      <Hero
        eyebrow="Stage 2 Roadmap"
        title="Formula 1 News"
        statusLine="Curated team feeds and race weekend reports coming soon."
      />
      <div className="card" style={{ padding: "32px", textAlign: "center", margin: "24px 0" }}>
        <p style={{ color: "var(--muted)", fontSize: "16px", marginBottom: "16px" }}>
          The news aggregation module will feature live RSS feeds from major F1 outlets, team press releases, and FIA bulletins.
        </p>
        <Link to="/" className="nav-btn active" style={{ display: "inline-block" }}>
          ← Back to Standings
        </Link>
      </div>
    </div>
  );
};

