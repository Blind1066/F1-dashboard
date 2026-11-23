import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

export const TopBar: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const stored = localStorage.getItem("pitwall-theme");
      if (stored === "light" || stored === "dark") return stored;
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("pitwall-theme", theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isDark = theme === "dark";

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
              Race Schedule
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

          <button
            id="theme-toggle"
            className="theme-toggle"
            type="button"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
          >
            <svg
              className="theme-icon sun-icon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <svg
              className="theme-icon moon-icon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <span className="theme-label">Theme</span>
          </button>
        </div>
      </div>
    </header>
  );
};

