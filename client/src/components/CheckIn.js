"use client";
import { useState, useEffect, useCallback } from "react";
import ProgressChart from "./ProgressChart";

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
    <div>
      {/* 1. RESULT OR FORM SECTION */}
      {result ? (
        <div
          style={{
            padding: "20px",
            border: "2px solid",
            borderColor:
              result.status === "RED"
                ? "red"
                : result.status === "YELLOW"
                ? "yellow"
                : "green",
            backgroundColor: "#111",
            marginBottom: "30px",
          }}
        >
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: "900",
              color:
                result.status === "RED"
                  ? "red"
                  : result.status === "YELLOW"
                  ? "yellow"
                  : "green",
            }}
          >
            {result.status}
          </h2>
          <p
            style={{ fontSize: "1.2rem", fontWeight: "bold", margin: "10px 0" }}
          >
            {result.resultMessage}
          </p>
          <div
            style={{
              backgroundColor: "#222",
              padding: "10px",
              borderRadius: "5px",
              color: "#ccc",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                color: "#666",
              }}
            >
              Action Step:
            </span>
            {result.actionStep}
          </div>
          <button
            onClick={() => setResult(null)}
            style={{
              ...btnStyle,
              backgroundColor: "white",
              color: "black",
              marginTop: "20px",
            }}
          >
            CHECK AGAIN
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleCheckInSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
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
              placeholder="Sleep (hrs)"
              type="number"
              required
              onChange={(e) =>
                setCheckInForm({ ...checkInForm, avgSleep: e.target.value })
              }
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              name="dailyProtein"
              placeholder="Protein (g)"
              type="number"
              required
              onChange={(e) =>
                setCheckInForm({ ...checkInForm, dailyProtein: e.target.value })
              }
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
          <select
            name="caloriesLevel"
            onChange={(e) =>
              setCheckInForm({ ...checkInForm, caloriesLevel: e.target.value })
            }
            style={inputStyle}
          >
            <option value="maintenance">Maintenance Calories</option>
            <option value="deficit">Deficit (Cutting)</option>
            <option value="surplus">Surplus (Bulking)</option>
          </select>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              name="workoutDays"
              placeholder="Workouts/Week"
              type="number"
              required
              onChange={(e) =>
                setCheckInForm({ ...checkInForm, workoutDays: e.target.value })
              }
              style={{ ...inputStyle, flex: 1 }}
            />
            <select
              name="strengthTrend"
              onChange={(e) =>
                setCheckInForm({
                  ...checkInForm,
                  strengthTrend: e.target.value,
                })
              }
              style={{ ...inputStyle, flex: 1 }}
            >
              <option value="same">Strength: Same ➖</option>
              <option value="increasing">Strength: Up ⬆️</option>
              <option value="decreasing">Strength: Down ⬇️</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ ...btnStyle, backgroundColor: "#dc2626" }}
          >
            {loading ? "ANALYZING..." : "REVEAL TRUTH"}
          </button>
        </form>
      )}

      {/* 📊 2. GRAPH SECTION (Placed BEFORE the list for better UI) */}
      <ProgressChart data={history} />

      {/* 📜 3. HISTORY LIST SECTION */}
      <div
        style={{
          borderTop: "1px solid #333",
          paddingTop: "20px",
          marginTop: "20px",
        }}
      >
        <h3
          style={{
            color: "#666",
            fontSize: "0.9rem",
            marginBottom: "10px",
            textTransform: "uppercase",
          }}
        >
          Recent Evidence
        </h3>

        {history.length === 0 ? (
          <p style={{ color: "#444", fontSize: "0.8rem" }}>No records found.</p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {history.map((record) => (
              <div
                key={record._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px",
                  backgroundColor: "#111",
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
                    }}
                  >
                    {new Date(record.weekStartDate).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#888" }}>
                    {record.currentWeight}kg • {record.workoutDays} workouts
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Styling
const inputStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#222",
  border: "1px solid #444",
  color: "white",
  outline: "none",
};
const btnStyle = {
  width: "100%",
  padding: "15px",
  fontWeight: "bold",
  border: "none",
  cursor: "pointer",
};
