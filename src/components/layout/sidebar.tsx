import React from "react";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        {/* App Logo & Version */}
        <Link href="/" style={{ textDecoration: "none", display: "block" }}>
          <div className="brand-header">
            <div className="brand-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 17L10 5H14L20 17H16.5L15 13.8H9L7.5 17H4ZM9.8 11.8H14.2L12 7.2L9.8 11.8Z" fill="#0066ff" />
              </svg>
            </div>
            <div className="brand-meta">
              <h1>AI Pipeline</h1>
              <span>V2.4 Active</span>
            </div>
          </div>
        </Link>

        {/* New Run Action */}
        <button className="btn-new-run" id="btnNewRun">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Run
        </button>

        {/* Main Navigation */}
        <nav>
          <ul className="nav-group">
            <li>
              <a href="#pipeline" className="nav-link active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="8" height="8" rx="2"></rect>
                  <rect x="14" y="13" width="8" height="8" rx="2"></rect>
                  <path d="M6 11v4a2 2 0 0 0 2 2h6"></path>
                </svg>
                Pipeline
              </a>
            </li>
            <li>
              <a href="#history" className="nav-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8v4l3 3"></path>
                  <circle cx="12" cy="12" r="9"></circle>
                </svg>
                History
              </a>
            </li>
            <li>
              <a href="#library" className="nav-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                Library
              </a>
            </li>
            <li>
              <a href="#settings" className="nav-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                Settings
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Footer: Theme Toggle & Help/Support Links */}
      <div className="sidebar-footer">
        <ThemeSwitcher />

        {/* Docs Link */}
        <a href="#docs" className="nav-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Docs
        </a>

        {/* Support Link (Speech bubble with ?) */}
        <a href="#support" className="nav-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Support
        </a>
      </div>
    </aside>
  );
}
