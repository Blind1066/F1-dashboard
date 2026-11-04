import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ScheduleRace } from "../types";
import { BRASIL_CIRCUIT_CONFIG } from "../data/brasilTrack";
import { INITIAL_LIVE_DRIVERS } from "../api/liveTiming";
import { CockpitGauge } from "./CockpitGauge";
import { Avatar } from "./Avatar";
import { DEMO_HEADSHOTS } from "../api/demo";
import { colourFor } from "../api/jolpica";

interface LiveInteractiveDashboardProps {
  race?: ScheduleRace | null;
  onClose?: () => void;
}

interface CarPosition {
  code: string;
  number: string;
  name: string;
  team: string;
  teamId: string;
  colour: string;
  headshot: string;
  position: number;
  delta: number;
  progress: number; // 0 to 1 along track
  x: number;
  y: number;
  speed: number;
  rpm: number;
  gear: number;
  throttle: number;
  brake: number;
  drsActive: boolean;
  sector1: string;
  sector2: string;
  sector3: string;
  bestLap: string;
  gap: string;
  tyre: "soft" | "medium" | "hard";
  tyreStint: number;
}

export const LiveInteractiveDashboard: React.FC<LiveInteractiveDashboardProps> = ({
  race,
  onClose,
}) => {
  const navigate = useNavigate();
  const trackPathRef = useRef<SVGPathElement | null>(null);

  // Top Nav State
  const [topTab, setTopTab] = useState<"tracker" | "leaderboard" | "commentary">("tracker");
  const [subTab, setSubTab] = useState<"telemetry" | "sectors" | "head-to-head" | "laps">("telemetry");

  // Selected driver (default to P2 or P1)
  const [selectedCode, setSelectedCode] = useState<string>("NOR");
  const [battleCode, setBattleCode] = useState<string>("VER");
  const [isBattleMode, setIsBattleMode] = useState(false);

  // Map Controls State
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Lap State
  const [currentLap] = useState(48);
  const totalLaps = 71;

  // Initialize cars spread along the track
  const [cars, setCars] = useState<CarPosition[]>(() => {
    return INITIAL_LIVE_DRIVERS.map((d, index) => {
      // Stagger cars along the track (0.0 to 1.0)
      const baseProgress = (1 - (index * 0.045)) % 1;
      return {
        code: d.code,
        number: d.number,
        name: d.name,
        team: d.team,
        teamId: d.teamId,
        colour: colourFor(d.teamId),
        headshot: DEMO_HEADSHOTS[d.code] || "",
        position: index + 1,
        delta: d.grid - (index + 1),
        progress: baseProgress < 0 ? baseProgress + 1 : baseProgress,
        x: 620,
        y: 180,
        speed: 240,
        rpm: 10400,
        gear: 6,
        throttle: 80,
        brake: 0,
        drsActive: false,
        sector1: "18.240",
        sector2: "32.180",
        sector3: "20.910",
        bestLap: d.bestLap,
        gap: index === 0 ? "LEADER" : `+${d.baseGap.toFixed(3)}s`,
        tyre: d.tyre,
        tyreStint: d.pitStops + 1,
      };
    });
  });

  // Toggle browser fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Close handler
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/");
    }
  };

  // Animation Loop: Updates car progress, coordinates, and telemetry along the circuit
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying && trackPathRef.current) {
        const pathEl = trackPathRef.current;
        let totalLength = 0;
        try {
          totalLength = pathEl.getTotalLength();
        } catch {
          totalLength = 2200;
        }

        setCars((prevCars) =>
          prevCars.map((car, idx) => {
            // Speed along track (approx 0.015 track distance per second at 1x)
            const speedFactor = 0.018 * speedMultiplier * (1 + (20 - idx) * 0.003);
            const newProgress = (car.progress + speedFactor * dt) % 1;

            // Compute SVG (x, y) coordinates on the track path
            const dist = newProgress * totalLength;
            let pt = { x: car.x, y: car.y };
            try {
              pt = pathEl.getPointAtLength(dist);
            } catch {
              // fallback
            }

            // Derive realistic telemetry based on track location:
            // Straights (y < 210 or y > 450 with low curvature): high speed, 8th gear, 100% throttle, DRS on!
            // Turns (Senna S, Bico de Pato, Ferradura): high curvature, braking, 3rd-4th gear, DRS off.
            const isStraight1 = pt.y > 170 && pt.y < 200 && pt.x < 520 && pt.x > 210; // Reta Oposta
            const isStraight2 = (pt.x > 570 && pt.y < 240) || (pt.x > 580 && pt.y > 330); // Main straight
            const isDRSZone = isStraight1 || isStraight2;

            let curSpeed = 240;
            let curRpm = 10500;
            let curGear = 6;
            let curThrottle = 85;
            let curBrake = 0;

            if (isDRSZone) {
              curSpeed = 310 + Math.sin(time * 0.003 + idx) * 15;
              curRpm = 11800 + Math.sin(time * 0.005) * 400;
              curGear = 8;
              curThrottle = 100;
              curBrake = 0;
            } else if (pt.y > 270 && pt.x > 590) {
              // Senna S turns 1-2
              curSpeed = 125 + Math.sin(time * 0.004) * 8;
              curRpm = 8900;
              curGear = 3;
              curThrottle = 35;
              curBrake = 65;
            } else if (pt.x < 420 && pt.x > 360 && pt.y < 360 && pt.y > 320) {
              // Bico de Pato hairpin (Turn 10)
              curSpeed = 85 + Math.sin(time * 0.004) * 6;
              curRpm = 7800;
              curGear = 2;
              curThrottle = 20;
              curBrake = 85;
            } else {
              // Mid-speed flowing curves
              curSpeed = 195 + Math.sin(time * 0.002 + idx) * 20;
              curRpm = 10200;
              curGear = 5;
              curThrottle = 75;
              curBrake = 10;
            }

            return {
              ...car,
              progress: newProgress,
              x: pt.x,
              y: pt.y,
              speed: curSpeed,
              rpm: curRpm,
              gear: curGear,
              throttle: curThrottle,
              brake: curBrake,
              drsActive: isDRSZone,
            };
          })
        );
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speedMultiplier]);

  // Selected car data
  const selectedCar = cars.find((c) => c.code === selectedCode) || cars[0];
  const battleCar = cars.find((c) => c.code === battleCode) || cars[1];

  // Commentary feed mock items
  const commentaryItems = [
    { lap: "LAP 48", text: "Norris holds a 1.482s lead over Verstappen heading into Descida do Lago." },
    { lap: "LAP 47", text: "FASTEST LAP: Lando Norris sets a blistering 1:10.540 with purple in Sector 2!" },
    { lap: "LAP 45", text: "Piastri closes to within DRS detection of Leclerc for 3rd position." },
    { lap: "LAP 42", text: "Hamilton completes 2nd pit stop for fresh Soft tyres. Rejoining in P7." },
    { lap: "LAP 38", text: "Track temperature rising to 42°C. High tyre degradation reported on medium compound." },
  ];

  return (
    <div className="f1-pitwall-fullscreen-window" aria-label="F1 Live Driver Tracker Pitwall">
      {/* 1. TOP RED F1 HEADER BAR */}
      <header className="f1-top-red-bar">
        <div className="top-bar-left">
          <div className="f1-logo-badge">
            <span>F1</span>
          </div>
          <div className="f1-event-title">
            <span className="event-location">SÃO PAULO 2026</span>
            <span className="event-session">RACE — {race?.name || BRASIL_CIRCUIT_CONFIG.grandPrixName}</span>
          </div>
        </div>

        {/* Center Navigation Tabs (LEADERBOARD / DRIVER TRACKER / COMMENTARY) */}
        <nav className="f1-center-nav-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={topTab === "leaderboard"}
            className={`nav-tab-btn${topTab === "leaderboard" ? " active" : ""}`}
            onClick={() => setTopTab("leaderboard")}
          >
            <span>⏱️ LEADERBOARD</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={topTab === "tracker"}
            className={`nav-tab-btn${topTab === "tracker" ? " active" : ""}`}
            onClick={() => setTopTab("tracker")}
          >
            <span>🏎️ DRIVER TRACKER</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={topTab === "commentary"}
            className={`nav-tab-btn${topTab === "commentary" ? " active" : ""}`}
            onClick={() => setTopTab("commentary")}
          >
            <span>💬 COMMENTARY</span>
          </button>
        </nav>

        {/* Right Action Icons */}
        <div className="top-bar-right">
          <button
            type="button"
            className="icon-action-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <span>{isFullscreen ? "🗗" : "⛶"}</span>
          </button>
          <button
            type="button"
            className="icon-action-btn close-btn"
            onClick={handleClose}
            title="Close Pitwall"
          >
            <span>✕</span>
          </button>
        </div>
      </header>

      {/* 2. SUB-HEADER BAR (LIVE BADGE & SECONDARY TABS) */}
      <div className="f1-sub-header-bar">
        <div className="sub-header-left">
          <div className="live-pill-badge">
            <span className="live-radar-dot" />
            <span>LIVE</span>
          </div>
          <span className="session-flag-tag">🟢 GREEN FLAG</span>
        </div>

        <div className="sub-header-tabs" role="tablist">
          <button
            type="button"
            className={`sub-tab-btn${subTab === "laps" ? " active" : ""}`}
            onClick={() => setSubTab("laps")}
          >
            Laps
          </button>
          <button
            type="button"
            className={`sub-tab-btn${subTab === "sectors" ? " active" : ""}`}
            onClick={() => setSubTab("sectors")}
          >
            Sectors
          </button>
          <button
            type="button"
            className={`sub-tab-btn${subTab === "head-to-head" || isBattleMode ? " active" : ""}`}
            onClick={() => {
              setSubTab("head-to-head");
              setIsBattleMode(true);
            }}
          >
            Head to Head
          </button>
          <button
            type="button"
            className={`sub-tab-btn${subTab === "telemetry" && !isBattleMode ? " active" : ""}`}
            onClick={() => {
              setSubTab("telemetry");
              setIsBattleMode(false);
            }}
          >
            Telemetry
          </button>
        </div>
      </div>

      {/* 3. MAIN INTERACTIVE BODY */}
      <div className="f1-pitwall-main-body">
        {/* VIEW 1: DRIVER TRACKER & COCKPIT HUD (Default) */}
        {topTab === "tracker" && (
          <div className="tracker-split-layout">
            {/* LEFT SECTION: Vertical Ladder & Cockpit HUD */}
            <div className="tracker-left-panel">
              {/* Vertical Position Strip (P1 to P20) */}
              <div className="vertical-position-ladder" aria-label="Driver Position Ladder">
                <div className="v-ladder-header">POSITION</div>
                <div className="v-ladder-scroll">
                  {cars.map((c) => {
                    const isSelected = c.code === selectedCode;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        className={`v-ladder-item${isSelected ? " active-driver" : ""}`}
                        onClick={() => setSelectedCode(c.code)}
                        title={`Select ${c.name}`}
                      >
                        <span className="v-pos">{c.position}</span>
                        <span className="v-team-stripe" style={{ background: c.colour }} />
                        <span className="v-code">{c.code}</span>
                        <span className="v-delta">
                          {c.delta > 0 ? (
                            <span className="delta-up">▲</span>
                          ) : c.delta < 0 ? (
                            <span className="delta-down">▼</span>
                          ) : (
                            <span className="delta-neutral">-</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Driver Telemetry Cockpit Panel */}
              <div className="driver-cockpit-panel">
                {/* Header: Avatar, Driver Name, Team, Best Lap */}
                <div className="cockpit-driver-header">
                  <div className="cdh-left">
                    <Avatar
                      acronym={selectedCar.code}
                      headshotUrl={selectedCar.headshot}
                    />
                    <div>
                      <div className="cdh-name-row">
                        <span className="cdh-code">{selectedCar.code}</span>
                        <span className="cdh-team" style={{ color: selectedCar.colour }}>
                          {selectedCar.team}
                        </span>
                      </div>
                      <div className="cdh-pos-badge">Position P{selectedCar.position} • {selectedCar.gap}</div>
                    </div>
                  </div>

                  <div className="cdh-right-best">
                    <span className="cdh-best-lap">{selectedCar.bestLap}</span>
                    <span className="cdh-tyre-badge">{selectedCar.tyreStint} {selectedCar.tyre[0].toUpperCase()}</span>
                  </div>
                </div>

                {/* Cockpit Circular Gauge Component */}
                <CockpitGauge
                  speed={selectedCar.speed}
                  rpm={selectedCar.rpm}
                  throttle={selectedCar.throttle}
                  brake={selectedCar.brake}
                  gear={selectedCar.gear}
                  drsActive={selectedCar.drsActive}
                  sector1={selectedCar.sector1}
                  sector2={selectedCar.sector2}
                  sector3={selectedCar.sector3}
                  bestLap={selectedCar.bestLap}
                  isBattleMode={isBattleMode}
                  onEnterBattleMode={() => setIsBattleMode((prev) => !prev)}
                />

                {/* Battle Mode Split Compare (if active) */}
                {isBattleMode && (
                  <div className="battle-mode-compare-box">
                    <div className="battle-header">
                      <span>HEAD-TO-HEAD BATTLE</span>
                      <select
                        value={battleCode}
                        onChange={(e) => setBattleCode(e.target.value)}
                        className="battle-select"
                      >
                        {cars
                          .filter((c) => c.code !== selectedCode)
                          .map((c) => (
                            <option key={c.code} value={c.code}>
                              P{c.position} {c.code} ({c.team})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="battle-stats-grid">
                      <div className="battle-driver a">
                        <span className="bd-name" style={{ color: selectedCar.colour }}>{selectedCar.code}</span>
                        <span className="bd-speed">{Math.round(selectedCar.speed)} KM/H</span>
                        <span className="bd-time">{selectedCar.bestLap}</span>
                      </div>
                      <div className="battle-vs-badge">VS</div>
                      <div className="battle-driver b">
                        <span className="bd-name" style={{ color: battleCar.colour }}>{battleCar.code}</span>
                        <span className="bd-speed">{Math.round(battleCar.speed)} KM/H</span>
                        <span className="bd-time">{battleCar.bestLap}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SECTION: 2D LIVE DRIVER TRACKER MAP */}
            <div className="tracker-map-panel">
              {/* Map View Controls Overlay (Compass, Zoom, Reset, Play/Pause) */}
              <div className="map-overlay-controls">
                <div className="map-compass" title="North orientation">
                  <span>N ⬆</span>
                </div>
                <button
                  type="button"
                  className="map-ctrl-btn"
                  onClick={() => setZoomLevel(1)}
                  title="Reset rotation & view"
                >
                  ↺
                </button>
                <button
                  type="button"
                  className="map-ctrl-btn"
                  onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  type="button"
                  className="map-ctrl-btn"
                  onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                  title="Zoom Out"
                >
                  -
                </button>
                <button
                  type="button"
                  className={`map-ctrl-btn${!isPlaying ? " paused" : ""}`}
                  onClick={() => setIsPlaying((p) => !p)}
                  title={isPlaying ? "Pause simulation" : "Play simulation"}
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <button
                  type="button"
                  className="map-ctrl-btn speed-btn"
                  onClick={() => setSpeedMultiplier((s) => (s === 1 ? 2 : s === 2 ? 4 : 1))}
                  title="Simulation Speed Multiplier"
                >
                  {speedMultiplier}x
                </button>
              </div>

              {/* The SVG Track Canvas */}
              <div className="track-canvas-wrapper" style={{ transform: `scale(${zoomLevel})` }}>
                <svg
                  viewBox={BRASIL_CIRCUIT_CONFIG.viewBox}
                  className="brasil-interactive-svg"
                  aria-label="Autódromo José Carlos Pace Live Driver Tracker"
                >
                  <defs>
                    <linearGradient id="drsGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ffd000" />
                      <stop offset="100%" stopColor="#3ecf8e" />
                    </linearGradient>

                    <filter id="beaconGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="8" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Reference Calculation Path (invisible, used by getTotalLength) */}
                  <path
                    ref={trackPathRef}
                    d={BRASIL_CIRCUIT_CONFIG.trackPath}
                    fill="none"
                    stroke="none"
                  />

                  {/* Wide Track Surface Base */}
                  <path
                    d={BRASIL_CIRCUIT_CONFIG.trackPath}
                    fill="none"
                    stroke="#1a1c23"
                    strokeWidth="32"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Outer Curb Borders */}
                  <path
                    d={BRASIL_CIRCUIT_CONFIG.trackPath}
                    fill="none"
                    stroke="#2e323d"
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Asphalt Track Surface */}
                  <path
                    d={BRASIL_CIRCUIT_CONFIG.trackPath}
                    fill="none"
                    stroke="#0d0e12"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Yellow DRS Zones Highlights */}
                  {BRASIL_CIRCUIT_CONFIG.drsZones.map((drs) => (
                    <path
                      key={drs.id}
                      d={drs.path}
                      fill="none"
                      stroke="#ffe600"
                      strokeWidth="6"
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                  ))}

                  {/* Start / Finish Line Checkered Strip */}
                  <g transform={`translate(${BRASIL_CIRCUIT_CONFIG.startFinish.x}, ${BRASIL_CIRCUIT_CONFIG.startFinish.y}) rotate(${BRASIL_CIRCUIT_CONFIG.startFinish.angle})`}>
                    <line x1="0" y1="-10" x2="0" y2="10" stroke="#ffffff" strokeWidth="4" strokeDasharray="3 3" />
                    <rect x="-8" y="-12" width="16" height="24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" rx="2" />
                  </g>

                  {/* Turn Numbers */}
                  {BRASIL_CIRCUIT_CONFIG.turns.map((t) => (
                    <g key={t.number} transform={`translate(${t.x}, ${t.y})`} className="turn-node">
                      <circle cx="0" cy="0" r="10" fill="#181a20" stroke="#333846" strokeWidth="1.5" />
                      <text x="0" y="3.5" fill="#8b92a0" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="var(--display)">
                        {t.number}
                      </text>
                    </g>
                  ))}

                  {/* Track Annotations: Speed Trap & DRS Labels */}
                  <g transform={`translate(${BRASIL_CIRCUIT_CONFIG.speedTrap.x}, ${BRASIL_CIRCUIT_CONFIG.speedTrap.y - 12})`}>
                    <circle cx="0" cy="12" r="3.5" fill="#ffffff" />
                    <rect x="-35" y="-14" width="70" height="15" rx="3" fill="#181a20" stroke="#333846" />
                    <text x="0" y="-3.5" fill="#ffffff" fontSize="7.5" fontWeight="700" letterSpacing="0.06em" textAnchor="middle" fontFamily="var(--display)">
                      SPEED TRAP
                    </text>
                  </g>

                  {/* DRS Activation Zone 1 Label */}
                  <g transform="translate(585, 305)">
                    <rect x="-4" y="-8" width="82" height="13" rx="3" fill="#181a20" stroke="#ffe600" strokeWidth="0.8" />
                    <text x="37" y="1" fill="#ffe600" fontSize="6.5" fontWeight="700" letterSpacing="0.05em" textAnchor="middle" fontFamily="var(--display)">
                      DRS ACTIVATION ZONE 1
                    </text>
                  </g>

                  {/* DRS Activation Zone 2 Label */}
                  <g transform="translate(370, 160)">
                    <rect x="-4" y="-8" width="82" height="13" rx="3" fill="#181a20" stroke="#ffe600" strokeWidth="0.8" />
                    <text x="37" y="1" fill="#ffe600" fontSize="6.5" fontWeight="700" letterSpacing="0.05em" textAnchor="middle" fontFamily="var(--display)">
                      DRS ACTIVATION ZONE 2
                    </text>
                  </g>

                  {/* Sector Labels */}
                  {BRASIL_CIRCUIT_CONFIG.sectors.map((sec) => (
                    <text
                      key={sec.name}
                      x={sec.x}
                      y={sec.y}
                      fill="#505663"
                      fontSize="9"
                      fontWeight="700"
                      letterSpacing="0.1em"
                      fontFamily="var(--display)"
                    >
                      {sec.name}
                    </text>
                  ))}

                  {/* LIVE MOVING DRIVER BLIPS */}
                  {cars.map((car) => {
                    const isSelected = car.code === selectedCode;
                    const isBattle = isBattleMode && car.code === battleCode;

                    return (
                      <g
                        key={car.code}
                        transform={`translate(${car.x}, ${car.y})`}
                        className={`driver-blip-node${isSelected ? " selected-blip" : ""}`}
                        onClick={() => setSelectedCode(car.code)}
                        cursor="pointer"
                      >
                        {/* Selected Driver Pulsing Beacon Ring */}
                        {isSelected && (
                          <>
                            <circle
                              cx="0"
                              cy="0"
                              r="26"
                              fill="none"
                              stroke="var(--accent)"
                              strokeWidth="2"
                              opacity="0.4"
                              filter="url(#beaconGlow)"
                              className="beacon-pulse"
                            />
                            <circle
                              cx="0"
                              cy="0"
                              r="16"
                              fill="color-mix(in srgb, var(--accent) 30%, transparent)"
                              stroke="var(--accent)"
                              strokeWidth="2"
                            />
                          </>
                        )}

                        {/* Battle Opponent Ring */}
                        {isBattle && (
                          <circle
                            cx="0"
                            cy="0"
                            r="15"
                            fill="none"
                            stroke="#ff9f0a"
                            strokeWidth="2.5"
                            strokeDasharray="3 3"
                          />
                        )}

                        {/* Driver Car Blip Circle */}
                        <circle
                          cx="0"
                          cy="0"
                          r={isSelected ? 9 : 6.5}
                          fill={car.colour}
                          stroke="#ffffff"
                          strokeWidth={isSelected ? 2 : 1.2}
                        />

                        {/* Driver 3-Letter Tag Banner */}
                        <g transform={`translate(${isSelected ? 14 : 10}, ${isSelected ? -10 : -7})`}>
                          <rect
                            x="0"
                            y="0"
                            width={isSelected ? 36 : 28}
                            height={isSelected ? 18 : 14}
                            rx="3"
                            fill={isSelected ? "#ffffff" : "#181a20"}
                            stroke={isSelected ? "var(--accent)" : "rgba(255,255,255,0.2)"}
                            strokeWidth={isSelected ? 1.5 : 0.8}
                          />
                          <text
                            x={isSelected ? 18 : 14}
                            y={isSelected ? 13 : 10}
                            fill={isSelected ? "#000000" : "#ffffff"}
                            fontSize={isSelected ? 9.5 : 7.5}
                            fontWeight="700"
                            letterSpacing="0.06em"
                            textAnchor="middle"
                            fontFamily="var(--display)"
                          >
                            {car.code}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: LEADERBOARD TAB (Full timing table) */}
        {topTab === "leaderboard" && (
          <div className="fullscreen-leaderboard-view">
            <table className="f1-leaderboard-table">
              <thead>
                <tr>
                  <th>POS</th>
                  <th>+/-</th>
                  <th>DRIVER</th>
                  <th>TEAM</th>
                  <th>GAP</th>
                  <th>SPEED</th>
                  <th>GEAR</th>
                  <th>BEST LAP</th>
                  <th>TYRE</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((c) => (
                  <tr
                    key={c.code}
                    className={`lb-row${c.code === selectedCode ? " selected" : ""}`}
                    onClick={() => {
                      setSelectedCode(c.code);
                      setTopTab("tracker");
                    }}
                  >
                    <td>
                      <span className={`pos-pill pos-${c.position}`}>{c.position}</span>
                    </td>
                    <td>
                      {c.delta > 0 ? (
                        <span className="delta-up">▲ +{c.delta}</span>
                      ) : c.delta < 0 ? (
                        <span className="delta-down">▼ {c.delta}</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>
                      <div className="lb-driver-info">
                        <Avatar acronym={c.code} headshotUrl={c.headshot} />
                        <div>
                          <strong>{c.name}</strong>
                          <span className="lb-code">#{c.number} {c.code}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="lb-team-info">
                        <span className="team-indicator" style={{ background: c.colour }} />
                        <span>{c.team}</span>
                      </div>
                    </td>
                    <td className="lb-gap">{c.gap}</td>
                    <td className="lb-speed">{Math.round(c.speed)} km/h</td>
                    <td className="lb-gear">G{c.gear}</td>
                    <td className="lb-best-lap">{c.bestLap}</td>
                    <td>
                      <span className={`tyre-tag ${c.tyre}`}>{c.tyreStint} {c.tyre[0].toUpperCase()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 3: COMMENTARY TAB */}
        {topTab === "commentary" && (
          <div className="fullscreen-commentary-view">
            <h3 className="comm-title">Official FIA Race Control &amp; Commentary Feed</h3>
            <div className="comm-stream">
              {commentaryItems.map((item, idx) => (
                <div key={idx} className="comm-item">
                  <span className="comm-lap-tag">{item.lap}</span>
                  <span className="comm-text">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. BOTTOM STATUS BAR */}
      <footer className="f1-bottom-telemetry-bar">
        <div className="f1-bot-left">
          <span className="bot-session-clock">
            🔴 RACE — LAP <strong>{currentLap}</strong> OF {totalLaps}
          </span>
          <span className="bot-timer">ELAPSED: 1:12:44</span>
        </div>

        <div className="f1-bot-center">
          <span>🌡️ Air: <strong>22°C</strong></span>
          <span>•</span>
          <span>Track: <strong>42°C</strong></span>
          <span>•</span>
          <span>Humidity: <strong>54%</strong></span>
        </div>

        <div className="f1-bot-right">
          <span className="rolex-watermark">PITWALL LIVE TELEMETRY</span>
        </div>
      </footer>
    </div>
  );
};
