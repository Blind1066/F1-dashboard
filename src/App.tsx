import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { TopBar } from "./components/TopBar";
import { Standings } from "./pages/Standings";
import { Schedule } from "./pages/Schedule";
import { News } from "./pages/News";
import { Live } from "./pages/Live";
import { Telemetry } from "./pages/Telemetry";

export const App: React.FC = () => {
  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<Schedule />} />
        <Route path="/schedule" element={<Navigate to="/" replace />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/news" element={<News />} />
        <Route path="/live" element={<Live />} />
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
