"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import PersonalRecords from "./PersonalRecords";
import RestTimer from "./RestTimer";
import OneRepMax from "./OneRepMax";
import MuscleSplitChart from "./MuscleSplitChart";
import ShareableWorkoutCard from "./ShareableWorkoutCard";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import ExerciseChart from "./ExerciseChart";
import StreakFire from "./StreakFire";
import PlateCalculator from "./PlateCalculator";

export default function WorkoutLog({ apiBase, userId }) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [templates, setTemplates] = useState([]); // 👈 Store Templates
  const [expandedId, setExpandedId] = useState(null);

  // Share State
  const shareCardRef = useRef(null);
  const [shareData, setShareData] = useState(null);

  const [log, setLog] = useState({
    workoutName: "",
    exercises: [
      { name: "", targetMuscle: "Chest", sets: [{ reps: "", weight: "" }] },
    ],
  });

  // 1. FETCH HISTORY & TEMPLATES
  const fetchData = useCallback(async () => {
    try {
      // Fetch History
      const resHist = await fetch(`${apiBase}/api/workout/history/${userId}`);
      if (resHist.ok) setHistory(await resHist.json());

      // Fetch Templates 👈 NEW
      const resTemp = await fetch(`${apiBase}/api/template/${userId}`);
      if (resTemp.ok) setTemplates(await resTemp.json());
    } catch (err) {
      console.error("Data fetch fail");
    }
  }, [apiBase, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. SAVE LOGIC (Workout)
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
        fetchData();
      }
    } catch (err) {
      alert("Error");
    }
    setLoading(false);
  };

  // 3. SAVE AS TEMPLATE (Routine) 👈 NEW
  const handleSaveTemplate = async () => {
    if (!log.workoutName)
      return alert("Pehle Routine ka naam toh likh! (Session Name)");

    const confirmSave = confirm(
      `Save "${log.workoutName}" as a permanent routine?`
    );
    if (!confirmSave) return;

    try {
      const res = await fetch(`${apiBase}/api/template/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: log.workoutName,
          exercises: log.exercises,
        }),
      });
      if (res.ok) {
        alert("Routine Saved! 💾");
        fetchData(); // Refresh dropdown
      }
    } catch (err) {
      alert("Save failed");
    }
  };

  // 4. LOAD TEMPLATE 👈 NEW
  const handleLoadTemplate = (templateId) => {
    if (!templateId) return;

    const selected = templates.find((t) => t._id === templateId);
    if (selected) {
      // Template data load karo, lekin sets khali rakho taaki user aaj ka weight daale
      setLog({
        workoutName: selected.name,
        exercises: selected.exercises.map((ex) => ({
          name: ex.name,
          targetMuscle: ex.targetMuscle,
          sets: [{ reps: "", weight: "" }], // Clean slate for today
        })),
      });
    }
  };

  // 5. DELETE TEMPLATE
  const handleDeleteTemplate = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Ye Routine uda du?")) return;
    await fetch(`${apiBase}/api/template/${id}`, { method: "DELETE" });
    fetchData();
  };

  // ... (Standard Helpers: delete, addSet, share etc. - Same as before)
  const handleDeleteWorkout = async (e, workoutId) => {
    e.stopPropagation();
    if (!confirm("Pura Workout uda du?")) return;
    await fetch(`${apiBase}/api/workout/${workoutId}`, { method: "DELETE" });
    fetchData();
  };
  const handleDeleteExercise = async (e, workoutId, exerciseId) => {
    e.stopPropagation();
    if (!confirm("Sirf ye exercise hatani hai?")) return;
    await fetch(`${apiBase}/api/workout/${workoutId}/exercise/${exerciseId}`, {
      method: "DELETE",
    });
    fetchData();
  };
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
  const handleShare = async (e, workout) => {
    e.stopPropagation();
    const stats = getWorkoutStats(workout);
    setShareData({ workout, ...stats });
    setTimeout(async () => {
      if (shareCardRef.current) {
        const canvas = await html2canvas(shareCardRef.current, {
          backgroundColor: null,
          scale: 2,
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `PTE_${workout.workoutName}.png`;
        link.click();
        setShareData(null);
      }
    }, 200);
  };

  // 👇 1. NEW FUNCTION: HANDLE REST DAY
  const handleRestDay = async () => {
    const confirmRest = confirm(
      "Aaj pakka Rest Day hai? (Streak bach jayegi) 😴"
    );
    if (!confirmRest) return;

    setLoading(true);
    try {
      // Hum ek Empty Workout bhejenge
      const res = await fetch(`${apiBase}/api/workout/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          workoutName: "Active Recovery 😴", // Naam Rest Day
          exercises: [], // Koi exercise nahi
        }),
      });

      if (res.ok) {
        alert("Rest Day Logged! Streak Saved. 🔥");
        fetchHistory(); // History refresh
      }
    } catch (err) {
      alert("Error logging rest day");
    }
    setLoading(false);
  };

  return (
    <div>
      <PersonalRecords apiBase={apiBase} userId={userId} />
      <RestTimer />

      <PlateCalculator />

      <MuscleSplitChart history={history} />

      <ExerciseChart history={history} />

      <OneRepMax />
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
        {/* 🆕 TEMPLATE LOADER HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #333",
            paddingBottom: "15px",
            marginBottom: "5px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {/* Left Side: Title + Streak */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3 style={{ color: "#888", fontSize: "0.9rem", margin: 0 }}>
              LOG SESSION
            </h3>
            <StreakFire history={history} />
          </div>

          {/* 👇 2. NEW BUTTONS SECTION (Rest Day + Load) */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {/* REST BUTTON */}
            <button
              type="button"
              onClick={handleRestDay}
              title="Log Rest Day to keep Streak alive"
              style={{
                background: "none",
                border: "1px solid #444",
                color: "#888",
                padding: "5px 10px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              😴 Rest
            </button>

            {/* DROPDOWN */}
            <select
              onChange={(e) => handleLoadTemplate(e.target.value)}
              style={{
                padding: "6px",
                background: "#222",
                color: "#fff",
                border: "1px solid #444",
                fontSize: "0.8rem",
                borderRadius: "5px",
                outline: "none",
                cursor: "pointer",
              }}
              defaultValue=""
            >
              <option value="" disabled>
                📂 Load Routine...
              </option>
              {templates.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

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

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={addExercise}
            style={{
              flex: 1,
              padding: "10px",
              background: "none",
              border: "1px dashed #444",
              color: "#ccc",
              cursor: "pointer",
            }}
          >
            + ADD EXERCISE
          </button>
          {/* 🆕 SAVE TEMPLATE BUTTON */}
          <button
            type="button"
            onClick={handleSaveTemplate}
            style={{
              flex: 1,
              padding: "10px",
              background: "#222",
              border: "1px solid #444",
              color: "#ef4444",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            💾 SAVE ROUTINE
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ ...btnStyle, background: "white", color: "black" }}
        >
          FINISH & LOG
        </button>
      </form>

      {/* HISTORY (With Manage Templates Section? Optional but let's keep it simple for now) */}
      <div style={{ marginTop: "20px" }}>
        {/* Simple Template List to Delete */}
        {templates.length > 0 && (
          <div
            style={{
              marginBottom: "20px",
              padding: "10px",
              border: "1px dashed #333",
            }}
          >
            <h4
              style={{
                margin: 0,
                marginBottom: "10px",
                color: "#666",
                fontSize: "0.8rem",
              }}
            >
              SAVED ROUTINES
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {templates.map((t) => (
                <div
                  key={t._id}
                  style={{
                    background: "#111",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    fontSize: "0.8rem",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <span>{t.name}</span>
                  <span
                    onClick={(e) => handleDeleteTemplate(e, t._id)}
                    style={{ cursor: "pointer", color: "#ef4444" }}
                  >
                    ✕
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 style={{ color: "#666", fontSize: "0.9rem", marginBottom: "10px" }}>
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
                    <button
                      onClick={(e) => handleShare(e, w)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                      }}
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
