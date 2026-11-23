import { describe, expect, it } from "vitest";
import { processOpenF1Laps, alignTelemetryPair } from "../api/openf1";
import { computeLinearRegression } from "../utils/regression";
import type { OpenF1Lap, OpenF1Stint, TelemetryDataPoint } from "../types/telemetry";

describe("processOpenF1Laps", () => {
  it("returns empty array for empty or undefined input", () => {
    expect(processOpenF1Laps([])).toEqual([]);
    // @ts-expect-error test invalid input runtime safety
    expect(processOpenF1Laps(null)).toEqual([]);
  });

  it("handles a single lap correctly and calculates lap details", () => {
    const rawLaps: OpenF1Lap[] = [
      {
        meeting_key: 1200,
        session_key: 9636,
        driver_number: 1,
        lap_number: 1,
        lap_duration: 72.45,
        is_pit_out_lap: false,
        duration_sector_1: 18.5,
        duration_sector_2: 32.8,
        duration_sector_3: 21.15,
        date_start: "2024-11-03T17:00:00.000",
      },
    ];

    const result = processOpenF1Laps(rawLaps, []);
    expect(result).toHaveLength(1);
    expect(result[0].lapNumber).toBe(1);
    expect(result[0].lapDuration).toBe(72.45);
    expect(result[0].lapDurationDisplay).toBe("1:12.450");
    expect(result[0].isPersonalBest).toBe(true);
    expect(result[0].isOverallFastest).toBe(true);
    expect(result[0].compound).toBe("UNKNOWN"); // Must be UNKNOWN when stint data missing
    expect(result[0].tyreAge).toBe(1);
  });

  it("sets compound to 'UNKNOWN' when stint data is missing", () => {
    const rawLaps: OpenF1Lap[] = [
      {
        meeting_key: 1200,
        session_key: 9636,
        driver_number: 44,
        lap_number: 10,
        lap_duration: 74.2,
        is_pit_out_lap: false,
        duration_sector_1: 19.1,
        date_start: "2024-11-03T17:10:00.000",
      },
      {
        meeting_key: 1200,
        session_key: 9636,
        driver_number: 44,
        lap_number: 11,
        lap_duration: 74.5,
        is_pit_out_lap: false,
        duration_sector_1: 30.5, // Even with high sector 1, do NOT guess INTERMEDIATE
        date_start: "2024-11-03T17:11:14.200",
      },
    ];

    const result = processOpenF1Laps(rawLaps, []);
    expect(result[0].compound).toBe("UNKNOWN");
    expect(result[1].compound).toBe("UNKNOWN");
  });

  it("correctly maps stint compound and computes tyre age across multiple stints", () => {
    const rawLaps: OpenF1Lap[] = [
      { meeting_key: 1, session_key: 9636, driver_number: 1, lap_number: 1, lap_duration: 73.0, is_pit_out_lap: false, date_start: "2024-11-03T17:00:00.000" },
      { meeting_key: 1, session_key: 9636, driver_number: 1, lap_number: 2, lap_duration: 72.5, is_pit_out_lap: false, date_start: "2024-11-03T17:01:13.000" },
      { meeting_key: 1, session_key: 9636, driver_number: 1, lap_number: 21, lap_duration: 95.0, is_pit_out_lap: true, date_start: "2024-11-03T17:25:00.000" },
      { meeting_key: 1, session_key: 9636, driver_number: 1, lap_number: 22, lap_duration: 71.8, is_pit_out_lap: false, date_start: "2024-11-03T17:26:35.000" },
    ];

    const stints: OpenF1Stint[] = [
      { session_key: 9636, meeting_key: 1, driver_number: 1, stint_number: 1, compound: "MEDIUM", lap_start: 1, lap_end: 20, tyre_age_at_start: 0 },
      { session_key: 9636, meeting_key: 1, driver_number: 1, stint_number: 2, compound: "HARD", lap_start: 21, lap_end: 50, tyre_age_at_start: 0 },
    ];

    const result = processOpenF1Laps(rawLaps, stints);
    expect(result).toHaveLength(4);
    expect(result[0].compound).toBe("MEDIUM");
    expect(result[0].tyreAge).toBe(1);
    expect(result[1].compound).toBe("MEDIUM");
    expect(result[1].tyreAge).toBe(2);

    expect(result[2].compound).toBe("HARD");
    expect(result[2].tyreAge).toBe(1);
    expect(result[2].isPitOut).toBe(true);

    expect(result[3].compound).toBe("HARD");
    expect(result[3].tyreAge).toBe(2);
    expect(result[3].isPersonalBest).toBe(true);
  });
});

describe("alignTelemetryPair", () => {
  it("handles empty arrays gracefully without throwing", () => {
    const aligned = alignTelemetryPair([], []);
    expect(aligned).toEqual([]);
  });

  it("handles single driver telemetry with empty driver B", () => {
    const driverA: TelemetryDataPoint[] = [
      { distance: 0, timeSec: 0, speed: 280, throttle: 100, brake: 0, gear: 7, rpm: 11000, drs: false },
      { distance: 50, timeSec: 0.65, speed: 290, throttle: 100, brake: 0, gear: 8, rpm: 11500, drs: true },
    ];

    const aligned = alignTelemetryPair(driverA, [], 50, 25);
    expect(aligned.length).toBeGreaterThan(0);
    expect(aligned[0].distance).toBe(0);
    expect(aligned[0].speed).toBe(280);
    expect(aligned[0].delta).toBe(0);
  });

  it("aligns telemetry pairs and computes delta between two drivers", () => {
    const driverA: TelemetryDataPoint[] = [
      { distance: 0, timeSec: 0, speed: 200, throttle: 100, brake: 0, gear: 5, rpm: 10000, drs: false },
      { distance: 100, timeSec: 1.5, speed: 250, throttle: 100, brake: 0, gear: 6, rpm: 11000, drs: false },
    ];

    const driverB: TelemetryDataPoint[] = [
      { distance: 0, timeSec: 0, speed: 190, throttle: 90, brake: 0, gear: 5, rpm: 9800, drs: false },
      { distance: 100, timeSec: 1.6, speed: 240, throttle: 100, brake: 0, gear: 6, rpm: 10800, drs: false },
    ];

    const aligned = alignTelemetryPair(driverA, driverB, 100, 50);
    expect(aligned).toHaveLength(3); // 0m, 50m, 100m
    expect(aligned[0].distance).toBe(0);
    expect(aligned[0].delta).toBe(0);

    const at100 = aligned[2];
    expect(at100.distance).toBe(100);
    // Driver A time 1.5 - Driver B time 1.6 = -0.1s delta (A is faster)
    expect(at100.delta).toBe(-0.1);
    expect(at100.speed).toBe(250);
    expect(at100.compareSpeed).toBe(240);
  });
});

describe("computeLinearRegression", () => {
  it("returns null for empty array or null/undefined", () => {
    expect(computeLinearRegression([])).toBeNull();
    // @ts-expect-error test runtime robustness
    expect(computeLinearRegression(null)).toBeNull();
  });

  it("returns null for a single point", () => {
    expect(computeLinearRegression([{ x: 5, y: 72.5 }])).toBeNull();
  });

  it("returns null when all x coordinates are identical (vertical line / zero variance)", () => {
    const points = [
      { x: 10, y: 72 },
      { x: 10, y: 73 },
      { x: 10, y: 74 },
    ];
    expect(computeLinearRegression(points)).toBeNull();
  });

  it("computes exact slope, intercept, and R2 for a perfectly linear series", () => {
    // y = 2x + 1
    const points = [
      { x: 1, y: 3 },
      { x: 2, y: 5 },
      { x: 3, y: 7 },
      { x: 4, y: 9 },
      { x: 5, y: 11 },
    ];

    const res = computeLinearRegression(points);
    expect(res).not.toBeNull();
    expect(res?.n).toBe(5);
    expect(res?.slope).toBe(2);
    expect(res?.intercept).toBe(1);
    expect(res?.r2).toBe(1);
  });

  it("computes realistic positive degradation slope for tyre degradation", () => {
    // Simulated stint laps: lap times slowly getting worse as tyre ages
    const points = [
      { x: 1, y: 72.1 },
      { x: 2, y: 72.2 },
      { x: 3, y: 72.25 },
      { x: 4, y: 72.38 },
      { x: 5, y: 72.45 },
      { x: 6, y: 72.6 },
    ];

    const res = computeLinearRegression(points);
    expect(res).not.toBeNull();
    expect(res?.n).toBe(6);
    expect(res?.slope).toBeGreaterThan(0.08);
    expect(res?.slope).toBeLessThan(0.12);
    expect(res?.r2).toBeGreaterThan(0.95);
  });

  it("handles identical y values without crashing and returns slope 0 with R2=1", () => {
    const points = [
      { x: 1, y: 72.0 },
      { x: 2, y: 72.0 },
      { x: 3, y: 72.0 },
      { x: 4, y: 72.0 },
      { x: 5, y: 72.0 },
    ];

    const res = computeLinearRegression(points);
    expect(res).not.toBeNull();
    expect(res?.slope).toBe(0);
    expect(res?.intercept).toBe(72);
    expect(res?.r2).toBe(1);
  });
});
