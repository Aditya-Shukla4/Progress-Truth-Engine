"use client";
import { useState, useEffect } from "react";
import Onboarding from "../components/Onboarding";
import CheckIn from "../components/CheckIn";
import WorkoutLog from "../components/WorkoutLog";
import Profile from "../components/Profile";
import { motion, AnimatePresence } from "framer-motion";
// import Leaderboard from "../components/Leaderboard"; // 👈 PHASE 1: HIDDEN

export default function Home() {
  // const API_BASE = "https://progresstruth-api.onrender.com";
  const API_BASE = "http://localhost:5000";
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("U");
  const [activeTab, setActiveTab] = useState("workout");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedId = localStorage.getItem("pte_userId");
    if (savedId) {
      setUserId(savedId);
      fetch(`${API_BASE}/api/user/${savedId}`)
        .then((res) => res.json())
        .then((data) => setUserName(data.name || "U"))
        .catch((err) => console.log("User fetch fail"));
    }
  }, []);

  const handleLogin = (id) => {
    localStorage.setItem("pte_userId", id);
    setUserId(id);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("pte_userId");
    setUserId(null);
    setActiveTab("workout");
  };

  if (!userId) {
    return <Onboarding apiBase={API_BASE} onLogin={handleLogin} />;
  }

  const tabs = [
    {
      id: "workout",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          width="20"
          height="20"
        >
          <path
            d="M6.5 6.5h11M6.5 17.5h11M4 9.5h2v5H4zM18 9.5h2v5h-2z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M2 12h2M20 12h2" strokeLinecap="round" />
        </svg>
      ),
      label: "Train",
    },
    {
      id: "checkin",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          width="20"
          height="20"
        >
          <path
            d="M12 3v1m0 16v1M4.22 4.22l.707.707m12.728 12.728.707.707M3 12h1m16 0h1M4.927 19.073l.707-.707M18.364 5.636l.707-.707"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
      label: "Check-in",
    },
    {
      id: "profile",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          width="20"
          height="20"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
        </svg>
      ),
      label: "Profile",
    },
  ];

  return (
    <div className="app-shell">
      {/* Ambient background glow */}
      <div className="ambient-glow" />

      {/* ── HEADER ── */}
      <header className="app-header">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="header-inner"
        >
          <div className="wordmark">
            <span className="wordmark-accent">PROGRESS</span>
            <span className="wordmark-main">TRUTH</span>
          </div>

          {/* Avatar */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`avatar-btn ${activeTab === "profile" ? "avatar-btn--active" : ""}`}
            aria-label="Profile"
          >
            <span>{userName[0].toUpperCase()}</span>
            {activeTab === "profile" && <span className="avatar-ring" />}
          </button>
        </motion.div>

        {/* Tab indicator strip */}
        <div className="tab-strip">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-pill ${activeTab === tab.id ? "tab-pill--active" : ""}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.span
                  layoutId="tab-underline"
                  className="tab-underline"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="app-main">
        <AnimatePresence mode="wait">
          {activeTab === "workout" && (
            <motion.div
              key="workout"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <WorkoutLog apiBase={API_BASE} userId={userId} />
            </motion.div>
          )}

          {activeTab === "checkin" && (
            <motion.div
              key="checkin"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <CheckIn apiBase={API_BASE} userId={userId} />
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Profile
                apiBase={API_BASE}
                userId={userId}
                onLogout={handleLogout}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav className="bottom-nav">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-btn ${isActive ? "nav-btn--active" : ""}`}
              aria-label={tab.label}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
              {isActive && (
                <motion.span
                  layoutId="nav-dot"
                  className="nav-dot"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
