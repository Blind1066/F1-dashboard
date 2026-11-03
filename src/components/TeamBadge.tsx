import React, { useState } from "react";

interface TeamBadgeProps {
  name: string;
  logoSrc?: string;
  big?: boolean;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({ name, logoSrc, big }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = Boolean(logoSrc) && !imgFailed;

  const mono = name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span className={`badge${big ? " big" : ""}`}>
      {showImg ? (
        <img
          src={logoSrc}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <b>{mono}</b>
      )}
    </span>
  );
};

