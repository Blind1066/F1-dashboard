import React from "react";

interface SeasonSelectProps {
  value: number;
  onChange?: (year: number) => void;
  disabled?: boolean;
}

export const SeasonSelect: React.FC<SeasonSelectProps> = ({
  value = 2026,
  onChange,
  disabled = false,
}) => {
  return (
    <label>
      Season
      <select
        id="year-select"
        aria-label="Season"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(Number(e.target.value))}
      >
        <option value={2026}>2026</option>
      </select>
    </label>
  );
};
