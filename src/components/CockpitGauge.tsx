import React from "react";

interface CockpitGaugeProps {
  speed: number; // km/h
  rpm: number; // e.g. 10240
  throttle: number; // 0 - 100 %
  brake: number; // 0 - 100 %
  gear: number; // 1 - 8
  drsActive: boolean;
  sector1?: string;
  sector2?: string;
  sector3?: string;
  bestLap?: string;
  onEnterBattleMode?: () => void;
  isBattleMode?: boolean;
}

export const CockpitGauge: React.FC<CockpitGaugeProps> = ({
  speed,
  rpm,
  throttle,
  brake,
  gear,
  drsActive,
  sector1 = "18.240",
  sector2 = "32.180",
  sector3 = "20.910",
  bestLap = "1:10.540",
  onEnterBattleMode,
  isBattleMode = false,
}) => {
  // SVG circular arc calculations
  // Radius = 85, Center = (110, 110)
  // Left half (Throttle): from 90° to 270° (top to bottom on left)
  // Right half (Brake): from -90° to 90° (top to bottom on right)
  const radius = 80;
  const circumference = Math.PI * radius; // half circle perimeter ~ 251.3

  const throttleDashoffset = circumference * (1 - Math.max(0, Math.min(100, throttle)) / 100);
  const brakeDashoffset = circumference * (1 - Math.max(0, Math.min(100, brake)) / 100);

  return (
    <div className="cockpit-gauge-container" aria-label="Cockpit Telemetry HUD">
      {/* SVG Dial Gauge */}
      <div className="gauge-dial-wrap">
        <svg viewBox="0 0 220 220" className="gauge-svg">
          <defs>
            <linearGradient id="throttleGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0066ff" />
              <stop offset="100%" stopColor="#00d4ff" />
            </linearGradient>
            <linearGradient id="brakeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ff5500" />
              <stop offset="100%" stopColor="#ff2200" />
            </linearGradient>
          </defs>

          {/* Background Outer Ring */}
          <circle
            cx="110"
            cy="110"
            r="102"
            fill="none"
            stroke="var(--line)"
            strokeWidth="1.5"
            strokeDasharray="2 6"
            opacity="0.6"
          />

          {/* Speed Scale Numbers */}
          <text x="32" y="114" fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily="var(--display)">60</text>
          <text x="50" y="55" fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily="var(--display)">120</text>
          <text x="110" y="24" fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily="var(--display)">180</text>
          <text x="170" y="55" fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily="var(--display)">240</text>
          <text x="188" y="114" fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily="var(--display)">300</text>
          <text x="160" y="175" fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily="var(--display)">360</text>

          {/* Track Baseline Arcs */}
          {/* Left arc: Throttle track */}
          <path
            d="M 110 30 A 80 80 0 0 0 110 190"
            fill="none"
            stroke="var(--surface-2)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Right arc: Brake track */}
          <path
            d="M 110 30 A 80 80 0 0 1 110 190"
            fill="none"
            stroke="var(--surface-2)"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Dynamic Throttle Arc (Left, Blue) */}
          <path
            d="M 110 190 A 80 80 0 0 1 110 30"
            fill="none"
            stroke="url(#throttleGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={throttleDashoffset}
            style={{ transition: "stroke-dashoffset 0.15s ease" }}
          />

          {/* Dynamic Brake Arc (Right, Red) */}
          <path
            d="M 110 190 A 80 80 0 0 0 110 30"
            fill="none"
            stroke="url(#brakeGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={brakeDashoffset}
            style={{ transition: "stroke-dashoffset 0.15s ease" }}
          />

          {/* Label indicators */}
          <text
            x="48"
            y="125"
            fill="#00d4ff"
            fontSize="8"
            letterSpacing="0.08em"
            transform="rotate(-90 48 125)"
            textAnchor="middle"
            fontFamily="var(--display)"
            fontWeight="700"
          >
            THROTTLE
          </text>
          <text
            x="172"
            y="125"
            fill="#ff453a"
            fontSize="8"
            letterSpacing="0.08em"
            transform="rotate(90 172 125)"
            textAnchor="middle"
            fontFamily="var(--display)"
            fontWeight="700"
          >
            BRAKE
          </text>

          {/* Center Digital Readout */}
          {/* Speed */}
          <text
            x="110"
            y="98"
            fill="var(--text)"
            fontSize="44"
            fontWeight="700"
            fontFamily="var(--display)"
            textAnchor="middle"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {Math.round(speed)}
          </text>
          <text
            x="110"
            y="112"
            fill="var(--muted)"
            fontSize="11"
            fontWeight="600"
            letterSpacing="0.1em"
            fontFamily="var(--display)"
            textAnchor="middle"
          >
            KM/H
          </text>

          {/* RPM */}
          <text
            x="110"
            y="128"
            fill="var(--muted)"
            fontSize="12"
            fontWeight="600"
            fontFamily="var(--display)"
            textAnchor="middle"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {Math.round(rpm)} RPM
          </text>

          {/* DRS Pill */}
          <g transform="translate(86, 134)">
            <rect
              x="0"
              y="0"
              width="48"
              height="16"
              rx="4"
              fill={drsActive ? "color-mix(in srgb, #3ecf8e 25%, var(--surface))" : "var(--surface)"}
              stroke={drsActive ? "#3ecf8e" : "var(--line)"}
            />
            <text
              x="24"
              y="11"
              fill={drsActive ? "#3ecf8e" : "var(--muted)"}
              fontSize="9"
              fontWeight="700"
              fontFamily="var(--display)"
              letterSpacing="0.08em"
              textAnchor="middle"
            >
              DRS
            </text>
          </g>

          {/* Current Gear */}
          <text
            x="110"
            y="166"
            fill="var(--text)"
            fontSize="14"
            fontWeight="700"
            fontFamily="var(--display)"
            letterSpacing="0.06em"
            textAnchor="middle"
          >
            GEAR <tspan fill="var(--accent)" fontSize="18">{gear}</tspan>
          </text>
        </svg>
      </div>

      {/* Sector Times Breakdown Table */}
      <div className="gauge-sectors-table">
        <div className="gst-row">
          <span className="gst-label">SECTOR 1</span>
          <span className="gst-val">{sector1}</span>
        </div>
        <div className="gst-row">
          <span className="gst-label">SECTOR 2</span>
          <span className="gst-val">{sector2}</span>
        </div>
        <div className="gst-row">
          <span className="gst-label">SECTOR 3</span>
          <span className="gst-val">{sector3}</span>
        </div>
        <div className="gst-row best">
          <span className="gst-label">BEST LAP</span>
          <span className="gst-val purple">{bestLap}</span>
        </div>
      </div>

      {/* Enter Battle Mode Button */}
      {onEnterBattleMode && (
        <div className="battle-mode-wrap">
          <button
            type="button"
            className={`battle-mode-btn${isBattleMode ? " active" : ""}`}
            onClick={onEnterBattleMode}
            title="Toggle Head-to-Head Battle Mode comparison"
          >
            <div className="battle-icon-badge">
              <span>VS</span>
            </div>
            <span className="battle-btn-text">
              {isBattleMode ? "EXIT BATTLE MODE" : "ENTER BATTLE MODE"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
