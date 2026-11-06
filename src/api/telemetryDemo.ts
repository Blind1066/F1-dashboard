import type {
  ProcessedLapSummary,
  TelemetryDataPoint,
  TelemetryLapStats,
} from "../types/telemetry";

// Standard team colors mapping
export const TEAM_COLOURS: Record<string, string> = {
  mclaren: "#ff8000",
  "red bull": "#3671c6",
  "red bull racing": "#3671c6",
  ferrari: "#e8002d",
  mercedes: "#27f4d2",
  "aston martin": "#229971",
  alpine: "#ff87bc",
  "alpine f1 team": "#ff87bc",
  williams: "#64c4ff",
  haas: "#b6babd",
  "haas f1 team": "#b6babd",
  "rb f1 team": "#6692ff",
  rb: "#6692ff",
  sauber: "#52e252",
  audi: "#52e252",
  cadillac: "#d4af37",
};

export function getTeamColour(teamName: string, defaultColor = "#e10600"): string {
  const lower = teamName.toLowerCase();
  for (const [k, v] of Object.entries(TEAM_COLOURS)) {
    if (lower.includes(k)) return v;
  }
  return defaultColor;
}

// Generate high-resolution physics-consistent telemetry for Interlagos / Grand Prix lap
export function generateRealisticLapTelemetry(
  driverNumber: number,
  lapNumber: number,
  lapDurationSec: number,
  circuitLengthM = 4309,
  sampleCount = 200,
  isDriverB = false
): TelemetryDataPoint[] {
  const points: TelemetryDataPoint[] = [];

  // Corner definitions along 4309m Interlagos:
  // Turn 1-2 (Senna S): ~350m - 550m, Speed drops from 325 to 110 km/h, Heavy Brake
  // Turn 3 (Curva do Sol): ~650m - 850m, Accel to 260 km/h
  // Reta Oposta: ~900m - 1650m, Full Throttle to 328 km/h (Speed Trap ~1550m)
  // Turn 4-5 (Descida do Lago): ~1700m - 1900m, Heavy Brake to 135 km/h
  // Turn 6-7 (Ferradura): ~2150m - 2350m, Apex 175 km/h
  // Turn 8 (Laranjinha): ~2550m, 160 km/h
  // Turn 9 (Pinheirinho): ~2750m, 115 km/h
  // Turn 10 (Bico de Pato): ~2950m, Slowest Hairpin 78 km/h
  // Turn 11 (Mergulho): ~3150m, Fast sweeping 215 km/h
  // Turn 12 (Junção): ~3400m, Critical exit 125 km/h
  // Subida dos Boxes & Arquibancadas: ~3500m - 4309m, Flat out uphill 100% throttle to 320+ km/h

  const variance = ((driverNumber * 7 + lapNumber * 13) % 100) / 10000;
  const driverBias = (isDriverB ? 1.015 : 0.995) + variance; // Slight delta between drivers

  for (let i = 0; i <= sampleCount; i++) {
    const fraction = i / sampleCount;
    const distance = Math.round(fraction * circuitLengthM);
    const timeSec = Number((fraction * lapDurationSec).toFixed(3));

    let speed = 280;
    let throttle = 100;
    let brake = 0;
    let gear = 7;
    let rpm = 11200;
    let drs = false;

    // Corner 1-2 Senna S (distance 320 - 580)
    if (distance >= 280 && distance < 420) {
      const p = (distance - 280) / 140;
      speed = 325 - p * 215 * driverBias;
      brake = p < 0.8 ? 100 : 40;
      throttle = 0;
      gear = Math.max(3, Math.round(7 - p * 4));
      rpm = 10500 - p * 2000;
    } else if (distance >= 420 && distance < 580) {
      const p = (distance - 420) / 160;
      speed = 110 + p * 120;
      brake = 0;
      throttle = Math.min(100, Math.round(p * 110));
      gear = Math.min(5, Math.round(3 + p * 2));
      rpm = 9800 + p * 1800;
    }
    // Turn 3 Curva do Sol (distance 580 - 900)
    else if (distance >= 580 && distance < 900) {
      const p = (distance - 580) / 320;
      speed = 230 + p * 80;
      throttle = 90 + p * 10;
      brake = 0;
      gear = Math.min(7, Math.round(5 + p * 2));
      rpm = 10800 + p * 1000;
    }
    // Reta Oposta (distance 900 - 1650) - DRS Zone 1
    else if (distance >= 900 && distance < 1650) {
      const p = (distance - 900) / 750;
      speed = 310 + p * 25 * (isDriverB ? 0.99 : 1.01);
      throttle = 100;
      brake = 0;
      gear = 8;
      rpm = 11500 + p * 500;
      drs = true;
    }
    // Turn 4-5 Descida do Lago (distance 1650 - 1920)
    else if (distance >= 1650 && distance < 1780) {
      const p = (distance - 1650) / 130;
      speed = 330 - p * 195;
      brake = p < 0.75 ? 100 : 50;
      throttle = 0;
      gear = Math.max(3, Math.round(8 - p * 5));
      rpm = 11800 - p * 2500;
    } else if (distance >= 1780 && distance < 1920) {
      const p = (distance - 1780) / 140;
      speed = 135 + p * 85;
      throttle = Math.round(p * 95);
      brake = 0;
      gear = 4;
      rpm = 9400 + p * 1600;
    }
    // Turn 6-7 Ferradura (distance 1920 - 2400)
    else if (distance >= 1920 && distance < 2400) {
      const p = (distance - 1920) / 480;
      speed = 220 - Math.sin(p * Math.PI) * 55;
      throttle = 65 + Math.cos(p * Math.PI) * 30;
      brake = p > 0.2 && p < 0.4 ? 35 : 0;
      gear = 5;
      rpm = 10200 + Math.sin(p * Math.PI) * 1200;
    }
    // Turn 8 Laranjinha (distance 2400 - 2680)
    else if (distance >= 2400 && distance < 2680) {
      const p = (distance - 2400) / 280;
      speed = 195 - p * 40;
      throttle = 50;
      brake = p > 0.5 ? 40 : 0;
      gear = 4;
      rpm = 9600;
    }
    // Turn 9 Pinheirinho & Turn 10 Bico de Pato (distance 2680 - 3100)
    else if (distance >= 2680 && distance < 2900) {
      const p = (distance - 2680) / 220;
      speed = 155 - p * 45;
      brake = p > 0.4 ? 65 : 0;
      throttle = p < 0.4 ? 60 : 0;
      gear = 3;
      rpm = 9200;
    } else if (distance >= 2900 && distance < 3050) {
      // Bico de Pato hairpin apex
      const p = (distance - 2900) / 150;
      speed = 110 - p * 35;
      brake = p < 0.6 ? 85 : 20;
      throttle = 0;
      gear = 2;
      rpm = 8800;
    } else if (distance >= 3050 && distance < 3200) {
      // Corner exit to Mergulho
      const p = (distance - 3050) / 150;
      speed = 78 + p * 120;
      brake = 0;
      throttle = Math.min(100, Math.round(p * 115));
      gear = Math.min(5, Math.round(2 + p * 3));
      rpm = 9200 + p * 2000;
    }
    // Turn 12 Junção (distance 3200 - 3550)
    else if (distance >= 3200 && distance < 3380) {
      const p = (distance - 3200) / 180;
      speed = 210 - p * 85;
      brake = p > 0.3 ? 75 : 0;
      throttle = p < 0.3 ? 70 : 0;
      gear = 3;
      rpm = 9400;
    } else if (distance >= 3380 && distance < 3550) {
      const p = (distance - 3380) / 170;
      speed = 125 + p * 90;
      brake = 0;
      throttle = Math.min(100, Math.round(p * 105));
      gear = 4 + Math.round(p);
      rpm = 9800 + p * 1600;
    }
    // Subida dos Boxes & Main Straight to finish (distance 3550 - 4309) - DRS Zone 2
    else {
      const p = (distance - 3550) / 759;
      speed = 215 + p * 110;
      throttle = 100;
      brake = 0;
      gear = Math.min(8, Math.round(5 + p * 3));
      rpm = 10600 + p * 1600;
      if (distance > 3900) drs = true;
    }

    // Add minute organic noise
    const noise = (Math.sin(i * 0.45) * 1.5);
    speed = Math.max(65, Math.round(speed + noise));
    rpm = Math.max(7500, Math.min(12500, Math.round(rpm + noise * 15)));

    points.push({
      distance,
      timeSec,
      speed,
      throttle: Math.max(0, Math.min(100, throttle)),
      brake: Math.max(0, Math.min(100, brake)),
      gear: Math.max(1, Math.min(8, gear)),
      rpm,
      drs,
    });
  }

  return points;
}

// Compute statistics across distance-based telemetry
export function computeTelemetryStats(data: TelemetryDataPoint[]): TelemetryLapStats {
  if (!data.length) {
    return {
      maxSpeed: 0,
      minSpeed: 0,
      avgSpeed: 0,
      speedTrap: 0,
      fullThrottlePct: 0,
      timeAcceleratingSec: 0,
      brakeEventsCount: 0,
      totalBrakingSec: 0,
      avgDeceleration: 0,
      gearChangesCount: 0,
      topGear: 8,
    };
  }

  const speeds = data.map((d) => d.speed);
  const maxSpeed = Math.max(...speeds);
  const minSpeed = Math.min(...speeds);
  const avgSpeed = Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length);

  // Speed trap around 1500m on Reta Oposta
  const stPt = data.find((d) => d.distance >= 1500 && d.distance <= 1650) || data[Math.floor(data.length * 0.35)];
  const speedTrap = stPt ? stPt.speed : maxSpeed;

  let fullThrottleCount = 0;
  let acceleratingCount = 0;
  let brakingCount = 0;
  let gearChanges = 0;
  let prevGear = data[0].gear;
  let brakeEvents = 0;
  let inBrakeZone = false;

  for (const pt of data) {
    if (pt.throttle >= 98) fullThrottleCount++;
    if (pt.throttle > 5) acceleratingCount++;
    if (pt.brake > 10) {
      brakingCount++;
      if (!inBrakeZone) {
        brakeEvents++;
        inBrakeZone = true;
      }
    } else {
      inBrakeZone = false;
    }

    if (pt.gear !== prevGear) {
      gearChanges++;
      prevGear = pt.gear;
    }
  }

  const totalTime = data[data.length - 1].timeSec || 70;
  const fullThrottlePct = Number(((fullThrottleCount / data.length) * 100).toFixed(1));
  const timeAcceleratingSec = Number(((acceleratingCount / data.length) * totalTime).toFixed(1));
  const totalBrakingSec = Number(((brakingCount / data.length) * totalTime).toFixed(1));

  return {
    maxSpeed,
    minSpeed,
    avgSpeed,
    speedTrap,
    fullThrottlePct,
    timeAcceleratingSec,
    brakeEventsCount: Math.max(brakeEvents, 6),
    totalBrakingSec,
    avgDeceleration: 4.8, // typical 4.5-5.5G
    gearChangesCount: Math.max(gearChanges, 42),
    topGear: Math.max(...data.map((d) => d.gear)),
  };
}

// Format seconds into F1 standard M:SS.mmm
export function formatLapTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "--:--.---";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
  return `${m}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

// Parse F1 string "1:10.540" to seconds
export function parseLapTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().replace("+", "").replace("s", "");
  if (clean.includes(":")) {
    const [minPart, secPart] = clean.split(":");
    return Number(minPart) * 60 + Number(secPart);
  }
  return Number(clean);
}

// Generate full realistic lap timing progression for 71-lap Grand Prix
export function generateRealisticLaps(
  driverNumber: number,
  _driverCode: string,
  totalLaps = 71,
  baseLapTime = 70.54, // ~1:10.540
  stintsConfig = [
    { start: 1, end: 26, compound: "MEDIUM" },
    { start: 27, end: 71, compound: "HARD" },
  ]
): ProcessedLapSummary[] {
  const laps: ProcessedLapSummary[] = [];

  let overallFastestLap = 999;
  let overallFastestIdx = 24;

  for (let l = 1; l <= totalLaps; l++) {
    const currentStint = stintsConfig.find((s) => l >= s.start && l <= s.end) || stintsConfig[0];
    const tyreAge = l - currentStint.start;

    // Base physics: fuel effect reduces ~0.04s per lap; tyre degradation adds ~0.05-0.08s per lap
    const fuelEffect = -0.038 * l;
    const degRate = currentStint.compound === "SOFT" ? 0.082 : currentStint.compound === "MEDIUM" ? 0.065 : 0.045;
    const tyreDeg = tyreAge * degRate;
    const isPitOut = l === 1 || l === currentStint.start;

    let lapDuration = baseLapTime + fuelEffect + tyreDeg;

    // Pit lap takes +22s
    if (l === 26) lapDuration += 21.5;
    if (isPitOut) lapDuration += 3.5;

    // Organic fluctuation
    const noise = Math.sin(l * 0.7 + driverNumber) * 0.35 + (l % 7 === 0 ? 0.5 : 0);
    lapDuration = Number((lapDuration + noise).toFixed(3));

    // Sector breakdown (~26% S1, ~48% S2, ~26% S3)
    const s1 = Number((lapDuration * 0.258 + (Math.cos(l * 0.5) * 0.12)).toFixed(3));
    const s2 = Number((lapDuration * 0.482 + (Math.sin(l * 0.5) * 0.18)).toFixed(3));
    const s3 = Number((lapDuration - s1 - s2).toFixed(3));

    const speedTrap = Math.round(322 + Math.sin(l * 0.3) * 6);
    const i1Speed = Math.round(315 + Math.cos(l * 0.4) * 4);
    const i2Speed = Math.round(298 + Math.sin(l * 0.5) * 5);

    if (lapDuration < overallFastestLap && !isPitOut && l !== 26) {
      overallFastestLap = lapDuration;
      overallFastestIdx = l;
    }

    laps.push({
      lapNumber: l,
      lapDuration,
      lapDurationDisplay: formatLapTime(lapDuration),
      s1,
      s2,
      s3,
      speedTrap,
      i1Speed,
      i2Speed,
      compound: currentStint.compound,
      tyreAge,
      isPitOut,
      isPersonalBest: false,
      isOverallFastest: false,
    });
  }

  // Mark fastest lap and personal best progression
  let currentPB = 999;
  for (const lap of laps) {
    if (!lap.isPitOut && lap.lapNumber !== 26 && lap.lapDuration < currentPB) {
      currentPB = lap.lapDuration;
      lap.isPersonalBest = true;
    }
  }

  if (laps[overallFastestIdx - 1]) {
    laps[overallFastestIdx - 1].isOverallFastest = true;
  }

  return laps;
}
