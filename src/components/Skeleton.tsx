import React from "react";

interface SkeletonProps {
  count?: number;
}

export const SkeletonRows: React.FC<SkeletonProps> = ({ count = 8 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="sk" />
      ))}
    </>
  );
};

export const SkeletonPills: React.FC<SkeletonProps> = ({ count = 10 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="sk-pill" />
      ))}
    </>
  );
};

