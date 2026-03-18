"use client";
import { useState, useEffect, useCallback } from "react";
import ProgressChart from "./ProgressChart";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG = {
  RED: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.30)",
    label: "CRITICAL",
  },
  YELLOW: {
    color: "#facc15",
    bg: "rgba(250,204,21,0.08)",
    border: "rgba(250,204,21,0.30)",
    label: "WARNING",
  },
  GREEN: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.30)",
    label: "OPTIMAL",
  },
};

export default function CheckIn({ apiBase, userId }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [checkInForm, setCheckInForm] = useState({
    currentWeight: "",
    avgSleep: "",
    dailyProtein: "",
    caloriesLevel: "maintenance",
    workoutDays: "",
    strengthTrend: "same",
  });

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/checkin/history/${userId}`);
      if (res.ok) setHistory(await res.json());
    } catch (err) {
      console.error("History fetch failed");
    }
  }, [apiBase, userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getBrutalFeedback = (data) => {
    const sleep = parseFloat(data.avgSleep);
    const protein = parseFloat(data.dailyProtein);
    const weight = parseFloat(data.currentWeight);
    const days = parseFloat(data.workoutDays);
    if (days < 3)
      return { msg: "Part-time effort gets part-time results.", status: "RED" };
    if (sleep < 6)
      return {
        msg: "You're sleeping like a zombie. Recovery failed.",
        status: "RED",
      };
    if (protein < weight * 1.5)
      return { msg: "Not enough fuel. You're wasting reps.", status: "YELLOW" };
    if (data.strengthTrend === "decreasing")
      return {
        msg: "Strength is dropping. Eat more or sleep more.",
        status: "YELLOW",
      };
    return { msg: "Solid week. You represent the 1%.", status: "GREEN" };
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const feedback = getBrutalFeedback(checkInForm);
    setTimeout(async () => {
      try {
        await fetch(`${apiBase}/api/checkin/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...checkInForm, userId }),
        });
        setResult(feedback);
        fetchHistory();
      } catch (err) {
        alert("Engine Failed!");
      }
      setLoading(false);
    }, 1000);
  };

  const field = (key, val) => setCheckInForm((f) => ({ ...f, [key]: val }));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        paddingBottom: "8px",
      }}
    >
      {/* ── LIVE METRICS CHART ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="section-header">
          <span className="section-title">Live Metrics</span>
          <span className="badge badge--ember">{history.length} entries</span>
        </div>
        <ProgressChart data={history} />
      </motion.div>

      {/* ── TRUTH RESULT CARD ── */}
      <AnimatePresence mode="wait">
        {result &&
          (() => {
            const cfg = STATUS_CONFIG[result.status];
            return (
              <motion.div
                key="result"
                initial={{ scale: 0.88, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.88, opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                style={{
                  padding: "32px 24px 28px",
                  textAlign: "center",
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderRadius: "var(--radius-lg)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Glow blob */}
                <div
                  style={{
                    position: "absolute",
                    top: "-60px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "200px",
                    height: "200px",
                    background: `radial-gradient(circle, ${cfg.color}22 0%, transparent 70%)`,
                    pointerEvents: "none",
                  }}
                />

                {/* Status pill */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 20px",
                    borderRadius: "99px",
                    border: `1px solid ${cfg.border}`,
                    background: `${cfg.color}18`,
                    marginBottom: "20px",
                  }}
                >
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: cfg.color,
                      display: "block",
                      boxShadow: `0 0 8px ${cfg.color}`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontSize: "0.95rem",
                      letterSpacing: "2px",
                      color: cfg.color,
                    }}
                  >
                    {cfg.label}
                  </span>
                </motion.div>

                {/* Big status word */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontStyle: "italic",
                    fontSize: "4.5rem",
                    lineHeight: 1,
                    color: cfg.color,
                    textShadow: `0 0 40px ${cfg.color}55`,
                    marginBottom: "18px",
                    letterSpacing: "2px",
                  }}
                >
                  {result.status}
                </motion.div>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "1.05rem",
                    fontWeight: 500,
                    fontStyle: "italic",
                    color: "var(--text-1)",
                    marginBottom: "28px",
                    lineHeight: 1.5,
                  }}
                >
                  "{result.msg}"
                </motion.p>

                <button
                  onClick={() => setResult(null)}
                  className="ghost-btn"
                  style={{
                    margin: "0 auto",
                    width: "auto",
                    padding: "10px 28px",
                  }}
                >
                  Accept Reality
                </button>
              </motion.div>
            );
          })()}
      </AnimatePresence>

      {/* ── CHECK-IN FORM ── */}
      <AnimatePresence>
        {!result && (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={handleCheckInSubmit}
            className="card"
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Form header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "1.3rem",
                  letterSpacing: "1px",
                }}
              >
                WEEKLY CHECK-IN
              </span>
              <span className="badge badge--ember">
                Week {history.length + 1}
              </span>
            </div>

            <div className="divider" style={{ margin: "0" }} />

            {/* Weight */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label className="label">Current Weight</label>
              <div style={{ position: "relative" }}>
                <input
                  placeholder="0"
                  type="number"
                  required
                  onChange={(e) => field("currentWeight", e.target.value)}
                  className="cyber-input"
                  style={{ paddingRight: "44px" }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    color: "var(--text-3)",
                    pointerEvents: "none",
                  }}
                >
                  kg
                </span>
              </div>
            </div>

            {/* Sleep + Protein */}
            <div style={{ display: "flex", gap: "10px" }}>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label className="label">Avg Sleep</label>
                <div style={{ position: "relative" }}>
                  <input
                    placeholder="7"
                    type="number"
                    required
                    onChange={(e) => field("avgSleep", e.target.value)}
                    className="cyber-input"
                    style={{ paddingRight: "42px" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.72rem",
                      color: "var(--text-3)",
                      pointerEvents: "none",
                    }}
                  >
                    hrs
                  </span>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label className="label">Daily Protein</label>
                <div style={{ position: "relative" }}>
                  <input
                    placeholder="150"
                    type="number"
                    required
                    onChange={(e) => field("dailyProtein", e.target.value)}
                    className="cyber-input"
                    style={{ paddingRight: "32px" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.72rem",
                      color: "var(--text-3)",
                      pointerEvents: "none",
                    }}
                  >
                    g
                  </span>
                </div>
              </div>
            </div>

            {/* Workout days + Strength trend */}
            <div style={{ display: "flex", gap: "10px" }}>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label className="label">Gym Days / Week</label>
                <input
                  placeholder="4"
                  type="number"
                  required
                  onChange={(e) => field("workoutDays", e.target.value)}
                  className="cyber-input"
                />
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label className="label">Strength Trend</label>
                <select
                  onChange={(e) => field("strengthTrend", e.target.value)}
                  className="cyber-input"
                >
                  <option value="same">Flat ➖</option>
                  <option value="increasing">Going Up ⬆️</option>
                  <option value="decreasing">Going Down ⬇️</option>
                </select>
              </div>
            </div>

            {/* Calories level — visual toggle */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label className="label">Calorie Target</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["deficit", "maintenance", "surplus"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => field("caloriesLevel", opt)}
                    className={`chip ${checkInForm.caloriesLevel === opt ? "chip--active" : ""}`}
                    style={{ flex: 1, textAlign: "center" }}
                  >
                    {opt === "deficit"
                      ? "Cut"
                      : opt === "maintenance"
                        ? "Maintain"
                        : "Bulk"}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neon-btn"
              style={{ marginTop: "4px", position: "relative" }}
            >
              {loading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  Analyzing…
                </span>
              ) : (
                "Get The Truth"
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── HISTORY ARCHIVES ── */}
      {history.length > 0 && (
        <div>
          <div className="section-header" style={{ marginBottom: "10px" }}>
            <span className="section-title">Archives</span>
            <span className="badge">{history.length} records</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {history.map((record, idx) => {
              const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.GREEN;
              return (
                <motion.div
                  key={record._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: "var(--surface-1)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    borderLeft: `3px solid ${cfg.color}`,
                    transition: "border-color 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        fontSize: "0.88rem",
                        color: "var(--text-1)",
                      }}
                    >
                      {new Date(record.weekStartDate).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        color: "var(--text-3)",
                      }}
                    >
                      {record.currentWeight}kg · {record.workoutDays} days/wk ·{" "}
                      {record.avgSleep}h sleep
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: cfg.color,
                        display: "block",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.62rem",
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        color: cfg.color,
                      }}
                    >
                      {record.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
