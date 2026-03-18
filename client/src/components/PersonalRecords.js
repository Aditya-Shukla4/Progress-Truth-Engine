"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CountUp, useInView, PRFlash, VolumeBar } from "./animations";

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
  const [prevPrs, setPrevPrs] = useState({});
  const [newPRKeys, setNewPRKeys] = useState(new Set());
  const [ref, inView] = useInView(0.1);

  useEffect(() => {
    if (!userId) return;
    const fetchPRs = async () => {
      try {
        const res = await fetch(`${apiBase}/api/workout/prs/${userId}`);
        if (!res.ok) return;
        const data = await res.json();

        // Detect new PRs vs previous session
        const newKeys = new Set();
        data.forEach((pr) => {
          const prev = prevPrs[pr._id];
          if (prev !== undefined && pr.maxLift > prev) newKeys.add(pr._id);
        });
        if (newKeys.size > 0) setNewPRKeys(newKeys);

        // Store current for next comparison
        const map = {};
        data.forEach((pr) => {
          map[pr._id] = pr.maxLift;
        });
        setPrevPrs(map);
        setPrs(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPRs();
  }, [apiBase, userId]);

  if (prs.length === 0)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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
        No PRs yet — log a heavy set!
      </motion.div>
    );

  const topPR = prs.reduce(
    (b, r) => (r.maxLift > (b?.maxLift || 0) ? r : b),
    null,
  );
  const maxVol = Math.max(...prs.map((p) => p.maxLift));

  return (
    <div ref={ref} style={{ marginBottom: "12px" }}>
      <div className="section-header">
        <span className="section-title">Hall of Fame</span>
        <motion.span
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="badge badge--gold"
        >
          {prs.length} PRs
        </motion.span>
      </div>

      {/* Top PR hero — animated entrance */}
      {topPR && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={newPRKeys.has(topPR._id) ? "pr-card" : ""}
          style={{
            padding: "18px 20px",
            background:
              "linear-gradient(135deg, rgba(245,166,35,0.10) 0%, var(--surface-1) 60%)",
            border: "1px solid rgba(245,166,35,0.30)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Shimmer sweep on new PR */}
          <AnimatePresence>
            {newPRKeys.has(topPR._id) && (
              <motion.div
                initial={{ x: "-100%", opacity: 0.6 }}
                animate={{ x: "200%", opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg, transparent, rgba(245,166,35,0.2), transparent)",
                  pointerEvents: "none",
                }}
              />
            )}
          </AnimatePresence>

          <motion.div
            animate={inView ? { rotate: [0, -10, 10, -5, 0] } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ fontSize: "1.8rem", lineHeight: 1 }}
          >
            👑
          </motion.div>

          <div style={{ flex: 1 }}>
            <div className="label" style={{ marginBottom: "2px" }}>
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

          <PRFlash isPR={newPRKeys.has(topPR._id)}>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "2.4rem",
                  color: "var(--gold)",
                  lineHeight: 1,
                }}
              >
                {inView ? (
                  <CountUp to={topPR.maxLift} duration={1} delay={0.2} />
                ) : (
                  0
                )}
              </div>
              <div className="label">kg</div>
            </div>
          </PRFlash>
        </motion.div>
      )}

      {/* PR cards — horizontal scroll with bar chart */}
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
          const isNewPR = newPRKeys.has(record._id);

          return (
            <motion.div
              key={record._id}
              initial={{ opacity: 0, y: 14, scale: 0.9 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                delay: 0.1 + i * 0.06,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              style={{
                minWidth: "96px",
                background: isNewPR
                  ? "rgba(245,166,35,0.06)"
                  : "var(--surface-1)",
                border: `1px solid ${isTop ? "rgba(245,166,35,0.35)" : isNewPR ? "rgba(245,166,35,0.3)" : "var(--border)"}`,
                borderRadius: "var(--radius-md)",
                padding: "12px 10px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
                cursor: "default",
              }}
            >
              {/* Top color accent */}
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

              {/* New PR badge */}
              <AnimatePresence>
                {isNewPR && (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      background: "var(--gold)",
                      color: "#000",
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontSize: "0.45rem",
                      padding: "1px 4px",
                      borderRadius: "3px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    NEW
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
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
                  fontSize: "1.7rem",
                  color: isTop ? "var(--gold)" : "var(--text-1)",
                  lineHeight: 1,
                }}
              >
                {inView ? (
                  <CountUp
                    to={record.maxLift}
                    duration={0.9}
                    delay={0.15 + i * 0.06}
                  />
                ) : (
                  0
                )}
              </div>
              <div className="label" style={{ marginTop: "1px" }}>
                kg
              </div>

              {/* Relative volume bar */}
              <div style={{ marginTop: "8px" }}>
                <VolumeBar
                  value={record.maxLift}
                  max={maxVol}
                  delay={0.2 + i * 0.06}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
