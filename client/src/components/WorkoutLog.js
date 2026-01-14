"use client";
import { useState, useEffect, useCallback } from "react";
import PersonalRecords from "./PersonalRecords";

export default function WorkoutLog({ apiBase, userId }) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [expandedId, setExpandedId] = useState(null); // 🟢 State to track open card

  const [log, setLog] = useState({
    workoutName: "",
    exercises: [{ name: "", sets: [{ reps: "", weight: "" }] }],
  });

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/workout/history/${userId}`);
      if (res.ok) setHistory(await res.json());
    } catch (err) {
      console.error("History fail");
    }
  }, [apiBase, userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/workout/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...log, userId }),
      });
      if (res.ok) {
        alert("Logged! 💪");
        setLog({
          workoutName: "",
          exercises: [{ name: "", sets: [{ reps: "", weight: "" }] }],
        });
        fetchHistory();
      }
    } catch (err) {
      alert("Error");
    }
    setLoading(false);
  };

  // UI Helpers
  const addExercise = () =>
    setLog({
      ...log,
      exercises: [
        ...log.exercises,
        { name: "", sets: [{ reps: "", weight: "" }] },
      ],
    });
  const addSet = (exIdx) => {
    const newEx = [...log.exercises];
    newEx[exIdx].sets.push({ reps: "", weight: "" });
    setLog({ ...log, exercises: newEx });
  };
  const updateEx = (idx, val) => {
    const newEx = [...log.exercises];
    newEx[idx].name = val;
    setLog({ ...log, exercises: newEx });
  };
  const updateSet = (exIdx, sIdx, field, val) => {
    const newEx = [...log.exercises];
    newEx[exIdx].sets[sIdx][field] = val;
    setLog({ ...log, exercises: newEx });
  };

  // 🟢 Toggle Card Function
  const toggleCard = (id) => {
    if (expandedId === id) setExpandedId(null); // Close if already open
    else setExpandedId(id); // Open this one
  };

  return (
    <div>
      {/* 🏆 PR SECTION */}
      <PersonalRecords apiBase={apiBase} userId={userId} />

      {/* 📝 LOG FORM */}
      <form
        onSubmit={handleSubmit}
        style={{
          ...cardStyle,
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <h3 style={{ color: "#888", fontSize: "0.9rem" }}>LOG SESSION</h3>
        <input
          placeholder="Session Name (e.g. Chest)"
          required
          value={log.workoutName}
          onChange={(e) => setLog({ ...log, workoutName: e.target.value })}
          style={{ ...inputStyle, fontWeight: "bold" }}
        />

        {log.exercises.map((ex, i) => (
          <div
            key={i}
            style={{
              background: "#000",
              padding: "10px",
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                color: "#ef4444",
                fontSize: "0.8rem",
                marginBottom: "5px",
              }}
            >
              EXERCISE {i + 1}
            </div>
            <input
              placeholder="Exercise Name"
              required
              value={ex.name}
              onChange={(e) => updateEx(i, e.target.value)}
              style={{ ...inputStyle, marginBottom: "10px" }}
            />
            {ex.sets.map((s, j) => (
              <div
                key={j}
                style={{ display: "flex", gap: "10px", marginBottom: "5px" }}
              >
                <input
                  placeholder="kg"
                  type="number"
                  required
                  value={s.weight}
                  onChange={(e) => updateSet(i, j, "weight", e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <input
                  placeholder="reps"
                  type="number"
                  required
                  value={s.reps}
                  onChange={(e) => updateSet(i, j, "reps", e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSet(i)}
              style={{
                width: "100%",
                background: "#222",
                color: "#888",
                border: "none",
                padding: "5px",
                cursor: "pointer",
              }}
            >
              + ADD SET
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addExercise}
          style={{
            padding: "10px",
            background: "none",
            border: "1px dashed #444",
            color: "#ccc",
            cursor: "pointer",
          }}
        >
          + ADD EXERCISE
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{ ...btnStyle, background: "white", color: "black" }}
        >
          SAVE LOG
        </button>
      </form>

      {/* 📜 UPDATED HISTORY SECTION (Expandable) */}
      <div style={{ marginTop: "20px" }}>
        <h3 style={{ color: "#666", fontSize: "0.8rem", marginBottom: "10px" }}>
          RECENT GRIND
        </h3>

        {history.length === 0 ? (
          <p style={{ color: "#444" }}>No logs yet.</p>
        ) : (
          history.map((w) => (
            <div
              key={w._id}
              onClick={() => toggleCard(w._id)}
              style={{
                padding: "15px",
                background: "#111",
                marginBottom: "10px",
                borderLeft:
                  expandedId === w._id
                    ? "3px solid #ef4444"
                    : "3px solid white", // Red border when open
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {/* HEADER (Always Visible) */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    {w.workoutName}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>
                    {new Date(w.date).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ color: "#666" }}>
                  {expandedId === w._id ? "🔼" : "🔽"}
                </div>
              </div>

              {/* DETAILS (Visible only if Expanded) */}
              {expandedId === w._id && (
                <div
                  style={{
                    marginTop: "15px",
                    borderTop: "1px solid #333",
                    paddingTop: "10px",
                  }}
                >
                  {w.exercises.map((ex, k) => (
                    <div key={k} style={{ marginBottom: "10px" }}>
                      <div
                        style={{
                          color: "#ef4444",
                          fontSize: "0.9rem",
                          fontWeight: "bold",
                          marginBottom: "5px",
                        }}
                      >
                        {ex.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {ex.sets.map((s, m) => (
                          <span
                            key={m}
                            style={{
                              backgroundColor: "#222",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "0.8rem",
                              color: "#ccc",
                            }}
                          >
                            {s.weight}kg x {s.reps}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Styles
const cardStyle = {
  width: "100%",
  padding: "20px",
  backgroundColor: "#111",
  border: "1px solid #333",
};
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
