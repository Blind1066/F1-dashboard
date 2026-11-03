import React from "react";

interface BannerProps {
  message?: string;
  kind?: "warn" | "info" | string;
}

export const Banner: React.FC<BannerProps> = ({ message, kind }) => {
  if (!message) return null;

  return (
    <div className={`banner ${kind || ""}`} role="alert">
      {message}
    </div>
  );
};

