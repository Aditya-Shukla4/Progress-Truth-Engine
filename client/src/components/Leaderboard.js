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

  const getRankClass = (i) => {
    if (i === 0) return "gold";
    if (i === 1) return "silver";
    if (i === 2) return "bronze";
    return "";
  };

  const getRankLabel = (i) => {
    if (i === 0) return "1";
    if (i === 1) return "2";
    if (i === 2) return "3";
    return `${i + 1}`;
  };

  const getMedal = (i) => {
    if (i === 0) return "👑";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ paddingBottom: "16px" }}
    >
      {/* Header */}
      <div
        style={{ textAlign: "center", marginBottom: "28px", paddingTop: "8px" }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: "2.8rem",
            letterSpacing: "2px",
            lineHeight: 1,
          }}
        >
          <span style={{ color: "var(--ember)" }}>THE</span>{" "}
          <span style={{ color: "var(--text-1)" }}>ARENA</span>
        </div>
        <p className="label" style={{ marginTop: "6px" }}>
          Global Rankings · Total Volume Lifted
        </p>
      </div>

      {/* Top 3 podium */}
      {!loading && leaders.length >= 3 && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "24px",
            padding: "0 8px",
          }}
        >
          {/* 2nd */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>🥈</span>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#94a3b8",
                }}
              >
                {leaders[1].username}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "var(--text-3)",
                }}
              >
                {(leaders[1].totalVolume / 1000).toFixed(1)}k kg
              </div>
            </div>
            <div
              style={{
                height: "60px",
                width: "100%",
                background:
                  "linear-gradient(180deg, rgba(148,163,184,0.12), rgba(148,163,184,0.04))",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: "8px 8px 0 0",
                borderBottom: "none",
              }}
            />
          </motion.div>
          {/* 1st */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>👑</span>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "1.05rem",
                  color: "var(--gold)",
                }}
              >
                {leaders[0].username}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "var(--text-3)",
                }}
              >
                {(leaders[0].totalVolume / 1000).toFixed(1)}k kg
              </div>
            </div>
            <div
              style={{
                height: "90px",
                width: "100%",
                background:
                  "linear-gradient(180deg, rgba(245,166,35,0.14), rgba(245,166,35,0.04))",
                border: "1px solid rgba(245,166,35,0.3)",
                borderRadius: "8px 8px 0 0",
                borderBottom: "none",
                boxShadow: "0 -4px 20px rgba(245,166,35,0.12)",
              }}
            />
          </motion.div>
          {/* 3rd */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>🥉</span>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#b47850",
                }}
              >
                {leaders[2].username}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "var(--text-3)",
                }}
              >
                {(leaders[2].totalVolume / 1000).toFixed(1)}k kg
              </div>
            </div>
            <div
              style={{
                height: "44px",
                width: "100%",
                background:
                  "linear-gradient(180deg, rgba(180,120,80,0.10), rgba(180,120,80,0.03))",
                border: "1px solid rgba(180,120,80,0.2)",
                borderRadius: "8px 8px 0 0",
                borderBottom: "none",
              }}
            />
          </motion.div>
        </div>
      )}

      {/* Full list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: "64px", borderRadius: "var(--radius-lg)" }}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {leaders.map((player, index) => {
            const rankClass = getRankClass(index);
            const medal = getMedal(index);
            return (
              <motion.div
                key={player._id}
                initial={{ x: -16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.06 }}
                className={`leader-row ${rankClass ? `leader-row--${rankClass}` : ""}`}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    className={`rank-badge ${rankClass ? `rank-badge--${rankClass}` : ""}`}
                  >
                    {medal || getRankLabel(index)}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color:
                          index === 0
                            ? "var(--gold)"
                            : index === 1
                              ? "#94a3b8"
                              : index === 2
                                ? "#b47850"
                                : "var(--text-1)",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {player.username}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.62rem",
                        color: "var(--text-3)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {player.dietType} Warrior
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontSize: "1.2rem",
                      color: index === 0 ? "var(--gold)" : "var(--ember)",
                      lineHeight: 1,
                    }}
                  >
                    {(player.totalVolume / 1000).toFixed(1)}k
                  </div>
                  <div className="label" style={{ marginTop: "2px" }}>
                    kgs moved
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
