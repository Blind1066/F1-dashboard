import type {
  DriverStanding,
  FullRaceDetails,
  JolpicaConstructorStandingRaw,
  JolpicaDriverStandingRaw,
  JolpicaMRData,
  JolpicaRace,
  QualifyingResultRow,
  Race,
  RaceResultRow,
  RaceSession,
  RaceWinner,
  ScheduleRace,
  SessionTiming,
  StandingsData,
  TeamStanding,
} from "../types";
import { getHeadshots } from "./openf1";

const BASE = "https://api.jolpi.ca/ergast/f1";
const requestCache = new Map<string, Promise<unknown>>();

async function get<T>(path: string): Promise<T> {
  if (requestCache.has(path)) {
    return requestCache.get(path) as Promise<T>;
  }
  const promise = (async () => {
    const res = await fetch(`${BASE}/${path}.json?limit=100`);
    if (!res.ok) {
      throw new Error(`Jolpica ${path} failed (${res.status})`);
    }
    const json = (await res.json()) as JolpicaMRData<T>;
    return json.MRData;
  })();

  requestCache.set(path, promise);
  // Do not retain failed requests in cache
  promise.catch(() => requestCache.delete(path));
  return promise;
}

export const TEAM_COLOURS: Record<string, string> = {
  mclaren: "#FF8000",
  ferrari: "#E8002D",
  mercedes: "#27F4D2",
  red_bull: "#3671C6",
  williams: "#64C4FF",
  aston_martin: "#229971",
  alpine: "#2293D1",
  haas: "#B6BABD",
  rb: "#6692FF",
  alphatauri: "#5E8FAA",
  toro_rosso: "#469BFF",
  sauber: "#52E252",
  audi: "#F50537",
  cadillac: "#C9A24B",
  alfa: "#B12039",
  renault: "#FFF500",
  racing_point: "#F596C8",
  force_india: "#F596C8",
  lotus_f1: "#FFB800",
};

export function colourFor(id: string): string {
  if (id && TEAM_COLOURS[id]) return TEAM_COLOURS[id];
  let h = 0;
  for (const c of String(id || "")) {
    h = (h * 31 + c.charCodeAt(0)) % 360;
  }
  return `hsl(${h} 60% 55%)`;
}

export const TEAM_LOGOS: Record<string, string> = {
  mclaren: "/assets/logos/mclaren.svg",
  ferrari: "/assets/logos/ferrari.svg",
  red_bull: "/assets/logos/red_bull.svg",
  mercedes: "/assets/logos/mercedes.svg",
  aston_martin: "/assets/logos/aston_martin.svg",
  alpine: "/assets/logos/alpine.svg",
  haas: "/assets/logos/haas.svg",
  rb: "/assets/logos/rb.svg",
  alphatauri: "/assets/logos/alphatauri.svg",
  toro_rosso: "/assets/logos/toro_rosso.svg",
  williams: "/assets/logos/williams.svg",
  sauber: "/assets/logos/sauber.svg",
  alfa: "/assets/logos/alfa.svg",
  renault: "/assets/logos/renault.svg",
  racing_point: "/assets/logos/racing_point.svg",
  force_india: "/assets/logos/force_india.svg",
  audi: "/assets/logos/audi.svg",
  cadillac: "/assets/logos/cadillac.svg",
  lotus_f1: "/assets/logos/lotus_f1.svg",
};

export function logoFor(id?: string, name?: string): string {
  if (id && TEAM_LOGOS[id]) return TEAM_LOGOS[id];
  const n = String(name || "").toLowerCase();
  if (n.includes("mclaren")) return TEAM_LOGOS.mclaren;
  if (n.includes("ferrari")) return TEAM_LOGOS.ferrari;
  if (n.includes("red bull")) return TEAM_LOGOS.red_bull;
  if (n.includes("mercedes")) return TEAM_LOGOS.mercedes;
  if (n.includes("aston")) return TEAM_LOGOS.aston_martin;
  if (n.includes("alpine")) return TEAM_LOGOS.alpine;
  if (n.includes("haas")) return TEAM_LOGOS.haas;
  if (n.includes("racing bull") || n.includes("cash app") || n.includes("rb f1") || n === "rb") return TEAM_LOGOS.rb;
  if (n.includes("alphatauri")) return TEAM_LOGOS.alphatauri;
  if (n.includes("toro rosso")) return TEAM_LOGOS.toro_rosso;
  if (n.includes("williams")) return TEAM_LOGOS.williams;
  if (n.includes("kick") || n.includes("sauber")) return TEAM_LOGOS.sauber;
  if (n.includes("alfa")) return TEAM_LOGOS.alfa;
  if (n.includes("renault")) return TEAM_LOGOS.renault;
  if (n.includes("racing point")) return TEAM_LOGOS.racing_point;
  if (n.includes("force india")) return TEAM_LOGOS.force_india;
  if (n.includes("audi")) return TEAM_LOGOS.audi;
  if (n.includes("cadillac")) return TEAM_LOGOS.cadillac;
  if (n.includes("lotus")) return TEAM_LOGOS.lotus_f1;
  return "";
}

export const DRIVER_HEADSHOTS: Record<string, string> = {
  LIN: "/assets/headshots/lindblad.jpg",
  arvid_lindblad: "/assets/headshots/lindblad.jpg",
  OCO: "/assets/headshots/ocon.jpg",
  ocon: "/assets/headshots/ocon.jpg",
  TSU: "/assets/headshots/tsunoda.jpg",
  tsunoda: "/assets/headshots/tsunoda.jpg",
  HIR: "/assets/headshots/hirakawa.jpg",
  ryo_hirakawa: "/assets/headshots/hirakawa.jpg",
};

export function headshotFor(code?: string, id?: string, name?: string): string {
  if (code && DRIVER_HEADSHOTS[code]) return DRIVER_HEADSHOTS[code];
  if (id && DRIVER_HEADSHOTS[id]) return DRIVER_HEADSHOTS[id];
  const n = String(name || "").toLowerCase();
  if (n.includes("lindblad") || n.includes("linblad")) return DRIVER_HEADSHOTS.LIN;
  if (n.includes("ocon")) return DRIVER_HEADSHOTS.OCO;
  if (n.includes("tsunoda")) return DRIVER_HEADSHOTS.TSU;
  if (n.includes("hirakawa")) return DRIVER_HEADSHOTS.HIR;
  return "";
}

interface RacesMRData {
  RaceTable: {
    Races?: JolpicaRace[];
  };
}

/** Completed rounds of a season, oldest -> newest. */
export async function getRaces(year: number): Promise<Race[]> {
  const data = await get<RacesMRData>(String(year));
  const now = Date.now();
  return (data.RaceTable?.Races || [])
    .filter((r) => new Date(`${r.date}T${r.time || "23:59:59Z"}`).getTime() <= now)
    .map((r) => ({
      round: Number(r.round),
      name: r.raceName,
      country: r.Circuit?.Location?.country || "",
      date: r.date,
      time: r.time,
    }));
}

interface StandingsResponseRaw {
  StandingsTable: {
    StandingsLists?: Array<{
      DriverStandings?: JolpicaDriverStandingRaw[];
      ConstructorStandings?: JolpicaConstructorStandingRaw[];
    }>;
  };
}

async function standingsLists(year: number, round: number) {
  if (round < 1) return { drivers: [], teams: [] };
  const [d, t] = await Promise.all([
    get<StandingsResponseRaw>(`${year}/${round}/driverStandings`),
    get<StandingsResponseRaw>(`${year}/${round}/constructorStandings`),
  ]);
  return {
    drivers: d.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [],
    teams: t.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [],
  };
}

/** Standings after `round`, with position / points change vs the previous round. */
export async function getStandings(year: number, round: number): Promise<StandingsData> {
  const [cur, prev, faces] = await Promise.all([
    standingsLists(year, round),
    standingsLists(year, round - 1),
    getHeadshots(year),
  ]);

  const prevD = new Map<string, JolpicaDriverStandingRaw>(
    prev.drivers.map((x) => [x.Driver.driverId, x])
  );
  const prevT = new Map<string, JolpicaConstructorStandingRaw>(
    prev.teams.map((x) => [x.Constructor.constructorId, x])
  );

  const drivers: DriverStanding[] = cur.drivers.map((x) => {
    const p = prevD.get(x.Driver.driverId);
    const team = x.Constructors[x.Constructors.length - 1] || { constructorId: "", name: "" };
    const pos = Number(x.position || x.positionText || 0);
    const pts = Number(x.points || 0);
    const code = x.Driver.code || x.Driver.familyName.slice(0, 3).toUpperCase();
    const fullName = `${x.Driver.givenName} ${x.Driver.familyName}`.trim();

    return {
      position: pos,
      delta: p ? Number(p.position || p.positionText || pos) - pos : 0,
      points: pts,
      gained: pts - (p ? Number(p.points || 0) : 0),
      wins: Number(x.wins || 0),
      number: x.Driver.permanentNumber || "",
      name: fullName,
      acronym: code,
      team: team.name || "",
      teamId: team.constructorId || "",
      colour: colourFor(team.constructorId),
      logo: logoFor(team.constructorId, team.name),
      headshot: headshotFor(x.Driver.code, x.Driver.driverId, fullName) || faces.get(code) || "",
    };
  });

  const teams: TeamStanding[] = cur.teams.map((x) => {
    const p = prevT.get(x.Constructor.constructorId);
    const pos = Number(x.position || x.positionText || 0);
    const pts = Number(x.points || 0);

    return {
      position: pos,
      delta: p ? Number(p.position || p.positionText || pos) - pos : 0,
      points: pts,
      gained: pts - (p ? Number(p.points || 0) : 0),
      wins: Number(x.wins || 0),
      name: x.Constructor.name,
      constructorId: x.Constructor.constructorId,
      colour: colourFor(x.Constructor.constructorId),
      logo: logoFor(x.Constructor.constructorId, x.Constructor.name),
    };
  });

  return { drivers, teams };
}

export const CIRCUIT_TIMEZONES: Record<string, string> = {
  albert_park: "Australia/Melbourne",
  shanghai: "Asia/Shanghai",
  suzuka: "Asia/Tokyo",
  miami: "America/New_York",
  villeneuve: "America/Toronto",
  monaco: "Europe/Monaco",
  catalunya: "Europe/Madrid",
  red_bull_ring: "Europe/Vienna",
  silverstone: "Europe/London",
  spa: "Europe/Brussels",
  hungaroring: "Europe/Budapest",
  zandvoort: "Europe/Amsterdam",
  monza: "Europe/Rome",
  madring: "Europe/Madrid",
  madrid: "Europe/Madrid",
  baku: "Asia/Baku",
  sepang: "Asia/Kuala_Lumpur",
  marina_bay: "Asia/Singapore",
  americas: "America/Chicago",
  rodriguez: "America/Mexico_City",
  interlagos: "America/Sao_Paulo",
  vegas: "America/Los_Angeles",
  losail: "Asia/Qatar",
  yas_marina: "Asia/Dubai",
  jeddah: "Asia/Riyadh",
  bahrain: "Asia/Bahrain",
};

export const COUNTRY_TIMEZONES: Record<string, string> = {
  Australia: "Australia/Melbourne",
  China: "Asia/Shanghai",
  Japan: "Asia/Tokyo",
  USA: "America/New_York",
  Canada: "America/Toronto",
  Monaco: "Europe/Monaco",
  Spain: "Europe/Madrid",
  Austria: "Europe/Vienna",
  UK: "Europe/London",
  Belgium: "Europe/Brussels",
  Hungary: "Europe/Budapest",
  Netherlands: "Europe/Amsterdam",
  Italy: "Europe/Rome",
  Azerbaijan: "Asia/Baku",
  Malaysia: "Asia/Kuala_Lumpur",
  Singapore: "Asia/Singapore",
  Mexico: "America/Mexico_City",
  Brazil: "America/Sao_Paulo",
  Qatar: "Asia/Qatar",
  UAE: "Asia/Dubai",
  "Saudi Arabia": "Asia/Riyadh",
  Bahrain: "Asia/Bahrain",
};

export const COUNTRY_FLAGS: Record<string, string> = {
  Australia: "🇦🇺",
  China: "🇨🇳",
  Japan: "🇯🇵",
  USA: "🇺🇸",
  Canada: "🇨🇦",
  Monaco: "🇲🇨",
  Spain: "🇪🇸",
  Austria: "🇦🇹",
  UK: "🇬🇧",
  Belgium: "🇧🇪",
  Hungary: "🇭🇺",
  Netherlands: "🇳🇱",
  Italy: "🇮🇹",
  Azerbaijan: "🇦🇿",
  Malaysia: "🇲🇾",
  Singapore: "🇸🇬",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Qatar: "🇶🇦",
  UAE: "🇦🇪",
  "Saudi Arabia": "🇸🇦",
  Bahrain: "🇧🇭",
};

export const COUNTRY_CODES: Record<string, string> = {
  Australia: "au",
  China: "cn",
  Japan: "jp",
  USA: "us",
  "United States": "us",
  Canada: "ca",
  Monaco: "mc",
  Spain: "es",
  Austria: "at",
  UK: "gb",
  "United Kingdom": "gb",
  "Great Britain": "gb",
  Belgium: "be",
  Hungary: "hu",
  Netherlands: "nl",
  Italy: "it",
  Azerbaijan: "az",
  Malaysia: "my",
  Singapore: "sg",
  Mexico: "mx",
  Brazil: "br",
  Qatar: "qa",
  UAE: "ae",
  "United Arab Emirates": "ae",
  "Saudi Arabia": "sa",
  Bahrain: "bh",
};

/** High-res flag from flagcdn.com */
export function flagUrlFor(country: string): string {
  const code = COUNTRY_CODES[country] || "";
  return code ? `https://flagcdn.com/w40/${code}.png` : "";
}

export function formatSessionTimes(isoString: string, trackTz: string): SessionTiming | null {
  if (!isoString) return null;
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return null;

  const localDate = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);

  const localTime = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);

  const localTzParts = new Intl.DateTimeFormat(undefined, {
    timeZoneName: "short",
  }).formatToParts(d);
  const localTzName = localTzParts.find((p) => p.type === "timeZoneName")?.value || "";

  let trackDate = localDate;
  let trackTime = localTime;
  let trackTzName = "";

  try {
    trackDate = new Intl.DateTimeFormat("en-US", {
      timeZone: trackTz,
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(d);

    trackTime = new Intl.DateTimeFormat("en-US", {
      timeZone: trackTz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);

    const trackParts = new Intl.DateTimeFormat("en-US", {
      timeZone: trackTz,
      timeZoneName: "short",
    }).formatToParts(d);
    trackTzName = trackParts.find((p) => p.type === "timeZoneName")?.value || "";
  } catch {
    trackTzName = trackTz;
  }

  return {
    iso: isoString,
    date: d,
    localDate,
    localTime,
    localTzName,
    trackDate,
    trackTime,
    trackTzName,
    localDisplay: `${localDate} · ${localTime}`,
    trackDisplay: `${trackDate} · ${trackTime}`,
  };
}

export function getTimeDifferenceText(trackTz: string, date: Date): string {
  try {
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const trackDate = new Date(date.toLocaleString("en-US", { timeZone: trackTz }));
    const trackOffsetMin = Math.round((trackDate.getTime() - utcDate.getTime()) / 60000);
    const userOffsetMin = -date.getTimezoneOffset();
    const diffMin = trackOffsetMin - userOffsetMin;

    if (diffMin === 0) return "Track is in the same time zone as you";
    const hours = Math.floor(Math.abs(diffMin) / 60);
    const mins = Math.abs(diffMin) % 60;
    const diffStr = `${hours ? hours + "h " : ""}${mins ? mins + "m" : ""}`.trim();
    return diffMin > 0
      ? `Track is ${diffStr} ahead of your local time`
      : `Track is ${diffStr} behind your local time`;
  } catch {
    return "";
  }
}

/** Full race calendar schedule with local vs track times, sessions & race winners */
export async function getSchedule(year = 2026): Promise<ScheduleRace[]> {
  const [d, w] = await Promise.all([
    get<RacesMRData>(String(year)),
    get<RacesMRData>(`${year}/results/1`).catch(() => ({
      RaceTable: { Races: [] },
    })),
  ]);

  const winnersMap = new Map<number, RaceWinner>();
  for (const r of w.RaceTable?.Races || []) {
    const res0 = r.Results?.[0];
    if (res0) {
      winnersMap.set(Number(r.round), {
        driver: `${res0.Driver.givenName} ${res0.Driver.familyName}`,
        code: res0.Driver.code || res0.Driver.familyName.slice(0, 3).toUpperCase(),
        team: res0.Constructor.name,
        time: res0.Time?.time || "",
        colour: colourFor(res0.Constructor.constructorId),
        logo: logoFor(res0.Constructor.constructorId, res0.Constructor.name),
      });
    }
  }

  const now = Date.now();
  const races = d.RaceTable?.Races || [];

  return races.map((r) => {
    const roundNum = Number(r.round);
    const circuitId = r.Circuit?.circuitId || "";
    const country = r.Circuit?.Location?.country || "";
    const trackTz = CIRCUIT_TIMEZONES[circuitId] || COUNTRY_TIMEZONES[country] || "UTC";
    const flag = COUNTRY_FLAGS[country] || "🏁";
    const flagUrl = flagUrlFor(country);

    const raceIso = `${r.date}T${r.time || "12:00:00Z"}`;
    const raceTimes = formatSessionTimes(raceIso, trackTz)!;
    const isCompleted = raceTimes.date.getTime() <= now;

    const sessions: RaceSession[] = [];
    if (r.FirstPractice) {
      const fp1Iso = `${r.FirstPractice.date}T${r.FirstPractice.time || "10:00:00Z"}`;
      sessions.push({
        name: "Practice 1",
        type: "fp",
        times: formatSessionTimes(fp1Iso, trackTz)!,
      });
    }
    if (r.SprintQualifying) {
      const sqIso = `${r.SprintQualifying.date}T${r.SprintQualifying.time || "14:00:00Z"}`;
      sessions.push({
        name: "Sprint Qualifying",
        type: "sprint_qual",
        times: formatSessionTimes(sqIso, trackTz)!,
      });
    } else if (r.SecondPractice) {
      const fp2Iso = `${r.SecondPractice.date}T${r.SecondPractice.time || "14:00:00Z"}`;
      sessions.push({
        name: "Practice 2",
        type: "fp",
        times: formatSessionTimes(fp2Iso, trackTz)!,
      });
    }
    if (r.Sprint) {
      const sprintIso = `${r.Sprint.date}T${r.Sprint.time || "12:00:00Z"}`;
      sessions.push({
        name: "Sprint Race",
        type: "sprint",
        times: formatSessionTimes(sprintIso, trackTz)!,
      });
    } else if (r.ThirdPractice) {
      const fp3Iso = `${r.ThirdPractice.date}T${r.ThirdPractice.time || "11:00:00Z"}`;
      sessions.push({
        name: "Practice 3",
        type: "fp",
        times: formatSessionTimes(fp3Iso, trackTz)!,
      });
    }
    if (r.Qualifying) {
      const qualIso = `${r.Qualifying.date}T${r.Qualifying.time || "14:00:00Z"}`;
      sessions.push({
        name: "Qualifying",
        type: "qual",
        times: formatSessionTimes(qualIso, trackTz)!,
      });
    }
    sessions.push({ name: "Grand Prix", type: "race", isMain: true, times: raceTimes });

    return {
      round: roundNum,
      name: r.raceName,
      circuit: {
        id: circuitId,
        name: r.Circuit?.circuitName || "",
        city: r.Circuit?.Location?.locality || "",
        country: country,
        timezone: trackTz,
        flag: flag,
        flagUrl: flagUrl,
      },
      date: r.date,
      time: r.time,
      raceTimes: raceTimes,
      diffText: getTimeDifferenceText(trackTz, raceTimes.date),
      isCompleted: isCompleted,
      winner: winnersMap.get(roundNum) || null,
      sessions: sessions,
    };
  });
}

export async function getRaceResults(year: number, round: number): Promise<FullRaceDetails> {
  const [faces, resData, qualData, sprintData] = await Promise.all([
    getHeadshots(year),
    get<{ RaceTable?: { Races?: JolpicaRace[] } }>(`${year}/${round}/results`),
    get<{ RaceTable?: { Races?: JolpicaRace[] } }>(`${year}/${round}/qualifying`).catch(() => null),
    get<{ RaceTable?: { Races?: JolpicaRace[] } }>(`${year}/${round}/sprint`).catch(() => null),
  ]);

  const race = resData.RaceTable?.Races?.[0];
  if (!race) {
    throw new Error(`No race results found for round ${round}`);
  }

  const country = race.Circuit?.Location?.country || "";
  const flagUrl = flagUrlFor(country);

  const results: RaceResultRow[] = (race.Results || []).map((r) => {
    const pos = Number(r.position || 0);
    const grid = Number(r.grid || 0);
    const code = r.Driver.code || r.Driver.familyName.slice(0, 3).toUpperCase();
    const fullName = `${r.Driver.givenName} ${r.Driver.familyName}`.trim();
    const teamId = r.Constructor.constructorId || "";
    const teamName = r.Constructor.name || "";

    return {
      position: pos,
      positionText: r.positionText || String(pos),
      points: Number(r.points || 0),
      grid: grid,
      delta: grid > 0 ? grid - pos : 0,
      laps: Number(r.laps || 0),
      status: r.status || "Finished",
      time: r.Time?.time || r.status || "-",
      fastestLap: r.FastestLap
        ? {
            rank: Number(r.FastestLap.rank || 0),
            lap: Number(r.FastestLap.lap || 0),
            time: r.FastestLap.Time?.time || "",
          }
        : undefined,
      driver: {
        id: r.Driver.driverId,
        code: code,
        number: r.number || r.Driver.permanentNumber || "",
        name: fullName,
        headshot: headshotFor(code, r.Driver.driverId, fullName) || faces.get(code) || "",
        nationality: r.Driver.nationality || "",
      },
      team: {
        id: teamId,
        name: teamName,
        colour: colourFor(teamId),
        logo: logoFor(teamId, teamName),
      },
    };
  });

  const qualRace = qualData?.RaceTable?.Races?.[0];
  const qualifying: QualifyingResultRow[] | undefined = qualRace?.QualifyingResults?.map((q) => {
    const pos = Number(q.position || 0);
    const code = q.Driver.code || q.Driver.familyName.slice(0, 3).toUpperCase();
    const fullName = `${q.Driver.givenName} ${q.Driver.familyName}`.trim();
    const teamId = q.Constructor.constructorId || "";
    const teamName = q.Constructor.name || "";

    return {
      position: pos,
      driver: {
        id: q.Driver.driverId,
        code: code,
        number: q.number || q.Driver.permanentNumber || "",
        name: fullName,
        headshot: headshotFor(code, q.Driver.driverId, fullName) || faces.get(code) || "",
      },
      team: {
        id: teamId,
        name: teamName,
        colour: colourFor(teamId),
        logo: logoFor(teamId, teamName),
      },
      q1: q.Q1,
      q2: q.Q2,
      q3: q.Q3,
    };
  });

  const sprintRace = sprintData?.RaceTable?.Races?.[0];
  const sprint: RaceResultRow[] | undefined = sprintRace?.SprintResults?.map((r) => {
    const pos = Number(r.position || 0);
    const grid = Number(r.grid || 0);
    const code = r.Driver.code || r.Driver.familyName.slice(0, 3).toUpperCase();
    const fullName = `${r.Driver.givenName} ${r.Driver.familyName}`.trim();
    const teamId = r.Constructor.constructorId || "";
    const teamName = r.Constructor.name || "";

    return {
      position: pos,
      positionText: r.positionText || String(pos),
      points: Number(r.points || 0),
      grid: grid,
      delta: grid > 0 ? grid - pos : 0,
      laps: Number(r.laps || 0),
      status: r.status || "Finished",
      time: r.Time?.time || r.status || "-",
      fastestLap: r.FastestLap
        ? {
            rank: Number(r.FastestLap.rank || 0),
            lap: Number(r.FastestLap.lap || 0),
            time: r.FastestLap.Time?.time || "",
          }
        : undefined,
      driver: {
        id: r.Driver.driverId,
        code: code,
        number: r.number || r.Driver.permanentNumber || "",
        name: fullName,
        headshot: headshotFor(code, r.Driver.driverId, fullName) || faces.get(code) || "",
        nationality: r.Driver.nationality || "",
      },
      team: {
        id: teamId,
        name: teamName,
        colour: colourFor(teamId),
        logo: logoFor(teamId, teamName),
      },
    };
  });

  return {
    round: Number(race.round),
    raceName: race.raceName,
    circuitName: race.Circuit?.circuitName || "",
    locality: race.Circuit?.Location?.locality || "",
    country: country,
    date: race.date,
    flagUrl: flagUrl,
    results,
    qualifying,
    sprint,
  };
}

