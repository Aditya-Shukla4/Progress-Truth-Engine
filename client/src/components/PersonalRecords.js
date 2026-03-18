"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const MUSCLE_COLOR = {
  Chest: "#ff4500",
  Back: "#3b82f6",
  Legs: "#22c55e",
  Shoulders: "#facc15",
  Arms: "#a855f7",
  Core: "#f97316",
  Other: "#64748b",
};

export default function PersonalRecords({ apiBase, userId }) {
  const [prs, setPrs] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const fetchPRs = async () => {
      try {
        const res = await fetch(`${apiBase}/api/workout/prs/${userId}`);
        if (res.ok) setPrs(await res.json());
        else console.error("❌ PR API Failed:", res.status);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPRs();
  }, [apiBase, userId]);

  if (prs.length === 0)
    return (
      <div
        style={{
          padding: "16px",
          border: "1px dashed var(--border-md)",
          borderRadius: "var(--radius-md)",
          color: "var(--text-3)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          textAlign: "center",
          marginBottom: "12px",
        }}
      >
        No personal records yet — log a heavy set!
      </div>
    );

  const topPR = prs.reduce(
    (best, r) => (r.maxLift > (best?.maxLift || 0) ? r : best),
    null,
  );

  return (
    <div style={{ marginBottom: "12px" }}>
      <div className="section-header">
        <span className="section-title">Hall of Fame</span>
        <span className="badge badge--gold">{prs.length} PRs</span>
      </div>

      {/* Top PR hero */}
      {topPR && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: "16px",
            background:
              "linear-gradient(135deg, rgba(245,166,35,0.10) 0%, var(--surface-1) 60%)",
            border: "1px solid rgba(245,166,35,0.30)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div style={{ fontSize: "1.8rem", lineHeight: 1 }}>👑</div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                color: "var(--text-3)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "2px",
              }}
            >
              Top Lift
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--text-1)",
              }}
            >
              {topPR._id}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "2.2rem",
                color: "var(--gold)",
                lineHeight: 1,
              }}
            >
              {topPR.maxLift}
            </div>
            <div className="label">kg</div>
          </div>
        </motion.div>
      )}

      {/* All PRs horizontal scroll */}
      <div
        className="hide-scrollbar"
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {prs.map((record, i) => {
          const color = MUSCLE_COLOR[record.muscle] || "var(--ember)";
          const isTop = record._id === topPR?._id;
          return (
            <motion.div
              key={record._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                minWidth: "92px",
                background: "var(--surface-1)",
                border: `1px solid ${isTop ? "rgba(245,166,35,0.35)" : "var(--border)"}`,
                borderRadius: "var(--radius-md)",
                padding: "12px 10px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {/* color accent bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: color,
                }}
              />

              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  color: "var(--text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "6px",
                  marginTop: "2px",
                }}
              >
                {record._id}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "1.6rem",
                  color: isTop ? "var(--gold)" : "var(--text-1)",
                  lineHeight: 1,
                }}
              >
                {record.maxLift}
              </div>
              <div className="label" style={{ marginTop: "2px" }}>
                kg
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
