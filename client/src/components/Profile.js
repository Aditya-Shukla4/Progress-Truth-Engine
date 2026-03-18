"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TruthCalendar from "./TruthCalendar";

export default function Profile({ apiBase, userId, onLogout }) {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalVolume: 0 });
  const [loading, setLoading] = useState(false);

  const getLevelInfo = (volume) => {
    if (volume < 10000)
      return {
        name: "Broccoli Head",
        emoji: "🥦",
        color: "#a3e635",
        next: 10000,
        desc: "Newbie gains loading…",
      };
    if (volume < 50000)
      return {
        name: "Gym Rat",
        emoji: "🐀",
        color: "#60a5fa",
        next: 50000,
        desc: "Consistency is key.",
      };
    if (volume < 200000)
      return {
        name: "Iron Addict",
        emoji: "⛓️",
        color: "#facc15",
        next: 200000,
        desc: "Respect earned.",
      };
    if (volume < 1000000)
      return {
        name: "Silverback",
        emoji: "🦍",
        color: "var(--ember)",
        next: 1000000,
        desc: "Beast mode activated.",
      };
    return {
      name: "Greek God",
      emoji: "⚡",
      color: "#c084fc",
      next: 10000000,
      desc: "You completed the gym.",
    };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await fetch(`${apiBase}/api/user/${userId}`);
        if (userRes.ok) setUser(await userRes.json());
        const histRes = await fetch(`${apiBase}/api/workout/history/${userId}`);
        if (histRes.ok) {
          const histData = await histRes.json();
          setHistory(histData);
          let vol = 0;
          histData.forEach((w) =>
            w.exercises.forEach((ex) =>
              ex.sets.forEach((s) => {
                vol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
              }),
            ),
          );
          setStats({ totalWorkouts: histData.length, totalVolume: vol });
        }
      } catch (err) {
        console.error("Profile load fail");
      }
    };
    loadData();
  }, [apiBase, userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: user.height,
          targetWeight: user.targetWeight,
          dietType: user.dietType,
        }),
      });
      if (res.ok) {
        setUser(await res.json());
        alert("Profile Updated! ✅");
      }
    } catch (err) {
      alert("Update failed");
    }
    setLoading(false);
  };

  if (!user)
    return (
      <div
        style={{
          padding: "40px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          className="skeleton"
          style={{ width: "80px", height: "80px", borderRadius: "50%" }}
        />
        <div className="skeleton" style={{ width: "160px", height: "20px" }} />
        <div className="skeleton" style={{ width: "120px", height: "14px" }} />
      </div>
    );

  const level = getLevelInfo(stats.totalVolume);
  const progressPercent = Math.min((stats.totalVolume / level.next) * 100, 100);
  const initial = user.name ? user.name[0].toUpperCase() : "U";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
    >
      {/* ── HERO CARD ── */}
      <div
        className="glass-card"
        style={{
          padding: "28px 20px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow blob */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "200px",
            height: "200px",
            background: `radial-gradient(circle, ${level.color}22 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{
            width: "84px",
            height: "84px",
            background: `linear-gradient(135deg, ${level.color}33, var(--surface-3))`,
            border: `2.5px solid ${level.color}66`,
            borderRadius: "50%",
            margin: "0 auto 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.2rem",
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            color: "var(--text-1)",
            position: "relative",
            boxShadow: `0 0 32px ${level.color}22`,
          }}
        >
          {initial}
          {/* Level emoji bubble */}
          <div
            style={{
              position: "absolute",
              bottom: "-2px",
              right: "-2px",
              width: "26px",
              height: "26px",
              background: "var(--surface-1)",
              border: `1.5px solid ${level.color}55`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
            }}
          >
            {level.emoji}
          </div>
        </motion.div>

        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "1.6rem",
            letterSpacing: "1px",
            marginBottom: "6px",
          }}
        >
          {user.name}
        </div>

        {/* Rank badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 14px",
            borderRadius: "99px",
            background: `${level.color}18`,
            border: `1px solid ${level.color}44`,
            marginBottom: "6px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "0.85rem",
              color: level.color,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            {level.name}
          </span>
        </div>

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            color: "var(--text-3)",
            fontStyle: "italic",
            marginBottom: "20px",
          }}
        >
          "{level.desc}"
        </p>

        {/* XP bar */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span className="label">
              XP — {(stats.totalVolume / 1000).toFixed(1)}k kg
            </span>
            <span className="label">
              Next: {(level.next / 1000).toFixed(0)}k kg
            </span>
          </div>
          <div className="progress-track">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="progress-fill"
              style={{
                background: `linear-gradient(90deg, ${level.color}, ${level.color}cc)`,
                boxShadow: `0 0 10px ${level.color}55`,
              }}
            />
          </div>
          <div style={{ textAlign: "right", marginTop: "4px" }}>
            <span className="label">{progressPercent.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="stagger" style={{ display: "flex", gap: "10px" }}>
        <div className="stat-card">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "2.4rem",
              color: "var(--ember)",
              lineHeight: 1,
            }}
          >
            {stats.totalWorkouts}
          </motion.div>
          <span className="label">Sessions</span>
        </div>
        <div className="stat-card">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "2rem",
              color: "var(--blue)",
              lineHeight: 1,
            }}
          >
            {(stats.totalVolume / 1000).toFixed(1)}k
          </motion.div>
          <span className="label">Kg Lifted</span>
        </div>
        <div className="stat-card">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "2rem",
              color: "var(--green)",
              lineHeight: 1,
            }}
          >
            {
              history.filter((w) => {
                const d = new Date(w.date);
                const now = new Date();
                return d >= new Date(now.getFullYear(), now.getMonth(), 1);
              }).length
            }
          </motion.div>
          <span className="label">This Month</span>
        </div>
      </div>

      {/* ── CALENDAR ── */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Consistency Map</span>
        </div>
        <TruthCalendar history={history} />
      </div>

      {/* ── SETTINGS ── */}
      <form
        onSubmit={handleUpdate}
        className="card"
        style={{ display: "flex", flexDirection: "column", gap: "14px" }}
      >
        <div className="section-header">
          <span className="section-title">Settings</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label className="label">Height (cm)</label>
          <input
            type="number"
            value={user.height || ""}
            onChange={(e) => setUser({ ...user, height: e.target.value })}
            className="cyber-input"
            placeholder="170"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label className="label">Target Weight (kg)</label>
          <input
            type="number"
            value={user.targetWeight || ""}
            onChange={(e) => setUser({ ...user, targetWeight: e.target.value })}
            className="cyber-input"
            placeholder="80"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label className="label">Diet Type</label>
          <select
            value={user.dietType || "Non-Veg"}
            onChange={(e) => setUser({ ...user, dietType: e.target.value })}
            className="cyber-input"
          >
            <option value="Non-Veg">Non-Veg</option>
            <option value="Eggetarian">Eggetarian</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Vegan">Vegan</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="neon-btn"
          style={{ marginTop: "4px" }}
        >
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </form>

      {/* ── LOGOUT ── */}
      <button
        onClick={onLogout}
        style={{
          width: "100%",
          padding: "13px",
          background: "transparent",
          border: "1px solid var(--border-md)",
          borderRadius: "var(--radius-md)",
          color: "var(--text-3)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "border-color 0.2s, color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = "var(--ember-border)";
          e.target.style.color = "var(--ember)";
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = "var(--border-md)";
          e.target.style.color = "var(--text-3)";
        }}
      >
        Sign Out
      </button>

      <div style={{ height: "8px" }} />
    </motion.div>
  );
}
