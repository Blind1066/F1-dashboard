import React from "react";
import type { DriverStanding, TeamStanding } from "../types";
import { DriverRow } from "./DriverRow";
import { SkeletonRows } from "./Skeleton";
import { TeamRow } from "./TeamRow";

interface StandingsTableProps {
  drivers: DriverStanding[];
  teams: TeamStanding[];
  loading?: boolean;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  drivers,
  teams,
  loading = false,
}) => {
  const maxDriverPts = drivers[0] ? drivers[0].points || 1 : 1;
  const maxTeamPts = teams[0] ? teams[0].points || 1 : 1;

  return (
    <div className="grid">
      {/* Drivers Table */}
      <section className="card" aria-labelledby="drv-h">
        <header className="card-head">
          <h2 id="drv-h">Drivers' Championship</h2>
          <span className="chip">{loading ? "Loading…" : `${drivers.length} drivers`}</span>
        </header>
        <div className="table" role="table" aria-label="Driver standings">
          {loading ? (
            <SkeletonRows count={8} />
          ) : (
            <>
              <div className="row head" role="row">
                <span>Pos</span>
                <span></span>
                <span>Driver</span>
                <span className="num">Pts</span>
              </div>
              {drivers.map((d) => (
                <DriverRow key={d.acronym || d.name} driver={d} maxPoints={maxDriverPts} />
              ))}
            </>
          )}
        </div>
      </section>

      {/* Constructors Table */}
      <section className="card" aria-labelledby="con-h">
        <header className="card-head">
          <h2 id="con-h">Constructors' Championship</h2>
          <span className="chip">{loading ? "Loading…" : `${teams.length} teams`}</span>
        </header>
        <div className="table" role="table" aria-label="Constructor standings">
          {loading ? (
            <SkeletonRows count={8} />
          ) : (
            <>
              <div className="row head" role="row">
                <span>Pos</span>
                <span></span>
                <span>Team</span>
                <span className="num">Pts</span>
              </div>
              {teams.map((t) => (
                <TeamRow key={t.constructorId || t.name} team={t} maxPoints={maxTeamPts} />
              ))}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

