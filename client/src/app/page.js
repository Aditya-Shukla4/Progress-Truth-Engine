"use client";
import { useState, useEffect } from "react";
import Onboarding from "../components/Onboarding";
import CheckIn from "../components/CheckIn";
import WorkoutLog from "../components/WorkoutLog";
import Profile from "../components/Profile";
import Dashboard from "../components/Dashboard";
import { motion, AnimatePresence } from "framer-motion";
import { StreakCelebration, PageTransition } from "../components/animations";

export default function Home() {
  const API_BASE = "https://progresstruth-api.onrender.com";
  // const API_BASE = "http://localhost:5000";
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("U");
  const [activeTab, setActiveTab] = useState("home");
  const [pendingWorkoutName, setPendingWorkoutName] = useState("");
  const [streakToast, setStreakToast] = useState(null);

  useEffect(() => {
    const savedId = localStorage.getItem("pte_userId");
    if (savedId) {
      setUserId(savedId);
      fetch(`${API_BASE}/api/user/${savedId}`)
        .then((r) => r.json())
        .then((d) => setUserName(d.name || "U"))
        .catch(() => {});
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
    setActiveTab("home");
  };

  if (!userId) return <Onboarding apiBase={API_BASE} onLogin={handleLogin} />;

  const tabs = [
    {
      id: "home",
      label: "Home",
      icon: (active) => (
        <svg
          viewBox="0 0 22 22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          width="20"
          height="20"
        >
          <path
            d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={active ? "currentColor" : "none"}
            fillOpacity={active ? 0.15 : 0}
          />
          <path d="M8 20v-8h6v8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "workout",
      label: "Train",
      icon: (active) => (
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
    },
    {
      id: "checkin",
      label: "Check-in",
      icon: (active) => (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          width="20"
          height="20"
        >
          <circle
            cx="12"
            cy="12"
            r="4"
            fill={active ? "currentColor" : "none"}
            fillOpacity={active ? 0.2 : 0}
          />
          <path
            d="M12 3v1m0 16v1M4.22 4.22l.707.707m12.728 12.728.707.707M3 12h1m16 0h1M4.927 19.073l.707-.707M18.364 5.636l.707-.707"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: (active) => (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          width="20"
          height="20"
        >
          <circle
            cx="12"
            cy="8"
            r="4"
            fill={active ? "currentColor" : "none"}
            fillOpacity={active ? 0.15 : 0}
          />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="app-shell">
      <div className="ambient-glow" />

      {/* ── STREAK CELEBRATION ── */}
      <AnimatePresence>
        {streakToast && (
          <StreakCelebration
            streak={streakToast}
            onDone={() => setStreakToast(null)}
          />
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="wordmark">
            <span className="wordmark-accent">PROGRESS</span>
            <span className="wordmark-main">TRUTH</span>
          </div>
          <button
            onClick={() => setActiveTab("profile")}
            className={`avatar-btn ${activeTab === "profile" ? "avatar-btn--active" : ""}`}
            aria-label="Profile"
          >
            <span>{userName[0].toUpperCase()}</span>
            {activeTab === "profile" && <span className="avatar-ring" />}
          </button>
        </div>

        {/* Tab strip */}
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
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Dashboard
                apiBase={API_BASE}
                userId={userId}
                userName={userName}
                onStartWorkout={(name) => {
                  setPendingWorkoutName(name || "");
                  setActiveTab("workout");
                }}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            </motion.div>
          )}

          {activeTab === "workout" && (
            <motion.div
              key="workout"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <WorkoutLog
                apiBase={API_BASE}
                userId={userId}
                pendingSessionName={pendingWorkoutName}
                onClearPending={() => setPendingWorkoutName("")}
              />
            </motion.div>
          )}

          {activeTab === "checkin" && (
            <motion.div
              key="checkin"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <CheckIn apiBase={API_BASE} userId={userId} />
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
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
              <span className="nav-icon">{tab.icon(isActive)}</span>
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
