import React from "react";
import { Link, NavLink } from "react-router-dom";

export const TopBar: React.FC = () => {
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <Link className="brand" to="/">
          <span className="brand-mark" />
          PITWALL
        </Link>
        <div className="topbar-actions">
          <nav className="nav" aria-label="Main">
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}
            >
              Home
            </NavLink>
            <NavLink
              to="/schedule"
              className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}
            >
              Upcoming Races
            </NavLink>
            <NavLink
              to="/standings"
              className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}
            >
              Standings
            </NavLink>
            <NavLink
              to="/news"
              className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn soon")}
              title="Stage 2: News (Coming soon)"
            >
              News
            </NavLink>
            <NavLink
              to="/telemetry"
              className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}
              title="Interactive Driver Telemetry & Performance Analytics"
            >
              Telemetry
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};
