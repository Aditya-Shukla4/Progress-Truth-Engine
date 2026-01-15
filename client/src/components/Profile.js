"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TruthCalendar from "./TruthCalendar";

export default function Profile({ apiBase, userId, onLogout }) {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalVolume: 0 });
  const [loading, setLoading] = useState(false);

  // 🎮 RPG LEVEL LOGIC
  const getLevelInfo = (volume) => {
    if (volume < 10000)
      return {
        name: "Broccoli Head 🥦",
        color: "#a3e635",
        next: 10000,
        desc: "Newbie gains loading...",
      };
    if (volume < 50000)
      return {
        name: "Gym Rat 🐀",
        color: "#60a5fa",
        next: 50000,
        desc: "Consistency is key!",
      };
    if (volume < 200000)
      return {
        name: "Iron Addict ⛓️",
        color: "#facc15",
        next: 200000,
        desc: "Respect earned.",
      };
    if (volume < 1000000)
      return {
        name: "Silverback 🦍",
        color: "#ef4444",
        next: 1000000,
        desc: "Beast mode activated.",
      };
    return {
      name: "GREEK GOD ⚡",
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
          histData.forEach((w) => {
            w.exercises.forEach((ex) => {
              ex.sets.forEach((s) => {
                vol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
              });
            });
          });

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
    return <div style={{ padding: "20px", color: "white" }}>Loading...</div>;

  const level = getLevelInfo(stats.totalVolume);
  const progressPercent = Math.min((stats.totalVolume / level.next) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: "20px", color: "white" }}
    >
      {/* HEADER & LEVEL CARD */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
          background:
            "linear-gradient(180deg, rgba(20,20,20,0) 0%, rgba(30,30,30,0.5) 100%)",
          padding: "20px",
          borderRadius: "15px",
          border: "1px solid #333",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "#ef4444",
            borderRadius: "50%",
            margin: "0 auto 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            fontWeight: "bold",
            border: `3px solid ${level.color}`,
          }}
        >
          {user.name ? user.name[0].toUpperCase() : "U"}
        </div>
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>{user.name}</h2>

        {/* RANK BADGE */}
        <div style={{ marginTop: "10px" }}>
          <span
            style={{
              background: level.color,
              color: "black",
              padding: "5px 10px",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: "900",
              textTransform: "uppercase",
            }}
          >
            {level.name}
          </span>
        </div>
        <p
          style={{
            marginTop: "10px",
            color: "#888",
            fontSize: "0.8rem",
            fontStyle: "italic",
          }}
        >
          "{level.desc}"
        </p>

        {/* PROGRESS BAR */}
        <div style={{ marginTop: "20px", textAlign: "left" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.7rem",
              color: "#aaa",
              marginBottom: "5px",
            }}
          >
            <span>XP: {(stats.totalVolume / 1000).toFixed(1)}k</span>
            <span>Next: {(level.next / 1000).toFixed(0)}k</span>
          </div>
          <div
            style={{
              width: "100%",
              height: "8px",
              background: "#333",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1 }}
              style={{ height: "100%", background: level.color }}
            />
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        <div style={statCardStyle}>
          <div
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#ef4444" }}
          >
            {stats.totalWorkouts}
          </div>
          <div
            style={{
              fontSize: "0.7rem",
              color: "#888",
              textTransform: "uppercase",
            }}
          >
            Sessions
          </div>
        </div>
        <div style={statCardStyle}>
          <div
            style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#3b82f6" }}
          >
            {(stats.totalVolume / 1000).toFixed(1)}k
          </div>
          <div
            style={{
              fontSize: "0.7rem",
              color: "#888",
              textTransform: "uppercase",
            }}
          >
            Tons Lifted 🏗️
          </div>
        </div>
      </div>

      <TruthCalendar history={history} />

      {/* SETTINGS */}
      <form
        onSubmit={handleUpdate}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginTop: "30px",
        }}
      >
        <h3
          style={{
            fontSize: "1rem",
            borderBottom: "1px solid #333",
            paddingBottom: "10px",
            color: "#ccc",
          }}
        >
          ⚙️ SETTINGS
        </h3>
        <div>
          <label style={labelStyle}>Height (cm)</label>
          <input
            type="number"
            value={user.height || ""}
            onChange={(e) => setUser({ ...user, height: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Target Weight (kg)</label>
          <input
            type="number"
            value={user.targetWeight || ""}
            onChange={(e) => setUser({ ...user, targetWeight: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Diet Type</label>
          <select
            value={user.dietType || "Non-Veg"}
            onChange={(e) => setUser({ ...user, dietType: e.target.value })}
            style={inputStyle}
          >
            <option value="Non-Veg">Non-Veg</option>
            <option value="Eggetarian">Eggetarian</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Vegan">Vegan</option>
          </select>
        </div>
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "SAVING..." : "SAVE CHANGES"}
        </button>
      </form>

      <button
        onClick={onLogout}
        style={{
          ...btnStyle,
          background: "#222",
          color: "#ef4444",
          border: "1px solid #333",
          marginTop: "20px",
        }}
      >
        LOGOUT
      </button>
    </motion.div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  background: "#111",
  border: "1px solid #333",
  color: "white",
  borderRadius: "5px",
  outline: "none",
};
const labelStyle = {
  display: "block",
  marginBottom: "5px",
  fontSize: "0.8rem",
  color: "#888",
};
const btnStyle = {
  width: "100%",
  padding: "15px",
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "5px",
  fontWeight: "bold",
  cursor: "pointer",
};
const statCardStyle = {
  flex: 1,
  background: "#111",
  padding: "15px",
  borderRadius: "10px",
  border: "1px solid #333",
  textAlign: "center",
};
