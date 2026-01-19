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
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("History fetch failed");
    }
  }, [apiBase, userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 🧠 THE TRUTH LOGIC (Client Side Brutality)
  const getBrutalFeedback = (data) => {
    const sleep = parseFloat(data.avgSleep);
    const protein = parseFloat(data.dailyProtein);
    const weight = parseFloat(data.currentWeight);
    const days = parseFloat(data.workoutDays);

    if (days < 3)
      return {
        msg: "❌ Part-time effort gets part-time results.",
        color: "#ef4444",
        status: "RED",
      };
    if (sleep < 6)
      return {
        msg: "🧟 You are sleeping like a zombie. Recovery failed.",
        color: "#ef4444",
        status: "RED",
      };
    if (protein < weight * 1.5)
      return {
        msg: "🐥 Not enough fuel. You are wasting reps.",
        color: "#facc15",
        status: "YELLOW",
      };
    if (data.strengthTrend === "decreasing")
      return {
        msg: "📉 Strength is dropping. Eat more or sleep more.",
        color: "#facc15",
        status: "YELLOW",
      };

    return {
      msg: "🦍 Solid week. You represent the 1%.",
      color: "#22c55e",
      status: "GREEN",
    };
  };

  // SUBMIT HANDLER
  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // 1. Calculate Brutal Feedback Locally (Instant)
    const feedback = getBrutalFeedback(checkInForm);

    setTimeout(async () => {
      try {
        const payload = { ...checkInForm, userId: userId };

        // 2. Save to Backend (Quietly)
        await fetch(`${apiBase}/api/checkin/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // 3. Show Result
        setResult(feedback);
        fetchHistory();
      } catch (err) {
        alert("Engine Failed!");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ paddingBottom: "100px" }}>
      {/* 📊 GRAPH SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: "20px",
          marginBottom: "20px",
          background: "#111",
          borderRadius: "10px",
          border: "1px solid #333",
        }}
      >
        <h3
          style={{
            color: "#888",
            fontSize: "0.8rem",
            marginBottom: "10px",
            letterSpacing: "1px",
            margin: 0,
          }}
        >
          LIVE METRICS
        </h3>
        <ProgressChart data={history} />
      </motion.div>

      {/* 📝 RESULT DISPLAY (THE TRUTH CARD) */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{
              padding: "30px",
              marginBottom: "30px",
              textAlign: "center",
              background: "#000",
              border: `2px solid ${result.color}`,
              borderRadius: "10px",
              boxShadow: `0 0 50px ${result.color}40`, // Glow effect
            }}
          >
            <h2
              style={{
                fontSize: "4rem",
                fontWeight: "900",
                margin: 0,
                lineHeight: 1,
                color: result.color,
                textShadow: `0 0 20px ${result.color}`,
              }}
            >
              {result.status}
            </h2>

            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                margin: "20px 0",
                color: "white",
                fontStyle: "italic",
              }}
            >
              "{result.msg}"
            </p>

            <button
              onClick={() => setResult(null)}
              style={{
                background: "#222",
                color: "white",
                border: "1px solid #444",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
                marginTop: "10px",
              }}
            >
              ACCEPT REALITY
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
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            padding: "20px",
            background: "#111",
            borderRadius: "10px",
            border: "1px solid #333",
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
            style={inputStyle}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              name="avgSleep"
              placeholder="Avg Sleep (hrs)"
              type="number"
              required
              onChange={(e) =>
                setCheckInForm({ ...checkInForm, avgSleep: e.target.value })
              }
              style={inputStyle}
            />
            <input
              name="dailyProtein"
              placeholder="Daily Protein (g)"
              type="number"
              required
              onChange={(e) =>
                setCheckInForm({ ...checkInForm, dailyProtein: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              name="workoutDays"
              placeholder="Gym Days/Week"
              type="number"
              required
              onChange={(e) =>
                setCheckInForm({ ...checkInForm, workoutDays: e.target.value })
              }
              style={inputStyle}
            />
            <select
              name="strengthTrend"
              onChange={(e) =>
                setCheckInForm({
                  ...checkInForm,
                  strengthTrend: e.target.value,
                })
              }
              style={inputStyle}
            >
              <option value="same">Strength: Flat ➖</option>
              <option value="increasing">Strength: Up ⬆️</option>
              <option value="decreasing">Strength: Down ⬇️</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "ANALYZING..." : "GET TRUTH"}
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
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "15px",
                background: "#111",
                borderRadius: "5px",
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

const inputStyle = {
  width: "100%",
  padding: "15px",
  background: "#222",
  border: "1px solid #444",
  color: "white",
  borderRadius: "5px",
  outline: "none",
  fontWeight: "bold",
};

const btnStyle = {
  width: "100%",
  padding: "15px",
  background: "white",
  color: "black",
  border: "none",
  borderRadius: "5px",
  fontWeight: "900",
  cursor: "pointer",
  fontSize: "1rem",
  marginTop: "10px",
};
