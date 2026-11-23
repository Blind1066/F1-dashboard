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
  TelemetryResult,
} from "../types/telemetry";
import {
  formatLapTime,
  generateRealisticLapTelemetry,
} from "./telemetryDemo";

const OPENF1_BASE = "https://api.openf1.org/v1";

export class OpenF1Error extends Error {
  constructor(
    message: string,
    public type: "network" | "http" | "empty_data",
    public status?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = "OpenF1Error";
  }
}

// In-memory cache to prevent duplicate network calls
const cache = new Map<string, { timestamp: number; data: unknown }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

export async function fetchOpenF1<T>(endpoint: string, timeoutMs = 8000, maxRetries = 3): Promise<T> {
  const cacheKey = `openf1:${endpoint}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      // Exponential backoff with jitter: 300ms, 600ms, 1200ms...
      const delay = Math.min(300 * Math.pow(2, attempt - 1), 3000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const ctl = new AbortController();
    const timeoutId = setTimeout(() => ctl.abort(), timeoutMs);

    try {
      const res = await fetch(`${OPENF1_BASE}/${endpoint}`, { signal: ctl.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 429) {
          lastError = new OpenF1Error(`OpenF1 Rate Limited (429) on ${endpoint}`, "http", 429, endpoint);
          continue; // Retry on 429
        }
        if (res.status >= 500) {
          lastError = new OpenF1Error(`OpenF1 Server Error (${res.status}) on ${endpoint}`, "http", res.status, endpoint);
          continue; // Retry on server 5xx
        }
        // Client errors (400, 404, etc.) do not retry
        throw new OpenF1Error(`OpenF1 HTTP ${res.status}: ${res.statusText} on ${endpoint}`, "http", res.status, endpoint);
      }

      const data = (await res.json()) as T;

      // Distinguish empty data
      if (data === null || data === undefined || (Array.isArray(data) && data.length === 0)) {
        throw new OpenF1Error(`OpenF1 returned empty data for ${endpoint}`, "empty_data", 200, endpoint);
      }

      cache.set(cacheKey, { timestamp: Date.now(), data });
      return data;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof OpenF1Error && (err.type === "empty_data" || (err.type === "http" && err.status && err.status < 500 && err.status !== 429))) {
        throw err;
      }

      if (err instanceof Error && err.name === "AbortError") {
        lastError = new OpenF1Error(`OpenF1 network timeout (${timeoutMs}ms) on ${endpoint}`, "network", undefined, endpoint);
      } else if (err instanceof OpenF1Error) {
        lastError = err;
      } else {
        lastError = new OpenF1Error(
          err instanceof Error ? err.message : `Network failure fetching ${endpoint}`,
          "network",
          undefined,
          endpoint
        );
      }
    }
  }

  throw lastError || new OpenF1Error(`Failed fetching ${endpoint} after ${maxRetries} retries`, "network", undefined, endpoint);
}

// 1. Sessions
export async function getSessions(year = 2024, sessionName = "Race"): Promise<OpenF1Session[]> {
  try {
    const data = await fetchOpenF1<OpenF1Session[]>(`sessions?year=${year}&session_name=${encodeURIComponent(sessionName)}`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err instanceof OpenF1Error && err.type === "empty_data") return [];
    console.warn("getSessions error:", err);
    return [];
  }
}

// 2. Drivers
export async function getDrivers(sessionKey: number): Promise<OpenF1Driver[]> {
  try {
    const data = await fetchOpenF1<OpenF1Driver[]>(`drivers?session_key=${sessionKey}`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err instanceof OpenF1Error && err.type === "empty_data") return [];
    console.warn("getDrivers error:", err);
    return [];
  }
}

// 3. Laps
export async function getLaps(sessionKey: number, driverNumber?: number): Promise<OpenF1Lap[]> {
  const q = driverNumber ? `laps?session_key=${sessionKey}&driver_number=${driverNumber}` : `laps?session_key=${sessionKey}`;
  try {
    const data = await fetchOpenF1<OpenF1Lap[]>(q);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err instanceof OpenF1Error && err.type === "empty_data") return [];
    console.warn("getLaps error:", err);
    return [];
  }
}

// 4. Stints
export async function getStints(sessionKey: number, driverNumber?: number): Promise<OpenF1Stint[]> {
  const q = driverNumber ? `stints?session_key=${sessionKey}&driver_number=${driverNumber}` : `stints?session_key=${sessionKey}`;
  try {
    const data = await fetchOpenF1<OpenF1Stint[]>(q);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err instanceof OpenF1Error && err.type === "empty_data") return [];
    console.warn("getStints error:", err);
    return [];
  }
}

// 5. Pit Stops
export async function getPitStops(sessionKey: number, driverNumber?: number): Promise<OpenF1Pit[]> {
  const q = driverNumber ? `pit?session_key=${sessionKey}&driver_number=${driverNumber}` : `pit?session_key=${sessionKey}`;
  try {
    const data = await fetchOpenF1<OpenF1Pit[]>(q);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err instanceof OpenF1Error && err.type === "empty_data") return [];
    console.warn("getPitStops error:", err);
    return [];
  }
}

// 6. Intervals
export async function getIntervals(sessionKey: number, driverNumber?: number): Promise<OpenF1Interval[]> {
  const q = driverNumber ? `intervals?session_key=${sessionKey}&driver_number=${driverNumber}` : `intervals?session_key=${sessionKey}`;
  try {
    const data = await fetchOpenF1<OpenF1Interval[]>(q);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err instanceof OpenF1Error && err.type === "empty_data") return [];
    console.warn("getIntervals error:", err);
    return [];
  }
}

// 7. Position Progression
export async function getPositions(sessionKey: number, driverNumber?: number): Promise<OpenF1Position[]> {
  const q = driverNumber ? `position?session_key=${sessionKey}&driver_number=${driverNumber}` : `position?session_key=${sessionKey}`;
  try {
    const data = await fetchOpenF1<OpenF1Position[]>(q);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err instanceof OpenF1Error && err.type === "empty_data") return [];
    console.warn("getPositions error:", err);
    return [];
  }
}

// 8. Race Control (Flags, VSC, SC)
export async function getRaceControl(sessionKey: number): Promise<OpenF1RaceControl[]> {
  try {
    const data = await fetchOpenF1<OpenF1RaceControl[]>(`race_control?session_key=${sessionKey}`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err instanceof OpenF1Error && err.type === "empty_data") return [];
    console.warn("getRaceControl error:", err);
    return [];
  }
}

// 9. Weather
export async function getWeather(sessionKey: number): Promise<OpenF1Weather[]> {
  try {
    const data = await fetchOpenF1<OpenF1Weather[]>(`weather?session_key=${sessionKey}`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err instanceof OpenF1Error && err.type === "empty_data") return [];
    console.warn("getWeather error:", err);
    return [];
  }
}

export const CIRCUIT_LENGTHS_M: Record<string, number> = {
  interlagos: 4309,
  "são paulo": 4309,
  sao_paulo: 4309,
  sakhir: 5412,
  bahrain: 5412,
  jeddah: 6174,
  melbourne: 5278,
  albert_park: 5278,
  suzuka: 5807,
  shanghai: 5451,
  miami: 5412,
  imola: 4909,
  monaco: 3337,
  montreal: 4361,
  catalunya: 4657,
  barcelona: 4657,
  spielberg: 4318,
  red_bull_ring: 4318,
  silverstone: 5891,
  hungaroring: 4381,
  spa: 7004,
  spa_francorchamps: 7004,
  zandvoort: 4259,
  monza: 5793,
  baku: 6003,
  marina_bay: 4940,
  singapore: 4940,
  austin: 5513,
  cota: 5513,
  mexico: 4304,
  las_vegas: 6201,
  lusail: 5419,
  qatar: 5419,
  yas_marina: 5281,
  abu_dhabi: 5281,
};

export interface CircuitMetadataResult {
  circuitLengthM: number;
  isAvailable: boolean;
  warning?: string;
}

export function resolveCircuitLengthM(
  circuitOrSession?: string | { circuit_short_name?: string; location?: string; country_name?: string }
): CircuitMetadataResult {
  if (!circuitOrSession) {
    const warning = "Circuit length metadata is unavailable. Defaulting to estimated track length (4309m).";
    console.warn(warning);
    return { circuitLengthM: 4309, isAvailable: false, warning };
  }

  const searchKey =
    typeof circuitOrSession === "string"
      ? circuitOrSession.toLowerCase().replace(/[^a-z0-9]/g, "_")
      : [
          circuitOrSession.circuit_short_name,
          circuitOrSession.location,
          circuitOrSession.country_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

  for (const [key, len] of Object.entries(CIRCUIT_LENGTHS_M)) {
    if (searchKey.includes(key)) {
      return { circuitLengthM: len, isAvailable: true };
    }
  }

  const label = typeof circuitOrSession === "string" ? circuitOrSession : circuitOrSession.circuit_short_name || "unknown circuit";
  const warning = `Circuit length metadata unavailable for "${label}". Defaulting to estimated track length (4309m).`;
  console.warn(warning);
  return { circuitLengthM: 4309, isAvailable: false, warning };
}

// 10. Car Data for an individual Lap
export async function getCarDataForLap(
  sessionKey: number,
  driverNumber: number,
  lapDateStart: string,
  lapDurationSec: number,
  circuitLengthM?: number
): Promise<TelemetryResult> {
  const effectiveLengthM = circuitLengthM ?? resolveCircuitLengthM().circuitLengthM;
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
        const scale = effectiveLengthM / currentDist;
        for (const p of points) {
          p.distance = Math.round(p.distance * scale);
        }
      }

      return {
        data: points,
        source: "live",
      };
    }

    return {
      data: generateRealisticLapTelemetry(driverNumber, 10, lapDurationSec, effectiveLengthM),
      source: "simulated",
      error: "OpenF1 returned insufficient car data points for this lap",
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "OpenF1 car_data fetch fallback";
    console.warn("OpenF1 car_data fetch fallback:", err);
    return {
      data: generateRealisticLapTelemetry(driverNumber, 10, lapDurationSec, effectiveLengthM),
      source: "simulated",
      error: errorMsg,
    };
  }
}

// 11. Synchronize Driver A and Driver B distance-based telemetry pair
export function alignTelemetryPair(
  driverAPoints: TelemetryDataPoint[],
  driverBPoints: TelemetryDataPoint[],
  circuitLengthM?: number,
  stepM = 25
): TelemetryDataPoint[] {
  const maxA = driverAPoints.length ? driverAPoints[driverAPoints.length - 1].distance : 0;
  const maxB = driverBPoints.length ? driverBPoints[driverBPoints.length - 1].distance : 0;
  const effectiveLengthM = circuitLengthM || Math.max(maxA, maxB) || resolveCircuitLengthM().circuitLengthM;
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

  for (let d = 0; d <= effectiveLengthM; d += stepM) {
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
      const compound = matchedStint?.compound || "UNKNOWN";
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
