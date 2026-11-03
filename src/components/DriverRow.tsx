import React from "react";
import type { DriverStanding } from "../types";
import { Avatar } from "./Avatar";

interface DriverRowProps {
  driver: DriverStanding;
  maxPoints: number;
}

export const DriverRow: React.FC<DriverRowProps> = ({ driver, maxPoints }) => {
  const widthPercent = maxPoints > 0 ? Math.max(2, (driver.points / maxPoints) * 100) : 2;
  const ptsFormatted = Number.isInteger(driver.points) ? driver.points : driver.points.toFixed(1);
  const gainedFormatted = Number.isInteger(driver.gained) ? driver.gained : driver.gained.toFixed(1);

  return (
    <div
      className="row"
      role="row"
      style={{
        "--team": driver.colour,
        "--w": `${widthPercent}%`,
      } as React.CSSProperties}
    >
      <span className="pos" role="cell">
        {driver.position}
      </span>
      <span role="cell">
        {driver.delta > 0 ? (
          <span className="delta up" aria-label={`up ${driver.delta}`}>
            ▲{driver.delta}
          </span>
        ) : driver.delta < 0 ? (
          <span className="delta down" aria-label={`down ${-driver.delta}`}>
            ▼{-driver.delta}
          </span>
        ) : (
          <span className="delta flat" aria-label="no change">
            –
          </span>
        )}
      </span>
      <span className="who" role="cell">
        <Avatar acronym={driver.acronym} headshotUrl={driver.headshot} />
        <span className="who-text">
          <strong>
            <span className="full">{driver.name}</span>
            <span className="short">{driver.acronym || driver.name}</span>
          </strong>
          <small className="team-sub">
            {driver.logo && <img className="mini-team-logo" src={driver.logo} alt="" loading="lazy" />}
            <span>{driver.team}</span>
          </small>
        </span>
      </span>
      <span className="num" role="cell">
        {ptsFormatted}
        {driver.gained > 0 && <span className="gained">+{gainedFormatted}</span>}
      </span>
      <span className="bar" aria-hidden="true" />
    </div>
  );
};

