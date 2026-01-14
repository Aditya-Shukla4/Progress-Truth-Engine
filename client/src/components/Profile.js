"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Profile({ apiBase, userId, onLogout }) {
  const [user, setUser] = useState({
    name: "",
    email: "",
    height: "",
    targetWeight: "",
    dietType: "Non-Veg",
  });
  const [stats, setStats] = useState({ totalWorkouts: 0, totalVolume: 0 });
  const [loading, setLoading] = useState(false);

  // 1. FETCH DATA (User Info + Stats)
  useEffect(() => {
    const loadData = async () => {
      try {
        // A. Get User Details
        const userRes = await fetch(`${apiBase}/api/user/${userId}`);
        if (userRes.ok) setUser(await userRes.json());

        // B. Get History for Stats Calculation
        const histRes = await fetch(`${apiBase}/api/workout/history/${userId}`);
        if (histRes.ok) {
          const history = await histRes.json();

          // 🧮 CALCULATE LIFETIME STATS
          let vol = 0;
          history.forEach((w) => {
            w.exercises.forEach((ex) => {
              ex.sets.forEach((s) => {
                vol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
              });
            });
          });

          setStats({
            totalWorkouts: history.length,
            totalVolume: vol,
          });
        }
      } catch (err) {
        console.error("Profile load fail");
      }
    };
    loadData();
  }, [apiBase, userId]);

  // 2. SAVE UPDATES
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
        const data = await res.json();
        if (data) {
          // 👈 Check ki data null to nahi hai?
          setUser(data); // Sirf tab update karo jab data asli ho
          alert("Profile Updated! ✅");
        } else {
          alert("User not found in DB. Please Logout.");
        }
      }
    } catch (err) {
      alert("Update failed");
    }
    setLoading(false);
  };

  if (!user)
    return (
      <div style={{ padding: "20px", color: "white" }}>
        Loading Profile... (or User not found)
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: "20px", color: "white" }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
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
          }}
        >
          {user.name ? user.name[0].toUpperCase() : "U"}
        </div>
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>{user.name}</h2>
        <p style={{ margin: 0, color: "#888", fontSize: "0.9rem" }}>
          {user.email}
        </p>
      </div>

      {/* 🏆 LIFETIME STATS CARDS */}
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

      {/* ⚙️ SETTINGS FORM */}
      <form
        onSubmit={handleUpdate}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
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
            placeholder="e.g. 175"
          />
        </div>

        <div>
          <label style={labelStyle}>Target Weight (kg)</label>
          <input
            type="number"
            value={user.targetWeight || ""}
            onChange={(e) => setUser({ ...user, targetWeight: e.target.value })}
            style={inputStyle}
            placeholder="e.g. 75"
          />
        </div>

        <div>
          <label style={labelStyle}>Diet Type</label>
          <select
            value={user.dietType || "Non-Veg"}
            onChange={(e) => setUser({ ...user, dietType: e.target.value })}
            style={inputStyle}
          >
            <option value="Non-Veg">Non-Veg (Chicken/Meat)</option>
            <option value="Eggetarian">Eggetarian</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Vegan">Vegan</option>
          </select>
        </div>

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "SAVING..." : "SAVE CHANGES"}
        </button>
      </form>

      {/* 🚪 LOGOUT BUTTON */}
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
