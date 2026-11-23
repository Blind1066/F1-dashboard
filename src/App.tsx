import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { TopBar } from "./components/TopBar";
import { Home } from "./pages/Home";
import { Schedule } from "./pages/Schedule";
import { Standings } from "./pages/Standings";
import { News } from "./pages/News";
import { Telemetry } from "./pages/Telemetry";

export const App: React.FC = () => {
  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/news" element={<News />} />
        <Route path="/telemetry" element={<Telemetry />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="wrap foot">
        Data:{" "}
        <a href="https://github.com/jolpica/jolpica-f1" target="_blank" rel="noopener noreferrer">
          Jolpica F1 API
        </a>
        . Unofficial fan project — not affiliated with Formula 1.
      </footer>
    </>
  );
};

export default App;
