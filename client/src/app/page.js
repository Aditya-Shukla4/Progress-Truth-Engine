"use client";
import { useState, useEffect } from "react";
import Onboarding from "../components/Onboarding";
import CheckIn from "../components/CheckIn";
import WorkoutLog from "../components/WorkoutLog";

export default function Home() {
  // CONFIG
  const API_BASE = "https://progresstruth-api.onrender.com";
  // const API_BASE = "http://localhost:5000";
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("checkin");

  useEffect(() => {
    const savedId = localStorage.getItem("pte_userId");
    if (savedId) setUserId(savedId);
  }, []);

  const handleLogin = (id) => {
    localStorage.setItem("pte_userId", id);
    setUserId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem("pte_userId");
    setUserId(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        fontFamily: "monospace",
      }}
    >
      <h1
        style={{
          color: "#ef4444",
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "20px",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        PROGRESS TRUTH ENGINE
      </h1>

      {!userId ? (
        <Onboarding apiBase={API_BASE} onLogin={handleLogin} />
      ) : (
        <div style={{ width: "100%", maxWidth: "500px" }}>
          {/* USER BAR */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#666", fontSize: "0.8rem" }}>
              OPERATOR: {userId.slice(-4)}
            </span>
            <button
              onClick={handleLogout}
              style={{
                fontSize: "0.7rem",
                color: "#888",
                background: "none",
                border: "1px solid #333",
                padding: "5px 10px",
                cursor: "pointer",
              }}
            >
              LOGOUT
            </button>
          </div>

          {/* TABS (Ye Naya Feature Hai) */}
          <div
            style={{
              display: "flex",
              marginBottom: "20px",
              border: "1px solid #333",
            }}
          >
            <button
              onClick={() => setActiveTab("checkin")}
              style={{
                flex: 1,
                padding: "10px",
                background: activeTab === "checkin" ? "#ef4444" : "black",
                color: "white",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              WEEKLY TRUTH
            </button>
            <button
              onClick={() => setActiveTab("workout")}
              style={{
                flex: 1,
                padding: "10px",
                background: activeTab === "workout" ? "#ef4444" : "black",
                color: "white",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              DAILY GRIND
            </button>
          </div>

          {/* CONTENT */}
          {activeTab === "checkin" ? (
            <CheckIn apiBase={API_BASE} userId={userId} />
          ) : (
            <WorkoutLog apiBase={API_BASE} userId={userId} />
          )}
        </div>
      )}
    </div>
  );
}
