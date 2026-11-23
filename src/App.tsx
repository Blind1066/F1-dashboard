import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { TopBar } from "./components/TopBar";

const Home = lazy(() => import("./pages/Home").then((m) => ({ default: m.Home })));
const Schedule = lazy(() => import("./pages/Schedule").then((m) => ({ default: m.Schedule })));
const Standings = lazy(() => import("./pages/Standings").then((m) => ({ default: m.Standings })));
const News = lazy(() => import("./pages/News").then((m) => ({ default: m.News })));
const Telemetry = lazy(() => import("./pages/Telemetry").then((m) => ({ default: m.Telemetry })));

export const App: React.FC = () => {
  return (
    <>
      <TopBar />
      <Suspense
        fallback={
          <div className="wrap" style={{ padding: "60px 20px", textAlign: "center", color: "var(--muted)" }}>
            Loading Pitwall view...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/news" element={<News />} />
          <Route path="/telemetry" element={<Telemetry />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
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
