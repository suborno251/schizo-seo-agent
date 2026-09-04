"use client";

import React, { useState, useEffect } from "react";

export function ThemeSwitcher() {
  const [themeMode, setThemeMode] = useState<"day" | "system" | "night">("system");

  // Load saved preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pipeline_theme_mode") as "day" | "system" | "night" | null;
      if (saved) setThemeMode(saved);
    } catch (e) {}
  }, []);

  // Sync data-theme attribute on <html> and listen to OS changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = () => {
      let resolved: "light" | "dark" = "dark";
      if (themeMode === "system") {
        resolved = mediaQuery.matches ? "dark" : "light";
      } else if (themeMode === "day") {
        resolved = "light";
      } else {
        resolved = "dark";
      }

      document.documentElement.setAttribute("data-theme", resolved);
      try {
        localStorage.setItem("pipeline_theme_mode", themeMode);
      } catch (e) {}
    };

    updateTheme();
    mediaQuery.addEventListener("change", updateTheme);
    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, [themeMode]);

  return (
    <div className="theme-switcher-container">
      <div className="theme-switcher" role="radiogroup" aria-label="Theme Mode Selection">
        {/* Day (Light) */}
        <button
          type="button"
          className={`theme-btn ${themeMode === "day" ? "active" : ""}`}
          onClick={() => setThemeMode("day")}
          title="Day Mode (Light)"
          aria-label="Day Mode"
          role="radio"
          aria-checked={themeMode === "day"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="m6.34 17.66-1.41 1.41"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
          </svg>
        </button>

        {/* System Theme */}
        <button
          type="button"
          className={`theme-btn ${themeMode === "system" ? "active" : ""}`}
          onClick={() => setThemeMode("system")}
          title="System Theme"
          aria-label="System Theme"
          role="radio"
          aria-checked={themeMode === "system"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"></rect>
            <line x1="12" y1="17" x2="12" y2="21"></line>
            <line x1="8" y1="21" x2="16" y2="21"></line>
          </svg>
        </button>

        {/* Night (Dark) */}
        <button
          type="button"
          className={`theme-btn ${themeMode === "night" ? "active" : ""}`}
          onClick={() => setThemeMode("night")}
          title="Night Mode (Dark)"
          aria-label="Night Mode"
          role="radio"
          aria-checked={themeMode === "night"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
