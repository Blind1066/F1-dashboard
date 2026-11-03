import type { FullRaceDetails, Race, RaceResultRow, ScheduleRace, StandingsData } from "../types";
import {
  colourFor,
  COUNTRY_FLAGS,
  COUNTRY_TIMEZONES,
  flagUrlFor,
  formatSessionTimes,
  getTimeDifferenceText,
  logoFor,
} from "./jolpica";

export const DEMO_LOGOS: Record<string, string> = {
  mercedes: "/assets/logos/mercedes.svg",
  ferrari: "/assets/logos/ferrari.svg",
  red_bull: "/assets/logos/red_bull.svg",
  mclaren: "/assets/logos/mclaren.svg",
  rb: "/assets/logos/rb.svg",
  alpine: "/assets/logos/alpine.svg",
  haas: "/assets/logos/haas.svg",
  audi: "/assets/logos/audi.svg",
  williams: "/assets/logos/williams.svg",
  aston_martin: "/assets/logos/aston_martin.svg",
  cadillac: "/assets/logos/cadillac.svg",
};

export const DEMO_HEADSHOTS: Record<string, string> = {
  LIN: "/assets/headshots/lindblad.jpg",
  OCO: "/assets/headshots/ocon.jpg",
  TSU: "/assets/headshots/tsunoda.jpg",
  HIR: "/assets/headshots/hirakawa.jpg",
  ANT: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/ANDANT01_Kimi_Antonelli/andant01.png.transform/1col/image.png",
  VER: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/1col/image.png",
  HAM: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/1col/image.png",
  RUS: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/1col/image.png",
  LEC: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/1col/image.png",
  NOR: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/1col/image.png",
  PIA: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/1col/image.png",
  HAD: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png.transform/1col/image.png",
  LAW: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png.transform/1col/image.png",
  GAS: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/1col/image.png",
  COL: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png.transform/1col/image.png",
  BEA: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png.transform/1col/image.png",
  BOR: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png.transform/1col/image.png",
  HUL: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/1col/image.png",
  ALO: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/1col/image.png",
  SAI: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/1col/image.png",
  ALB: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png.transform/1col/image.png",
  STR: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/1col/image.png",
  BOT: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png.transform/1col/image.png",
  PER: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/1col/image.png",
};

// Raw demo drivers [position, number, name, acronym, team, colour, points, wins, constructorId]
const RAW_DRIVERS: Array<[number, number, string, string, string, string, number, number, string]> = [
  [1, 12, "Andrea Kimi Antonelli", "ANT", "Mercedes", "27F4D2", 380, 9, "mercedes"],
  [2, 3, "Max Verstappen", "VER", "Red Bull", "3671C6", 261, 3, "red_bull"],
  [3, 44, "Lewis Hamilton", "HAM", "Ferrari", "E8002D", 259, 1, "ferrari"],
  [4, 63, "George Russell", "RUS", "Mercedes", "27F4D2", 250, 3, "mercedes"],
  [5, 16, "Charles Leclerc", "LEC", "Ferrari", "E8002D", 245, 1, "ferrari"],
  [6, 1, "Lando Norris", "NOR", "McLaren", "FF8000", 221, 2, "mclaren"],
  [7, 81, "Oscar Piastri", "PIA", "McLaren", "FF8000", 144, 0, "mclaren"],
  [8, 6, "Isack Hadjar", "HAD", "Red Bull", "3671C6", 107, 0, "red_bull"],
  [9, 30, "Liam Lawson", "LAW", "RB F1 Team", "6692FF", 83, 0, "rb"],
  [10, 10, "Pierre Gasly", "GAS", "Alpine F1 Team", "2293D1", 42, 0, "alpine"],
  [11, 41, "Arvid Lindblad", "LIN", "RB F1 Team", "6692FF", 38, 0, "rb"],
  [12, 43, "Franco Colapinto", "COL", "Alpine F1 Team", "2293D1", 27, 0, "alpine"],
  [13, 87, "Oliver Bearman", "BEA", "Haas F1 Team", "B6BABD", 23, 0, "haas"],
  [14, 5, "Gabriel Bortoleto", "BOR", "Audi", "F50537", 14, 0, "audi"],
  [15, 27, "Nico Hülkenberg", "HUL", "Audi", "F50537", 13, 0, "audi"],
  [16, 31, "Esteban Ocon", "OCO", "Haas F1 Team", "B6BABD", 7, 0, "haas"],
  [17, 14, "Fernando Alonso", "ALO", "Aston Martin", "229971", 7, 0, "aston_martin"],
  [18, 55, "Carlos Sainz", "SAI", "Williams", "64C4FF", 7, 0, "williams"],
  [19, 23, "Alexander Albon", "ALB", "Williams", "64C4FF", 5, 0, "williams"],
  [20, 22, "Yuki Tsunoda", "TSU", "RB F1 Team", "6692FF", 1, 0, "rb"],
  [21, 50, "Ryo Hirakawa", "HIR", "Haas F1 Team", "B6BABD", 1, 0, "haas"],
  [22, 18, "Lance Stroll", "STR", "Aston Martin", "229971", 0, 0, "aston_martin"],
  [23, 77, "Valtteri Bottas", "BOT", "Cadillac F1 Team", "C9A24B", 0, 0, "cadillac"],
  [24, 11, "Sergio Pérez", "PER", "Cadillac F1 Team", "C9A24B", 0, 0, "cadillac"],
];

const RAW_TEAMS: Array<[string, string, string, number, number]> = [
  ["Mercedes", "mercedes", "27F4D2", 630, 12],
  ["Ferrari", "ferrari", "E8002D", 504, 2],
  ["Red Bull", "red_bull", "3671C6", 382, 3],
  ["McLaren", "mclaren", "FF8000", 365, 2],
  ["RB F1 Team", "rb", "6692FF", 108, 0],
  ["Alpine F1 Team", "alpine", "2293D1", 69, 0],
  ["Haas F1 Team", "haas", "B6BABD", 31, 0],
  ["Audi", "audi", "F50537", 27, 0],
  ["Williams", "williams", "64C4FF", 12, 0],
  ["Aston Martin", "aston_martin", "229971", 7, 0],
  ["Cadillac F1 Team", "cadillac", "C9A24B", 0, 0],
];

export const DEMO_RACES: Race[] = [
  { round: 23, name: "Abu Dhabi Grand Prix", country: "UAE", date: "2026-12-06", time: "13:00:00Z" },
  { round: 22, name: "Qatar Grand Prix", country: "Qatar", date: "2026-11-29", time: "16:00:00Z" },
  { round: 21, name: "Las Vegas Grand Prix", country: "USA", date: "2026-11-22", time: "04:00:00Z" },
  { round: 20, name: "Brazilian Grand Prix", country: "Brazil", date: "2026-11-08", time: "17:00:00Z" },
  { round: 19, name: "Mexico City Grand Prix", country: "Mexico", date: "2026-11-01", time: "20:00:00Z" },
  { round: 18, name: "United States Grand Prix", country: "USA", date: "2026-10-25", time: "20:00:00Z" },
  { round: 17, name: "Singapore Grand Prix", country: "Singapore", date: "2026-10-11", time: "12:00:00Z" },
  { round: 16, name: "Bahrain Grand Prix in Malaysia", country: "Malaysia", date: "2026-10-04", time: "07:00:00Z" },
  { round: 15, name: "Azerbaijan Grand Prix", country: "Azerbaijan", date: "2026-09-26", time: "11:00:00Z" },
  { round: 14, name: "Spanish Grand Prix", country: "Spain", date: "2026-09-13", time: "13:00:00Z" },
  { round: 13, name: "Italian Grand Prix", country: "Italy", date: "2026-09-06", time: "13:00:00Z" },
  { round: 12, name: "Dutch Grand Prix", country: "Netherlands", date: "2026-08-23", time: "13:00:00Z" },
  { round: 11, name: "Hungarian Grand Prix", country: "Hungary", date: "2026-07-26", time: "13:00:00Z" },
  { round: 10, name: "Belgian Grand Prix", country: "Belgium", date: "2026-07-19", time: "13:00:00Z" },
  { round: 9, name: "British Grand Prix", country: "UK", date: "2026-07-05", time: "14:00:00Z" },
  { round: 8, name: "Austrian Grand Prix", country: "Austria", date: "2026-06-28", time: "13:00:00Z" },
  { round: 7, name: "Barcelona Grand Prix", country: "Spain", date: "2026-06-14", time: "13:00:00Z" },
  { round: 6, name: "Monaco Grand Prix", country: "Monaco", date: "2026-06-07", time: "13:00:00Z" },
  { round: 5, name: "Canadian Grand Prix", country: "Canada", date: "2026-05-24", time: "20:00:00Z" },
  { round: 4, name: "Miami Grand Prix", country: "USA", date: "2026-05-03", time: "20:00:00Z" },
  { round: 3, name: "Japanese Grand Prix", country: "Japan", date: "2026-03-29", time: "05:00:00Z" },
  { round: 2, name: "Chinese Grand Prix", country: "China", date: "2026-03-15", time: "07:00:00Z" },
  { round: 1, name: "Australian Grand Prix", country: "Australia", date: "2026-03-08", time: "04:00:00Z" },
];

export const DEMO_STANDINGS: StandingsData = {
  drivers: RAW_DRIVERS.map((r) => ({
    position: r[0],
    delta: 0,
    number: r[1],
    name: r[2],
    acronym: r[3],
    team: r[4],
    teamId: r[8],
    colour: "#" + r[5],
    points: r[6],
    gained: 0,
    wins: r[7],
    headshot: DEMO_HEADSHOTS[r[3]] || "",
    logo: DEMO_LOGOS[r[8]] || "",
  })),
  teams: RAW_TEAMS.map((r, i) => ({
    position: i + 1,
    delta: 0,
    name: r[0],
    constructorId: r[1],
    colour: "#" + r[2],
    points: r[3],
    wins: r[4],
    gained: 0,
    logo: DEMO_LOGOS[r[1]] || "",
  })),
};

export function getDemoSchedule(): ScheduleRace[] {
  const now = Date.now();
  // Sort 1 to 23
  const sorted = [...DEMO_RACES].sort((a, b) => a.round - b.round);

  return sorted.map((r) => {
    const trackTz = COUNTRY_TIMEZONES[r.country] || "UTC";
    const flag = COUNTRY_FLAGS[r.country] || "🏁";
    const flagUrl = flagUrlFor(r.country);
    const iso = `${r.date}T${r.time || "14:00:00Z"}`;
    const raceTimes = formatSessionTimes(iso, trackTz)!;
    const isCompleted = raceTimes.date.getTime() <= now;

    // Build dummy sessions around race day
    const raceDate = new Date(iso);
    const p1Date = new Date(raceDate.getTime() - 48 * 3600 * 1000);
    const qualDate = new Date(raceDate.getTime() - 24 * 3600 * 1000);

    const fp1Iso = p1Date.toISOString();
    const qualIso = qualDate.toISOString();

    return {
      round: r.round,
      name: r.name,
      circuit: {
        id: r.name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
        name: `${r.name.replace(" Grand Prix", "")} Circuit`,
        city: r.country,
        country: r.country,
        timezone: trackTz,
        flag: flag,
        flagUrl: flagUrl,
      },
      date: r.date,
      time: r.time,
      raceTimes: raceTimes,
      diffText: getTimeDifferenceText(trackTz, raceTimes.date),
      isCompleted: isCompleted,
      winner: isCompleted
        ? {
            driver: "Andrea Kimi Antonelli",
            code: "ANT",
            team: "Mercedes",
            time: "1:28:45.123",
            colour: colourFor("mercedes"),
            logo: logoFor("mercedes"),
          }
        : null,
      sessions: [
        {
          name: "Practice 1",
          type: "fp",
          times: formatSessionTimes(fp1Iso, trackTz)!,
        },
        {
          name: "Qualifying",
          type: "qual",
          times: formatSessionTimes(qualIso, trackTz)!,
        },
        {
          name: "Grand Prix",
          type: "race",
          isMain: true,
          times: raceTimes,
        },
      ],
    };
  });
}

export function getDemoRaceResults(round: number): FullRaceDetails {
  const race = DEMO_RACES.find((r) => r.round === round) || DEMO_RACES[DEMO_RACES.length - 1];
  const ptsScale = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

  const results: RaceResultRow[] = DEMO_STANDINGS.drivers.slice(0, 20).map((d, idx) => {
    const pos = idx + 1;
    const grid = (idx % 3 === 0 ? pos + 1 : idx % 2 === 0 ? pos - 1 : pos) || 1;
    const pts = ptsScale[idx] || 0;
    const gap = idx === 0 ? "1:24:12.450" : `+${(idx * 2.854 + 1.2).toFixed(3)}s`;

    return {
      position: pos,
      positionText: String(pos),
      points: pts + (idx === 0 ? 1 : 0),
      grid: grid,
      delta: grid - pos,
      laps: 58,
      status: "Finished",
      time: gap,
      fastestLap: idx === 0 ? { rank: 1, lap: 52, time: "1:21.843" } : undefined,
      driver: {
        id: d.acronym.toLowerCase(),
        code: d.acronym,
        number: String(d.number),
        name: d.name,
        headshot: d.headshot,
        nationality: "FIA",
      },
      team: {
        id: d.teamId,
        name: d.team,
        colour: d.colour,
        logo: d.logo,
      },
    };
  });

  return {
    round: race.round,
    raceName: race.name,
    circuitName: `${race.name.replace(" Grand Prix", "")} Circuit`,
    locality: race.country,
    country: race.country,
    date: race.date,
    flagUrl: flagUrlFor(race.country),
    results,
    qualifying: DEMO_STANDINGS.drivers.slice(0, 15).map((d, i) => ({
      position: i + 1,
      driver: {
        id: d.acronym.toLowerCase(),
        code: d.acronym,
        number: String(d.number),
        name: d.name,
        headshot: d.headshot,
      },
      team: {
        id: d.teamId,
        name: d.team,
        colour: d.colour,
        logo: d.logo,
      },
      q1: "1:20.124",
      q2: "1:19.450",
      q3: "1:18.892",
    })),
  };
}


