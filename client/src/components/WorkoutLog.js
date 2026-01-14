"use client";
import { useState, useEffect, useCallback, useRef } from "react"; // 👈 useRef add kiya
import PersonalRecords from "./PersonalRecords";
import RestTimer from "./RestTimer";
import OneRepMax from "./OneRepMax";
import MuscleSplitChart from "./MuscleSplitChart";
import ShareableWorkoutCard from "./ShareableWorkoutCard"; // 👈 NEW IMPORT
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas"; // 👈 NEW IMPORT

export default function WorkoutLog({ apiBase, userId }) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  // 📸 SHARE STATE
  const shareCardRef = useRef(null);
  const [shareData, setShareData] = useState(null);

  const [log, setLog] = useState({
    workoutName: "",
    exercises: [
      { name: "", targetMuscle: "Chest", sets: [{ reps: "", weight: "" }] },
    ],
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
          exercises: [
            {
              name: "",
              targetMuscle: "Chest",
              sets: [{ reps: "", weight: "" }],
            },
          ],
        });
        fetchHistory();
      }
    } catch (err) {
      alert("Error");
    }
    setLoading(false);
  };

  // 🗑️ DELETE FUNCTIONS
  const handleDeleteWorkout = async (e, workoutId) => {
    e.stopPropagation();
    if (!confirm("Pura Workout uda du?")) return;
    try {
      const res = await fetch(`${apiBase}/api/workout/${workoutId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchHistory();
    } catch (err) {
      alert("Server Error");
    }
  };

  const handleDeleteExercise = async (e, workoutId, exerciseId) => {
    e.stopPropagation();
    if (!confirm("Sirf ye exercise hatani hai?")) return;
    try {
      const res = await fetch(
        `${apiBase}/api/workout/${workoutId}/exercise/${exerciseId}`,
        { method: "DELETE" }
      );
      if (res.ok) fetchHistory();
    } catch (err) {
      alert("Server Error");
    }
  };

  // UI Helpers
  const addExercise = () =>
    setLog({
      ...log,
      exercises: [
        ...log.exercises,
        { name: "", targetMuscle: "Chest", sets: [{ reps: "", weight: "" }] },
      ],
    });

  const addSet = (exIdx) => {
    const newEx = [...log.exercises];
    newEx[exIdx].sets.push({ reps: "", weight: "" });
    setLog({ ...log, exercises: newEx });
  };

  const updateEx = (idx, field, val) => {
    const newEx = [...log.exercises];
    newEx[idx][field] = val;
    setLog({ ...log, exercises: newEx });
  };

  const updateSet = (exIdx, sIdx, field, val) => {
    const newEx = [...log.exercises];
    newEx[exIdx].sets[sIdx][field] = val;
    setLog({ ...log, exercises: newEx });
  };

  const toggleCard = (id) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  // 🧮 STATS CALCULATION FOR SHARE
  const getWorkoutStats = (workout) => {
    let totalVol = 0;
    let best = { weight: 0, reps: 0, name: "" };

    workout.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        const w = parseFloat(set.weight) || 0;
        const r = parseFloat(set.reps) || 0;
        totalVol += w * r;
        if (w > best.weight) {
          best = { weight: w, reps: r, name: ex.name };
        }
      });
    });
    return { totalVolume: totalVol, bestLift: best.weight > 0 ? best : null };
  };

  // 📸 SHARE HANDLER
  const handleShare = async (e, workout) => {
    e.stopPropagation();

    // 1. Data Ready Karo
    const stats = getWorkoutStats(workout);
    setShareData({ workout, ...stats });

    // 2. Wait for Render & Capture
    setTimeout(async () => {
      if (shareCardRef.current) {
        try {
          const canvas = await html2canvas(shareCardRef.current, {
            backgroundColor: null,
            scale: 2, // High Quality
          });

          const image = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = image;
          link.download = `PTE_${workout.workoutName}.png`;
          link.click();

          setShareData(null); // Cleanup
        } catch (err) {
          console.error("Share failed:", err);
          alert("Image generation failed.");
        }
      }
    }, 200);
  };

  return (
    <div>
      <PersonalRecords apiBase={apiBase} userId={userId} />
      <RestTimer />
      <MuscleSplitChart history={history} />
      <OneRepMax />

      {/* 🤫 HIDDEN CARD FOR SHARING */}
      <ShareableWorkoutCard ref={shareCardRef} {...shareData} />

      {/* LOG FORM */}
      <form
        onSubmit={handleSubmit}
        style={{
          ...cardStyle,
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        <h3 style={{ color: "#888", fontSize: "0.9rem" }}>LOG SESSION</h3>
        <input
          placeholder="Session Name (e.g. Push Day)"
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

            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <input
                placeholder="Exercise Name"
                required
                value={ex.name}
                onChange={(e) => updateEx(i, "name", e.target.value)}
                style={{ ...inputStyle, flex: 2 }}
              />

              <select
                value={ex.targetMuscle}
                onChange={(e) => updateEx(i, "targetMuscle", e.target.value)}
                style={{ ...inputStyle, flex: 1, cursor: "pointer" }}
              >
                <option value="Chest">Chest</option>
                <option value="Back">Back</option>
                <option value="Legs">Legs</option>
                <option value="Shoulders">Shoulders</option>
                <option value="Arms">Arms</option>
                <option value="Core">Abs/Core</option>
                <option value="Cardio">Cardio</option>
                <option value="Other">Other</option>
              </select>
            </div>

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

      {/* HISTORY WITH SHARE BUTTON */}
      <div style={{ marginTop: "20px" }}>
        <h3 style={{ color: "#666", fontSize: "0.8rem", marginBottom: "10px" }}>
          RECENT GRIND
        </h3>
        <AnimatePresence mode="popLayout">
          {history.length === 0 ? (
            <p style={{ color: "#444" }}>No logs yet.</p>
          ) : (
            history.map((w) => (
              <motion.div
                layout
                key={w._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => toggleCard(w._id)}
                style={{
                  padding: "15px",
                  background: "#111",
                  marginBottom: "10px",
                  borderLeft:
                    expandedId === w._id
                      ? "3px solid #ef4444"
                      : "3px solid white",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
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

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {/* 📸 SHARE BUTTON */}
                    <button
                      onClick={(e) => handleShare(e, w)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                      }}
                      title="Share Workout"
                    >
                      📸
                    </button>

                    <button
                      onClick={(e) => handleDeleteWorkout(e, w._id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                      }}
                      title="Delete Workout"
                    >
                      🗑️
                    </button>
                    <div style={{ color: "#666" }}>
                      {expandedId === w._id ? "🔼" : "🔽"}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === w._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{
                        marginTop: "15px",
                        borderTop: "1px solid #333",
                        paddingTop: "10px",
                      }}
                    >
                      {w.exercises.map((ex, k) => (
                        <div
                          key={k}
                          style={{
                            marginBottom: "10px",
                            paddingBottom: "10px",
                            borderBottom:
                              k === w.exercises.length - 1
                                ? "none"
                                : "1px dashed #222",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  color: "#ef4444",
                                  fontSize: "0.9rem",
                                  fontWeight: "bold",
                                  marginRight: "10px",
                                }}
                              >
                                {ex.name}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  backgroundColor: "#222",
                                  padding: "2px 5px",
                                  borderRadius: "3px",
                                  color: "#888",
                                }}
                              >
                                {ex.targetMuscle || "Other"}
                              </span>
                            </div>
                            <button
                              onClick={(e) =>
                                handleDeleteExercise(e, w._id, ex._id)
                              }
                              style={{
                                background: "#222",
                                border: "1px solid #333",
                                color: "#888",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              ✕ Remove
                            </button>
                          </div>
                          <div
                            style={{
                              color: "#ccc",
                              fontSize: "0.8rem",
                              marginTop: "5px",
                            }}
                          >
                            {ex.sets
                              .map((s) => `${s.weight}kg x ${s.reps}`)
                              .join(" | ")}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
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
