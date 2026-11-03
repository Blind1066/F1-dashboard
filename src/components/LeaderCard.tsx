import React from "react";
import type { DriverStanding, TeamStanding } from "../types";
import { Avatar } from "./Avatar";
import { TeamBadge } from "./TeamBadge";

interface LeaderCardProps {
  drivers: DriverStanding[];
  teams: TeamStanding[];
}

export const LeaderCard: React.FC<LeaderCardProps> = ({ drivers, teams }) => {
  if (!drivers.length || !teams.length) return null;

  const lead = drivers[0];
  const second = drivers[1];
  const tl = teams[0];
  const secondT = teams[1];

  const gapD = second ? lead.points - second.points : 0;
  const gapT = secondT ? tl.points - secondT.points : 0;

  const formatPts = (n: number) => (Number.isInteger(n) ? n : n.toFixed(1));

  return (
    <section className="leaders" aria-label="Championship leaders">
      {/* Drivers' leader */}
      <article className="leader" style={{ "--team": lead.colour } as React.CSSProperties}>
        <span className="leader-tag">Drivers' leader</span>
        <div className="leader-main">
          <Avatar acronym={lead.acronym} headshotUrl={lead.headshot} big />
          <div>
            <div className="leader-name">{lead.name}</div>
            <div className="leader-team">
              {lead.logo && <img className="mini-team-logo" src={lead.logo} alt="" loading="lazy" />}
              <span>{lead.team}</span>
            </div>
          </div>
        </div>
        <div className="leader-stats">
          <div>
            <b>{formatPts(lead.points)}</b>
            <span>points</span>
          </div>
          <div>
            <b>+{formatPts(gapD)}</b>
            <span>lead</span>
          </div>
          <div>
            <b>{lead.wins ?? 0}</b>
            <span>wins</span>
          </div>
        </div>
      </article>

      {/* Constructors' leader */}
      <article className="leader" style={{ "--team": tl.colour } as React.CSSProperties}>
        <span className="leader-tag">Constructors' leader</span>
        <div className="leader-main">
          <TeamBadge name={tl.name} logoSrc={tl.logo} big />
          <div>
            <div className="leader-name">{tl.name}</div>
            <div className="leader-team">
              {drivers
                .filter((x) => x.team === tl.name)
                .map((x) => x.acronym)
                .join(" · ")}
            </div>
          </div>
        </div>
        <div className="leader-stats">
          <div>
            <b>{formatPts(tl.points)}</b>
            <span>points</span>
          </div>
          <div>
            <b>+{formatPts(gapT)}</b>
            <span>lead</span>
          </div>
          <div>
            <b>{tl.wins ?? 0}</b>
            <span>wins</span>
          </div>
        </div>
      </article>
    </section>
  );
};

