"use client";
import { useState, useEffect, useCallback } from "react";
import ProgressChart from "./ProgressChart";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckIn({ apiBase, userId }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // FORM STATE
  const [checkInForm, setCheckInForm] = useState({
    currentWeight: "",
    avgSleep: "",
    dailyProtein: "",
    caloriesLevel: "maintenance",
    workoutDays: "",
    strengthTrend: "same",
  });

  // 🔄 FETCH HISTORY
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/checkin/history/${userId}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("History fetch failed");
    }
  }, [apiBase, userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // SUBMIT HANDLER
  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Fake delay for "Processing" feel
    setTimeout(async () => {
      try {
        const payload = { ...checkInForm, userId: userId };
        const res = await fetch(`${apiBase}/api/checkin/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setResult(data);
        fetchHistory();
      } catch (err) {
        alert("Engine Failed!");
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ paddingBottom: "100px" }}>
      {/* 📊 GRAPH SECTION (Glass Card) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ padding: "20px", marginBottom: "20px" }}
      >
        <h3
          style={{
            color: "#888",
            fontSize: "0.8rem",
            marginBottom: "10px",
            letterSpacing: "1px",
          }}
        >
          LIVE METRICS
        </h3>
        <ProgressChart data={history} />
      </motion.div>

      {/* 📝 RESULT DISPLAY (Popup Animation) */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="glass-card"
            style={{
              padding: "25px",
              marginBottom: "30px",
              textAlign: "center",
              border: `1px solid ${
                result.status === "RED"
                  ? "#ef4444"
                  : result.status === "YELLOW"
                  ? "#facc15"
                  : "#22c55e"
              }`,
              boxShadow: `0 0 30px ${
                result.status === "RED"
                  ? "rgba(239,68,68,0.3)"
                  : result.status === "YELLOW"
                  ? "rgba(250,204,21,0.3)"
                  : "rgba(34,197,94,0.3)"
              }`,
            }}
          >
            <h2
              style={{
                fontSize: "3rem",
                fontWeight: "900",
                margin: 0,
                color:
                  result.status === "RED"
                    ? "#ef4444"
                    : result.status === "YELLOW"
                    ? "#facc15"
                    : "#22c55e",
                textShadow: "0 0 10px currentColor",
              }}
            >
              {result.status}
            </h2>

            <p
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                margin: "10px 0",
                color: "white",
              }}
            >
              {result.resultMessage}
            </p>

            <div
              style={{
                background: "rgba(0,0,0,0.5)",
                padding: "15px",
                borderRadius: "10px",
                marginTop: "15px",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "0.7rem",
                  color: "#888",
                  textTransform: "uppercase",
                }}
              >
                Mission Objective:
              </span>
              <span style={{ color: "#ddd" }}>{result.actionStep}</span>
            </div>

            <button
              onClick={() => setResult(null)}
              className="neon-btn"
              style={{
                background: "#333",
                marginTop: "20px",
                boxShadow: "none",
                border: "1px solid #555",
              }}
            >
              CLOSE REPORT
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✍️ INPUT FORM (Hidden when result is shown) */}
      {!result && (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleCheckInSubmit}
          className="glass-card"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            padding: "25px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "white",
              fontSize: "1.2rem",
              borderBottom: "1px solid #333",
              paddingBottom: "10px",
            }}
          >
            WEEKLY LOG
          </h3>

          <input
            name="currentWeight"
            placeholder="Current Weight (kg)"
            type="number"
            required
            onChange={(e) =>
              setCheckInForm({ ...checkInForm, currentWeight: e.target.value })
            }
            className="cyber-input"
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              name="avgSleep"
              placeholder="Sleep (hrs)"
              type="number"
              required
              onChange={(e) =>
                setCheckInForm({ ...checkInForm, avgSleep: e.target.value })
              }
              className="cyber-input"
            />
            <input
              name="dailyProtein"
              placeholder="Protein (g)"
              type="number"
              required
              onChange={(e) =>
                setCheckInForm({ ...checkInForm, dailyProtein: e.target.value })
              }
              className="cyber-input"
            />
          </div>

          <select
            name="caloriesLevel"
            onChange={(e) =>
              setCheckInForm({ ...checkInForm, caloriesLevel: e.target.value })
            }
            className="cyber-input"
          >
            <option value="maintenance">Maintenance Calories</option>
            <option value="deficit">Deficit (Cutting)</option>
            <option value="surplus">Surplus (Bulking)</option>
          </select>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              name="workoutDays"
              placeholder="Days/Week"
              type="number"
              required
              onChange={(e) =>
                setCheckInForm({ ...checkInForm, workoutDays: e.target.value })
              }
              className="cyber-input"
            />
            <select
              name="strengthTrend"
              onChange={(e) =>
                setCheckInForm({
                  ...checkInForm,
                  strengthTrend: e.target.value,
                })
              }
              className="cyber-input"
            >
              <option value="same">Strength: Same ➖</option>
              <option value="increasing">Strength: Up ⬆️</option>
              <option value="decreasing">Strength: Down ⬇️</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="neon-btn">
            {loading ? "ANALYZING..." : "INITIATE SCAN"}
          </button>
        </motion.form>
      )}

      {/* 📜 HISTORY LIST */}
      <div style={{ marginTop: "30px" }}>
        <h3
          style={{
            color: "#666",
            fontSize: "0.8rem",
            marginBottom: "15px",
            letterSpacing: "2px",
          }}
        >
          ARCHIVES
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {history.map((record) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              key={record._id}
              className="glass-card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "15px",
                borderLeft: `4px solid ${
                  record.status === "RED"
                    ? "#ef4444"
                    : record.status === "YELLOW"
                    ? "#facc15"
                    : "#22c55e"
                }`,
              }}
            >
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  {new Date(record.weekStartDate).toLocaleDateString()}
                </span>
                <span style={{ fontSize: "0.8rem", color: "#888" }}>
                  {record.currentWeight}kg • {record.workoutDays} days
                </span>
              </div>
              <span
                style={{
                  fontWeight: "bold",
                  color:
                    record.status === "RED"
                      ? "#ef4444"
                      : record.status === "YELLOW"
                      ? "#facc15"
                      : "#22c55e",
                }}
              >
                {record.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
