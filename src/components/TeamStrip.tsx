import React from "react";
import type { TeamStanding } from "../types";
import { SkeletonPills } from "./Skeleton";

interface TeamStripProps {
  teams: TeamStanding[];
  loading?: boolean;
}

export const TeamStrip: React.FC<TeamStripProps> = ({ teams, loading = false }) => {
  const formatPts = (n: number) => (Number.isInteger(n) ? n : n.toFixed(1));

  return (
    <section className="card team-strip-card" aria-labelledby="strip-h">
      <header className="team-strip-head">
        <h2 id="strip-h">Constructor Logos &amp; Teams</h2>
        <span className="chip" id="strip-count">
          {loading ? "Loading…" : `${teams.length} teams`}
        </span>
      </header>
      <div className="team-strip" role="region" aria-label="Constructors list">
        {loading ? (
          <SkeletonPills count={10} />
        ) : (
          teams.map((t) => (
            <div
              key={t.constructorId || t.name}
              className="team-pill"
              style={{ "--team": t.colour } as React.CSSProperties}
              title={`${t.name} · P${t.position} (${formatPts(t.points)} pts)`}
            >
              {t.logo && <img className="team-pill-logo" src={t.logo} alt={t.name} />}
              <div className="team-pill-info">
                <span className="team-pill-name">{t.name}</span>
                <span className="team-pill-pts">
                  P{t.position} · {formatPts(t.points)} pts
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

