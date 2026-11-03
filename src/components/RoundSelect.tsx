import React from "react";
import type { Race } from "../types";

interface RoundSelectProps {
  races: Race[];
  selectedRound: number;
  onChange: (round: number) => void;
  disabled?: boolean;
}

export const RoundSelect: React.FC<RoundSelectProps> = ({
  races,
  selectedRound,
  onChange,
  disabled = false,
}) => {
  // Show completed rounds in reverse order (newest first)
  const reversed = [...races].reverse();

  return (
    <label>
      After round
      <select
        id="race-select"
        aria-label="Standings after race"
        value={selectedRound || ""}
        disabled={disabled || !races.length}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {reversed.map((r) => (
          <option key={r.round} value={r.round}>
            R{r.round} · {r.name}
          </option>
        ))}
      </select>
    </label>
  );
};

