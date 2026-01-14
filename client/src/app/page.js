"use client";
import { useState, useEffect } from "react";
import Onboarding from "../components/Onboarding";
import CheckIn from "../components/CheckIn";
import WorkoutLog from "../components/WorkoutLog";
import Profile from "../components/Profile"; // 👈 NEW IMPORT
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const API_BASE = "https://progresstruth-api.onrender.com";
  // const API_BASE = "http://localhost:5000";

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("U"); // Avatar ke liye
  const [activeTab, setActiveTab] = useState("workout"); // Default Workout rakha hai

  // 1. LOAD USER & FETCH NAME
  useEffect(() => {
    const savedId = localStorage.getItem("pte_userId");
    if (savedId) {
      setUserId(savedId);
      // Avatar ke liye Name fetch kar rahe hain
      fetch(`${API_BASE}/api/user/${savedId}`)
        .then((res) => res.json())
        .then((data) => setUserName(data.name || "U"))
        .catch((err) => console.log("User fetch fail"));
    }
  }, []);

  const handleLogin = (id) => {
    localStorage.setItem("pte_userId", id);
    setUserId(id);
    window.location.reload(); // Refresh taaki name fetch ho jaye
  };

  const handleLogout = () => {
    localStorage.removeItem("pte_userId");
    setUserId(null);
    setActiveTab("workout");
  };

  // Agar login nahi hai, toh Onboarding dikhao
  if (!userId) {
    return <Onboarding apiBase={API_BASE} onLogin={handleLogin} />;
  }

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "0 auto",
        background: "black",
        minHeight: "100vh",
        color: "white",
        paddingBottom: "80px",
        fontFamily: "monospace",
        overflowX: "hidden",
      }}
    >
      {/* 🟢 HEADER (Sticky) */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #222",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          background: "black",
          zIndex: 50,
        }}
      >
        <h1
          style={{
            fontSize: "1.2rem",
            margin: 0,
            fontWeight: "900",
            letterSpacing: "-1px",
          }}
        >
          <span style={{ color: "#ef4444" }}>PROGRESS</span> TRUTH
        </h1>

        {/* 👤 AVATAR (Click to go Profile) */}
        <div
          onClick={() => setActiveTab("profile")}
          style={{
            width: "35px",
            height: "35px",
            background: "#333",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.9rem",
            fontWeight: "bold",
            cursor: "pointer",
            border: activeTab === "profile" ? "2px solid #ef4444" : "none",
          }}
        >
          {userName[0].toUpperCase()}
        </div>
      </div>

      {/* 🎬 MAIN CONTENT (With Slide Animations) */}
      <div style={{ padding: "10px" }}>
        <AnimatePresence mode="wait">
          {/* TAB 1: WORKOUT */}
          {activeTab === "workout" && (
            <motion.div
              key="workout"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <WorkoutLog apiBase={API_BASE} userId={userId} />
            </motion.div>
          )}

          {/* TAB 2: CHECK-IN */}
          {activeTab === "checkin" && (
            <motion.div
              key="checkin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <CheckIn apiBase={API_BASE} userId={userId} />
            </motion.div>
          )}

          {/* TAB 3: PROFILE */}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Profile
                apiBase={API_BASE}
                userId={userId}
                onLogout={handleLogout}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 👇 BOTTOM NAVIGATION BAR (Fixed) */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          maxWidth: "500px",
          background: "#000",
          borderTop: "1px solid #222",
          display: "flex",
          justifyContent: "space-around",
          padding: "15px 0",
          zIndex: 100,
        }}
      >
        <button
          onClick={() => setActiveTab("workout")}
          style={{
            background: "none",
            border: "none",
            color: activeTab === "workout" ? "#ef4444" : "#666",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          🏋️‍♂️
        </button>

        <button
          onClick={() => setActiveTab("checkin")}
          style={{
            background: "none",
            border: "none",
            color: activeTab === "checkin" ? "#ef4444" : "#666",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          ⚖️
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          style={{
            background: "none",
            border: "none",
            color: activeTab === "profile" ? "#ef4444" : "#666",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          👤
        </button>
      </div>
    </div>
  );
}
