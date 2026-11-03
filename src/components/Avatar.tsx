import React, { useState } from "react";

interface AvatarProps {
  acronym: string;
  headshotUrl?: string;
  big?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ acronym, headshotUrl, big }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = Boolean(headshotUrl) && !imgFailed;

  return (
    <span className={`avatar${big ? " big" : ""}`}>
      {showImg ? (
        <img
          src={headshotUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <b>{acronym || ""}</b>
      )}
    </span>
  );
};

