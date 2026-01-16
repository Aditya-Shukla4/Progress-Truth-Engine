"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Leaderboard({ apiBase }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await fetch(`${apiBase}/api/user/leaderboard/global`);
        if (res.ok) setLeaders(await res.json());
      } catch (err) {
        console.error("Leaderboard fail");
      }
      setLoading(false);
    };
    fetchLeaders();
  }, [apiBase]);

  const getRankBadge = (index) => {
    if (index === 0) return "👑"; // King
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  const getRowStyle = (index) => {
    if (index === 0)
      return {
        border: "2px solid #eab308",
        background: "rgba(234, 179, 8, 0.1)",
      }; // Gold
    if (index === 1)
      return {
        border: "1px solid #94a3b8",
        background: "rgba(148, 163, 184, 0.1)",
      }; // Silver
    if (index === 2)
      return {
        border: "1px solid #ca8a04",
        background: "rgba(202, 138, 4, 0.1)",
      }; // Bronze
    return { borderBottom: "1px solid #333" };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ paddingBottom: "80px" }}
    >
      <div
        style={{ textAlign: "center", marginBottom: "30px", marginTop: "20px" }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "900",
            color: "#ef4444",
            textTransform: "uppercase",
            letterSpacing: "-1px",
            margin: 0,
          }}
        >
          THE ARENA ⚔️
        </h2>
        <p style={{ color: "#666", fontSize: "0.8rem" }}>
          GLOBAL RANKINGS (TOTAL VOLUME)
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#666" }}>
          Scouting players...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {leaders.map((player, index) => (
            <motion.div
              key={player._id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              style={{
                ...getRowStyle(index),
                padding: "15px",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: index > 2 ? "#111" : getRowStyle(index).background,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <span
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    width: "30px",
                    textAlign: "center",
                  }}
                >
                  {getRankBadge(index)}
                </span>
                <div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      color: index === 0 ? "#eab308" : "white",
                    }}
                  >
                    {player.username}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#666",
                      textTransform: "uppercase",
                    }}
                  >
                    {player.dietType} Warrior
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    color: "#3b82f6",
                  }}
                >
                  {(player.totalVolume / 1000).toFixed(1)}k
                </div>
                <div style={{ fontSize: "0.6rem", color: "#666" }}>
                  KGS MOVED
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
