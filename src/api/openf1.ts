import type {
  OpenF1CarDataRaw,
  OpenF1Driver,
  OpenF1Interval,
  OpenF1Lap,
  OpenF1Pit,
  OpenF1Position,
  OpenF1RaceControl,
  OpenF1Session,
  OpenF1Stint,
  OpenF1Weather,
  ProcessedLapSummary,
  TelemetryDataPoint,
} from "../types/telemetry";
import {
  formatLapTime,
  generateRealisticLapTelemetry,
} from "./telemetryDemo";

const OPENF1_BASE = "https://api.openf1.org/v1";

// In-memory cache to prevent duplicate network calls
const cache = new Map<string, { timestamp: number; data: unknown }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

async function fetchOpenF1<T>(endpoint: string, timeoutMs = 8000): Promise<T | null> {
  const cacheKey = `openf1:${endpoint}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }

  const ctl = new AbortController();
  const timeoutId = setTimeout(() => ctl.abort(), timeoutMs);

  try {
    const res = await fetch(`${OPENF1_BASE}/${endpoint}`, { signal: ctl.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as T;
    cache.set(cacheKey, { timestamp: Date.now(), data });
    return data;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// 1. Sessions
export async function getSessions(year = 2024, sessionName = "Race"): Promise<OpenF1Session[]> {
  const data = await fetchOpenF1<OpenF1Session[]>(`sessions?year=${year}&session_name=${encodeURIComponent(sessionName)}`);
  return data && Array.isArray(data) ? data : [];
}

// 2. Drivers
export async function getDrivers(sessionKey: number): Promise<OpenF1Driver[]> {
  const data = await fetchOpenF1<OpenF1Driver[]>(`drivers?session_key=${sessionKey}`);
  return data && Array.isArray(data) ? data : [];
}

// 3. Laps
export async function getLaps(sessionKey: number, driverNumber?: number): Promise<OpenF1Lap[]> {
  const q = driverNumber ? `laps?session_key=${sessionKey}&driver_number=${driverNumber}` : `laps?session_key=${sessionKey}`;
  const data = await fetchOpenF1<OpenF1Lap[]>(q);
  return data && Array.isArray(data) ? data : [];
}

// 4. Stints
export async function getStints(sessionKey: number, driverNumber?: number): Promise<OpenF1Stint[]> {
  const q = driverNumber ? `stints?session_key=${sessionKey}&driver_number=${driverNumber}` : `stints?session_key=${sessionKey}`;
  const data = await fetchOpenF1<OpenF1Stint[]>(q);
  return data && Array.isArray(data) ? data : [];
}

// 5. Pit Stops
export async function getPitStops(sessionKey: number, driverNumber?: number): Promise<OpenF1Pit[]> {
  const q = driverNumber ? `pit?session_key=${sessionKey}&driver_number=${driverNumber}` : `pit?session_key=${sessionKey}`;
  const data = await fetchOpenF1<OpenF1Pit[]>(q);
  return data && Array.isArray(data) ? data : [];
}

// 6. Intervals
export async function getIntervals(sessionKey: number, driverNumber?: number): Promise<OpenF1Interval[]> {
  const q = driverNumber ? `intervals?session_key=${sessionKey}&driver_number=${driverNumber}` : `intervals?session_key=${sessionKey}`;
  const data = await fetchOpenF1<OpenF1Interval[]>(q);
  return data && Array.isArray(data) ? data : [];
}

// 7. Position Progression
export async function getPositions(sessionKey: number, driverNumber?: number): Promise<OpenF1Position[]> {
  const q = driverNumber ? `position?session_key=${sessionKey}&driver_number=${driverNumber}` : `position?session_key=${sessionKey}`;
  const data = await fetchOpenF1<OpenF1Position[]>(q);
  return data && Array.isArray(data) ? data : [];
}

// 8. Race Control (Flags, VSC, SC)
export async function getRaceControl(sessionKey: number): Promise<OpenF1RaceControl[]> {
  const data = await fetchOpenF1<OpenF1RaceControl[]>(`race_control?session_key=${sessionKey}`);
  return data && Array.isArray(data) ? data : [];
}

// 9. Weather
export async function getWeather(sessionKey: number): Promise<OpenF1Weather[]> {
  const data = await fetchOpenF1<OpenF1Weather[]>(`weather?session_key=${sessionKey}`);
  return data && Array.isArray(data) ? data : [];
}

// 10. Car Data for an individual Lap
export async function getCarDataForLap(
  sessionKey: number,
  driverNumber: number,
  lapDateStart: string,
  lapDurationSec: number,
  circuitLengthM = 4309
): Promise<TelemetryDataPoint[]> {
  try {
    const startDate = new Date(lapDateStart);
    const endDate = new Date(startDate.getTime() + Math.ceil(lapDurationSec + 3) * 1000);

    const startIso = startDate.toISOString().replace("Z", "");
    const endIso = endDate.toISOString().replace("Z", "");

    const endpoint = `car_data?session_key=${sessionKey}&driver_number=${driverNumber}&date%3E=${startIso}&date%3C=${endIso}`;
    const raw = await fetchOpenF1<OpenF1CarDataRaw[]>(endpoint, 10000);

    if (raw && Array.isArray(raw) && raw.length > 20) {
      // Sort chronologically
      raw.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let currentDist = 0;
      const initialTime = new Date(raw[0].date).getTime();
      const points: TelemetryDataPoint[] = [];

      for (let i = 0; i < raw.length; i++) {
        const item = raw[i];
        const currentTime = new Date(item.date).getTime();
        const timeSec = Number(((currentTime - initialTime) / 1000).toFixed(3));

        if (i > 0) {
          const prevTime = new Date(raw[i - 1].date).getTime();
          const dtSec = (currentTime - prevTime) / 1000;
          if (dtSec > 0 && dtSec < 2) {
            const speedMs = (item.speed * 1000) / 3600;
            currentDist += speedMs * dtSec;
          }
        }

        points.push({
          distance: Math.round(currentDist),
          timeSec,
          speed: item.speed,
          throttle: item.throttle,
          brake: item.brake > 0 ? (item.brake <= 1 ? item.brake * 100 : item.brake) : 0,
          gear: item.n_gear,
          rpm: item.rpm,
          drs: item.drs >= 10,
        });
      }

      // Normalize distance to exact circuit length
      if (points.length > 0 && currentDist > 0) {
        const scale = circuitLengthM / currentDist;
        for (const p of points) {
          p.distance = Math.round(p.distance * scale);
        }
      }

      return points;
    }
  } catch (err) {
    console.warn("OpenF1 car_data fetch fallback:", err);
  }

  // Graceful fallback with realistic telemetry
  return generateRealisticLapTelemetry(driverNumber, 10, lapDurationSec, circuitLengthM);
}

// 11. Synchronize Driver A and Driver B distance-based telemetry pair
export function alignTelemetryPair(
  driverAPoints: TelemetryDataPoint[],
  driverBPoints: TelemetryDataPoint[],
  circuitLengthM = 4309,
  stepM = 25
): TelemetryDataPoint[] {
  const aligned: TelemetryDataPoint[] = [];

  const interpolateAtDist = (pts: TelemetryDataPoint[], targetDist: number) => {
    if (!pts.length) return null;
    if (targetDist <= pts[0].distance) return pts[0];
    if (targetDist >= pts[pts.length - 1].distance) return pts[pts.length - 1];

    for (let i = 0; i < pts.length - 1; i++) {
      if (pts[i].distance <= targetDist && pts[i + 1].distance >= targetDist) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const span = p2.distance - p1.distance || 1;
        const factor = (targetDist - p1.distance) / span;

        return {
          distance: targetDist,
          timeSec: Number((p1.timeSec + (p2.timeSec - p1.timeSec) * factor).toFixed(3)),
          speed: Math.round(p1.speed + (p2.speed - p1.speed) * factor),
          throttle: Math.round(p1.throttle + (p2.throttle - p1.throttle) * factor),
          brake: Math.round(p1.brake + (p2.brake - p1.brake) * factor),
          gear: factor > 0.5 ? p2.gear : p1.gear,
          rpm: Math.round(p1.rpm + (p2.rpm - p1.rpm) * factor),
          drs: factor > 0.5 ? p2.drs : p1.drs,
        };
      }
    }
    return pts[pts.length - 1];
  };

  for (let d = 0; d <= circuitLengthM; d += stepM) {
    const ptA = interpolateAtDist(driverAPoints, d);
    const ptB = interpolateAtDist(driverBPoints, d);

    if (ptA) {
      const delta = ptB ? Number((ptA.timeSec - ptB.timeSec).toFixed(3)) : 0;
      aligned.push({
        distance: d,
        timeSec: ptA.timeSec,
        speed: ptA.speed,
        throttle: ptA.throttle,
        brake: ptA.brake,
        gear: ptA.gear,
        rpm: ptA.rpm,
        drs: ptA.drs,
        compareSpeed: ptB?.speed,
        compareThrottle: ptB?.throttle,
        compareBrake: ptB?.brake,
        compareGear: ptB?.gear,
        compareRpm: ptB?.rpm,
        delta,
      });
    }
  }

  return aligned;
}

// 12. Headshot map helper
export async function getHeadshots(year: number): Promise<Map<string, string>> {
  if (year < 2023) return new Map();
  try {
    const sessions = await getSessions(year, "Race");
    if (!sessions.length) return new Map();

    const latest = sessions[sessions.length - 1];
    const drivers = await getDrivers(latest.session_key);
    const faceMap = new Map<string, string>();
    for (const d of drivers) {
      if (d.name_acronym && d.headshot_url) {
        faceMap.set(d.name_acronym, d.headshot_url);
      }
    }
    return faceMap;
  } catch {
    return new Map();
  }
}

// 13. Convert OpenF1 raw laps into processed timing laps
export function processOpenF1Laps(
  rawLaps: OpenF1Lap[],
  stints: OpenF1Stint[] = []
): ProcessedLapSummary[] {
  if (!rawLaps || rawLaps.length === 0) return [];

  const validDurations = rawLaps
    .map((l) => l.lap_duration)
    .filter((d): d is number => typeof d === "number" && d > 50 && d < 180);
  const minDuration = validDurations.length > 0 ? Math.min(...validDurations) : 70;

  let personalBest = 9999;

  return rawLaps
    .filter((l) => l.lap_number && l.lap_number > 0)
    .sort((a, b) => a.lap_number - b.lap_number)
    .map((lap) => {
      const dur = lap.lap_duration || 0;
      const isPB = dur > 50 && dur < personalBest;
      if (isPB) personalBest = dur;

      const matchedStint = stints.find(
        (s) => lap.lap_number >= s.lap_start && lap.lap_number <= s.lap_end
      );
      const compound = matchedStint?.compound || (lap.duration_sector_1 && lap.duration_sector_1 > 28 ? "INTERMEDIATE" : "MEDIUM");
      const tyreAge = matchedStint ? Math.max(1, lap.lap_number - matchedStint.lap_start + 1) : lap.lap_number;

      return {
        lapNumber: lap.lap_number,
        lapDuration: dur,
        lapDurationDisplay: dur > 0 ? formatLapTime(dur) : "-",
        s1: lap.duration_sector_1 ? Number(lap.duration_sector_1.toFixed(3)) : undefined,
        s2: lap.duration_sector_2 ? Number(lap.duration_sector_2.toFixed(3)) : undefined,
        s3: lap.duration_sector_3 ? Number(lap.duration_sector_3.toFixed(3)) : undefined,
        compound,
        tyreAge,
        speedTrap: lap.st_speed ? Math.round(lap.st_speed) : undefined,
        i1Speed: lap.i1_speed ? Math.round(lap.i1_speed) : undefined,
        i2Speed: lap.i2_speed ? Math.round(lap.i2_speed) : undefined,
        isPersonalBest: isPB,
        isOverallFastest: dur > 0 && Math.abs(dur - minDuration) < 0.005,
        isPitOut: lap.is_pit_out_lap,
      };
    });
}
