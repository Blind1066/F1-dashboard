import type { LiveDriverTiming, LiveRaceSessionState, ScheduleRace } from "../types";
import { DEMO_HEADSHOTS } from "./demo";
import { colourFor } from "./jolpica";

export const INITIAL_LIVE_DRIVERS: Array<{
  number: string;
  code: string;
  name: string;
  team: string;
  teamId: string;
  grid: number;
  baseGap: number;
  lastLap: string;
  bestLap: string;
  isFastestLap?: boolean;
  tyre: "soft" | "medium" | "hard";
  tyreAge: number;
  pitStops: number;
}> = [
  { number: "1", code: "NOR", name: "Lando Norris", team: "McLaren", teamId: "mclaren", grid: 1, baseGap: 0, lastLap: "1:11.412", bestLap: "1:10.540", isFastestLap: true, tyre: "medium", tyreAge: 19, pitStops: 1 },
  { number: "3", code: "VER", name: "Max Verstappen", team: "Red Bull", teamId: "red_bull", grid: 2, baseGap: 1.482, lastLap: "1:11.605", bestLap: "1:10.718", tyre: "medium", tyreAge: 19, pitStops: 1 },
  { number: "16", code: "LEC", name: "Charles Leclerc", team: "Ferrari", teamId: "ferrari", grid: 3, baseGap: 4.810, lastLap: "1:11.792", bestLap: "1:10.822", tyre: "hard", tyreAge: 24, pitStops: 1 },
  { number: "81", code: "PIA", name: "Oscar Piastri", team: "McLaren", teamId: "mclaren", grid: 5, baseGap: 6.230, lastLap: "1:11.530", bestLap: "1:10.690", tyre: "medium", tyreAge: 19, pitStops: 1 },
  { number: "63", code: "RUS", name: "George Russell", team: "Mercedes", teamId: "mercedes", grid: 4, baseGap: 9.740, lastLap: "1:11.884", bestLap: "1:10.950", tyre: "hard", tyreAge: 26, pitStops: 1 },
  { number: "12", code: "ANT", name: "Andrea Kimi Antonelli", team: "Mercedes", teamId: "mercedes", grid: 6, baseGap: 14.120, lastLap: "1:11.950", bestLap: "1:11.020", tyre: "hard", tyreAge: 22, pitStops: 1 },
  { number: "44", code: "HAM", name: "Lewis Hamilton", team: "Ferrari", teamId: "ferrari", grid: 7, baseGap: 18.590, lastLap: "1:12.104", bestLap: "1:11.140", tyre: "medium", tyreAge: 15, pitStops: 2 },
  { number: "6", code: "HAD", name: "Isack Hadjar", team: "Red Bull", teamId: "red_bull", grid: 8, baseGap: 24.310, lastLap: "1:12.380", bestLap: "1:11.450", tyre: "medium", tyreAge: 18, pitStops: 1 },
  { number: "30", code: "LAW", name: "Liam Lawson", team: "RB F1 Team", teamId: "rb", grid: 10, baseGap: 31.850, lastLap: "1:12.550", bestLap: "1:11.620", tyre: "hard", tyreAge: 25, pitStops: 1 },
  { number: "41", code: "LIN", name: "Arvid Lindblad", team: "RB F1 Team", teamId: "rb", grid: 11, baseGap: 36.420, lastLap: "1:12.610", bestLap: "1:11.780", tyre: "medium", tyreAge: 16, pitStops: 1 },
  { number: "10", code: "GAS", name: "Pierre Gasly", team: "Alpine F1 Team", teamId: "alpine", grid: 9, baseGap: 42.190, lastLap: "1:12.830", bestLap: "1:11.890", tyre: "hard", tyreAge: 28, pitStops: 1 },
  { number: "43", code: "COL", name: "Franco Colapinto", team: "Alpine F1 Team", teamId: "alpine", grid: 12, baseGap: 47.950, lastLap: "1:12.920", bestLap: "1:12.010", tyre: "medium", tyreAge: 17, pitStops: 1 },
  { number: "87", code: "BEA", name: "Oliver Bearman", team: "Haas F1 Team", teamId: "haas", grid: 13, baseGap: 53.640, lastLap: "1:13.110", bestLap: "1:12.180", tyre: "hard", tyreAge: 23, pitStops: 1 },
  { number: "31", code: "OCO", name: "Esteban Ocon", team: "Haas F1 Team", teamId: "haas", grid: 15, baseGap: 59.200, lastLap: "1:13.250", bestLap: "1:12.330", tyre: "medium", tyreAge: 14, pitStops: 2 },
  { number: "55", code: "SAI", name: "Carlos Sainz", team: "Williams", teamId: "williams", grid: 14, baseGap: 64.780, lastLap: "1:13.380", bestLap: "1:12.440", tyre: "hard", tyreAge: 27, pitStops: 1 },
  { number: "23", code: "ALB", name: "Alexander Albon", team: "Williams", teamId: "williams", grid: 16, baseGap: 71.420, lastLap: "1:13.490", bestLap: "1:12.560", tyre: "medium", tyreAge: 15, pitStops: 2 },
  { number: "14", code: "ALO", name: "Fernando Alonso", team: "Aston Martin", teamId: "aston_martin", grid: 17, baseGap: 78.110, lastLap: "1:13.620", bestLap: "1:12.680", tyre: "hard", tyreAge: 31, pitStops: 1 },
  { number: "5", code: "BOR", name: "Gabriel Bortoleto", team: "Audi", teamId: "audi", grid: 18, baseGap: 85.340, lastLap: "1:13.800", bestLap: "1:12.820", tyre: "medium", tyreAge: 18, pitStops: 1 },
  { number: "27", code: "HUL", name: "Nico Hülkenberg", team: "Audi", teamId: "audi", grid: 19, baseGap: 93.650, lastLap: "1:13.940", bestLap: "1:12.980", tyre: "hard", tyreAge: 29, pitStops: 1 },
  { number: "77", code: "BOT", name: "Valtteri Bottas", team: "Cadillac F1 Team", teamId: "cadillac", grid: 20, baseGap: 104.200, lastLap: "1:14.210", bestLap: "1:13.250", tyre: "medium", tyreAge: 12, pitStops: 2 },
];

export function createInitialLiveSession(race?: ScheduleRace | null): LiveRaceSessionState {
  const round = race?.round || 20;
  const raceName = race?.name || "Brazilian Grand Prix";
  const circuitName = race?.circuit.name || "Autódromo José Carlos Pace";
  const totalLaps = 71;
  const currentLap = 48;

  let prevGap = 0;
  const drivers: LiveDriverTiming[] = INITIAL_LIVE_DRIVERS.map((d, index) => {
    const pos = index + 1;
    const delta = d.grid - pos;
    const gapSec = d.baseGap;
    const gap = pos === 1 ? "LEADER" : `+${gapSec.toFixed(3)}s`;
    const intervalSec = pos === 1 ? 0 : Math.max(0.1, gapSec - prevGap);
    const interval = pos === 1 ? "LEADER" : `+${intervalSec.toFixed(3)}s`;
    prevGap = gapSec;

    return {
      position: pos,
      delta: delta,
      number: d.number,
      code: d.code,
      name: d.name,
      team: d.team,
      teamId: d.teamId,
      colour: colourFor(d.teamId),
      headshot: DEMO_HEADSHOTS[d.code] || "",
      gap,
      interval,
      lastLap: d.lastLap,
      fastestLap: d.bestLap,
      isFastestLap: !!d.isFastestLap,
      tyre: d.tyre,
      tyreAge: d.tyreAge,
      pitStops: d.pitStops,
      status: "active",
      sector1: (18.2 + Math.random() * 0.4).toFixed(3),
      sector2: (32.1 + Math.random() * 0.6).toFixed(3),
      sector3: (20.8 + Math.random() * 0.4).toFixed(3),
    };
  });

  return {
    round,
    raceName,
    circuitName,
    currentLap,
    totalLaps,
    status: "GREEN FLAG",
    fastestLapDriver: "Lando Norris (NOR)",
    fastestLapTime: "1:10.540",
    fastestLapLap: 41,
    trackTemp: "41.8°C",
    airTemp: "27.5°C",
    humidity: "58%",
    drivers,
  };
}

/**
 * Simulates real-time live telemetry tick:
 * Updates gap fractions, sector speeds, and occasionally increments the lap.
 */
export function tickLiveSession(prev: LiveRaceSessionState): LiveRaceSessionState {
  let nextLap = prev.currentLap;
  // Slowly advance laps (every ~10 ticks or random chance)
  if (Math.random() > 0.82 && nextLap < prev.totalLaps) {
    nextLap += 1;
  }

  let runningGap = 0;
  const updatedDrivers: LiveDriverTiming[] = prev.drivers.map((d, index) => {
    const pos = index + 1;
    let gapSec = index === 0 ? 0 : runningGap + Math.max(0.2, (index * 2.1) + ((Math.random() - 0.5) * 0.3));
    runningGap = gapSec;

    // Small jitter to last lap time
    const [min, secMs] = d.lastLap.split(":");
    const curSec = parseFloat(secMs || "12.0");
    const jitteredSec = Math.max(10.8, Math.min(14.5, curSec + (Math.random() - 0.5) * 0.25)).toFixed(3);
    const newLastLap = `${min}:${jitteredSec}`;

    const gap = pos === 1 ? "LEADER" : `+${gapSec.toFixed(3)}s`;
    const intervalSec = pos === 1 ? 0 : Math.max(0.18, 0.4 + (Math.random() * 1.5));
    const interval = pos === 1 ? "LEADER" : `+${intervalSec.toFixed(3)}s`;

    return {
      ...d,
      position: pos,
      gap,
      interval,
      lastLap: newLastLap,
      sector1: (18.1 + Math.random() * 0.45).toFixed(3),
      sector2: (32.0 + Math.random() * 0.55).toFixed(3),
      sector3: (20.7 + Math.random() * 0.45).toFixed(3),
    };
  });

  return {
    ...prev,
    currentLap: nextLap,
    drivers: updatedDrivers,
  };
}
