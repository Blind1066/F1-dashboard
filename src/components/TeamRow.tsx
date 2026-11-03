import React from "react";
import type { TeamStanding } from "../types";
import { TeamBadge } from "./TeamBadge";

interface TeamRowProps {
  team: TeamStanding;
  maxPoints: number;
}

export const TeamRow: React.FC<TeamRowProps> = ({ team, maxPoints }) => {
  const widthPercent = maxPoints > 0 ? Math.max(2, (team.points / maxPoints) * 100) : 2;
  const ptsFormatted = Number.isInteger(team.points) ? team.points : team.points.toFixed(1);
  const gainedFormatted = Number.isInteger(team.gained) ? team.gained : team.gained.toFixed(1);

  return (
    <div
      className="row"
      role="row"
      style={{
        "--team": team.colour,
        "--w": `${widthPercent}%`,
      } as React.CSSProperties}
    >
      <span className="pos" role="cell">
        {team.position}
      </span>
      <span role="cell">
        {team.delta > 0 ? (
          <span className="delta up" aria-label={`up ${team.delta}`}>
            ▲{team.delta}
          </span>
        ) : team.delta < 0 ? (
          <span className="delta down" aria-label={`down ${-team.delta}`}>
            ▼{-team.delta}
          </span>
        ) : (
          <span className="delta flat" aria-label="no change">
            –
          </span>
        )}
      </span>
      <span className="who" role="cell">
        <TeamBadge name={team.name} logoSrc={team.logo} />
        <span className="who-text">
          <strong>{team.name}</strong>
        </span>
      </span>
      <span className="num" role="cell">
        {ptsFormatted}
        {team.gained > 0 && <span className="gained">+{gainedFormatted}</span>}
      </span>
      <span className="bar" aria-hidden="true" />
    </div>
  );
};

