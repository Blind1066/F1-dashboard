import React from "react";

interface HeroProps {
  eyebrow?: string;
  title?: string;
  statusLine?: string;
  controls?: React.ReactNode;
}

export const Hero: React.FC<HeroProps> = ({
  eyebrow = "Championship standings",
  title = "Driver & Constructor Standings",
  statusLine = "Loading…",
  controls,
}) => {
  return (
    <section className="hero" aria-labelledby="page-title">
      <div>
        <p className="eyebrow" id="eyebrow">
          {eyebrow}
        </p>
        <h1 id="page-title">{title}</h1>
        <p className="sub" id="status-line">
          {statusLine}
        </p>
      </div>
      {controls && <div className="controls">{controls}</div>}
    </section>
  );
};

