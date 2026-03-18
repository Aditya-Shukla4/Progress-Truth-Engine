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
import confetti from "canvas-confetti";
import { EXERCISE_DB } from "../utils/exerciseDB";

export default function WorkoutLog({ apiBase, userId }) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showStats, setShowStats] = useState(false); // 📊 Toggle for Heavy Stats

  // 🧠 MEMORY & SUGGESTIONS
  const [suggestions, setSuggestions] = useState({});
  const [nameSuggestions, setNameSuggestions] = useState({});

  // Share State
  const shareCardRef = useRef(null);
  const [shareData, setShareData] = useState(null);

  const [log, setLog] = useState({
    workoutName: "",
    exercises: [
      { name: "", targetMuscle: "Chest", sets: [{ reps: "", weight: "" }] },
    ],
  });

  // 🔊 SOUND & CONFETTI
  const playSuccessSound = () => {
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/cartoon/pop.ogg",
    );
    audio.volume = 0.5;
    audio.play().catch((e) => console.log("Audio play failed"));
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ef4444", "#ffffff", "#000000"],
    });
  };

  // 1. DATA FETCHING
  const fetchData = useCallback(async () => {
    try {
      const resHist = await fetch(`${apiBase}/api/workout/history/${userId}`);
      if (resHist.ok) setHistory(await resHist.json());

      const resTemp = await fetch(`${apiBase}/api/template/${userId}`);
      if (resTemp.ok) setTemplates(await resTemp.json());
    } catch (err) {
      console.error("Data fetch fail");
    }
  }, [apiBase, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🧠 THE BRAIN: FETCH LAST LOG
  const fetchLastLog = async (exerciseName, index) => {
    if (!exerciseName) return;
    try {
      const res = await fetch(
        `${apiBase}/api/workout/last-log?userId=${userId}&exerciseName=${encodeURIComponent(exerciseName)}`,
      );
      const data = await res.json();
      if (data.found) {
        setSuggestions((prev) => ({ ...prev, [index]: data.sets }));
      } else {
        setSuggestions((prev) => {
          const newState = { ...prev };
          delete newState[index];
          return newState;
        });
      }
    } catch (err) {
      console.error("Brain freeze 🥶", err);
    }
  };

  // 2. SAVE WORKOUT
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
        triggerConfetti();
        playSuccessSound();
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
        setSuggestions({});
        fetchData();
      }
    } catch (err) {
      alert("Error");
    }
    setLoading(false);
  };

  // 3. TEMPLATE LOGIC
  const handleSaveTemplate = async () => {
    if (!log.workoutName) return alert("Session Name to likh bhai!");
    if (!confirm(`Save "${log.workoutName}" as routine?`)) return;
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
        alert("Saved! 💾");
        fetchData();
      }
    } catch (err) {
      alert("Fail");
    }
  };

  const handleLoadTemplate = (templateId) => {
    if (!templateId) return;
    const selected = templates.find((t) => t._id === templateId);
    if (selected) {
      setLog({
        workoutName: selected.name,
        exercises: selected.exercises.map((ex) => ({
          name: ex.name,
          targetMuscle: ex.targetMuscle,
          sets: ex.sets.map((s) => ({
            reps: s.reps || "10",
            weight: s.weight || "0",
          })),
        })),
      });
      selected.exercises.forEach((ex, i) => fetchLastLog(ex.name, i));
    }
  };

  const handleRestDay = async () => {
    if (!confirm("Aaj Rest Day hai? 😴")) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/workout/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          workoutName: "Active Recovery 😴",
          exercises: [],
        }),
      });
      if (res.ok) {
        triggerConfetti();
        playSuccessSound();
        alert("Rest Day Logged!");
        fetchData();
      }
    } catch (err) {
      alert("Error");
    }
    setLoading(false);
  };

  // HELPERS
  const handleDeleteTemplate = async (e, id) => {
    e.stopPropagation();
    if (confirm("Delete Routine?")) {
      await fetch(`${apiBase}/api/template/${id}`, { method: "DELETE" });
      fetchData();
    }
  };
  const handleDeleteWorkout = async (e, id) => {
    e.stopPropagation();
    if (confirm("Delete Workout?")) {
      await fetch(`${apiBase}/api/workout/${id}`, { method: "DELETE" });
      fetchData();
    }
  };
  const handleDeleteExercise = async (e, wId, exId) => {
    e.stopPropagation();
    if (confirm("Remove Exercise?")) {
      await fetch(`${apiBase}/api/workout/${wId}/exercise/${exId}`, {
        method: "DELETE",
      });
      fetchData();
    }
  };

  const addExercise = () =>
    setLog({
      ...log,
      exercises: [
        ...log.exercises,
        { name: "", targetMuscle: "Chest", sets: [{ reps: "", weight: "" }] },
      ],
    });
  const addSet = (i) => {
    const newEx = [...log.exercises];
    newEx[i].sets.push({ reps: "", weight: "" });
    setLog({ ...log, exercises: newEx });
  };
  const updateEx = (i, f, v) => {
    const newEx = [...log.exercises];
    newEx[i][f] = v;
    setLog({ ...log, exercises: newEx });
  };
  const updateSet = (i, j, f, v) => {
    const newEx = [...log.exercises];
    newEx[i].sets[j][f] = v;
    setLog({ ...log, exercises: newEx });
  };
  const toggleCard = (id) => setExpandedId(expandedId === id ? null : id);

  const getWorkoutStats = (w) => {
    let totalVol = 0;
    let best = { weight: 0, reps: 0, name: "" };
    w.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        const weight = parseFloat(set.weight) || 0;
        const reps = parseFloat(set.reps) || 0;
        totalVol += weight * reps;
        if (weight > best.weight) best = { weight, reps, name: ex.name };
      });
    });
    return { totalVolume: totalVol, bestLift: best.weight > 0 ? best : null };
  };

  const handleShare = async (e, w) => {
    e.stopPropagation();
    const stats = getWorkoutStats(w);
    setShareData({ workout: w, ...stats });
    setTimeout(async () => {
      if (shareCardRef.current) {
        const canvas = await html2canvas(shareCardRef.current, {
          backgroundColor: null,
          scale: 2,
        });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `PTE_${w.workoutName}.png`;
        link.click();
        setShareData(null);
      }
    }, 200);
  };

  return (
    <div>
      {/* ⚠️ HIDDEN SHARE CARD */}
      <div style={{ position: "absolute", left: "-9999px" }}>
        <ShareableWorkoutCard ref={shareCardRef} {...shareData} />
      </div>

      {/* 1️⃣ TOP SECTION: THE ACTION (LOGGING FORM) 🏋️‍♂️ */}
      <form
        onSubmit={handleSubmit}
        style={{
          ...cardStyle,
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        {/* HEADER: Streak + Rest + Load */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3
              style={{
                color: "white",
                fontSize: "1rem",
                margin: 0,
                fontWeight: "900",
                letterSpacing: "-0.5px",
              }}
            >
              LOG WORKOUT
            </h3>
            <StreakFire history={history} />
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleRestDay}
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

        {/* SESSION NAME + CHIPS */}
        <div style={{ marginBottom: "15px" }}>
          <input
            placeholder="Session Name (e.g. Push Day)"
            required
            value={log.workoutName}
            onChange={(e) => setLog({ ...log, workoutName: e.target.value })}
            style={{ ...inputStyle, fontWeight: "bold", marginBottom: "8px" }}
          />
          {/* SMART CHIPS */}
          {(() => {
            const defaultSplits = [
              "Push Day",
              "Pull Day",
              "Leg Day",
              "Upper Body",
              "Lower Body",
              "Chest Day",
              "Back Day",
              "Arms",
              "Shoulders",
            ];
            const historyNames = [
              ...new Set(history.map((w) => w.workoutName)),
            ];
            const allSuggestions = [
              ...new Set([...historyNames, ...defaultSplits]),
            ].slice(0, 10);
            return (
              <div
                className="hide-scrollbar"
                style={{
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                  paddingBottom: "5px",
                }}
              >
                {allSuggestions.map((name, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLog({ ...log, workoutName: name })}
                    style={{
                      background: log.workoutName === name ? "#ef4444" : "#222",
                      color: log.workoutName === name ? "white" : "#ccc",
                      border:
                        log.workoutName === name
                          ? "1px solid #ef4444"
                          : "1px solid #444",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            );
          })()}
        </div>

        {/* EXERCISES LOOP */}
        {log.exercises.map((ex, i) => (
          <div
            key={i}
            style={{
              background: "#000",
              padding: "10px",
              border: "1px solid #333",
              borderRadius: "5px",
            }}
          >
            <div
              style={{
                color: "#ef4444",
                fontSize: "0.8rem",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              EXERCISE {i + 1}
            </div>

            {/* INPUT + MUSCLE SELECT */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <div style={{ position: "relative", flex: 2 }}>
                <input
                  placeholder="Exercise Name"
                  required
                  value={ex.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateEx(i, "name", val);
                    if (val.length > 0) {
                      const matches = EXERCISE_DB.filter((item) =>
                        item.name.toLowerCase().includes(val.toLowerCase()),
                      ).slice(0, 5);
                      setNameSuggestions((prev) => ({ ...prev, [i]: matches }));
                    } else {
                      setNameSuggestions((prev) => ({ ...prev, [i]: [] }));
                    }
                  }}
                  onBlur={() => {
                    setTimeout(
                      () =>
                        setNameSuggestions((prev) => ({ ...prev, [i]: [] })),
                      200,
                    );
                    fetchLastLog(ex.name, i);
                  }}
                  style={{ ...inputStyle, width: "100%" }}
                />
                {nameSuggestions[i] && nameSuggestions[i].length > 0 && (
                  <ul
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      width: "100%",
                      background: "#222",
                      border: "1px solid #444",
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      zIndex: 10,
                      maxHeight: "150px",
                      overflowY: "auto",
                    }}
                  >
                    {nameSuggestions[i].map((suggestion, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          updateEx(i, "name", suggestion.name);
                          updateEx(i, "targetMuscle", suggestion.muscle);
                          setNameSuggestions((prev) => ({ ...prev, [i]: [] }));
                          fetchLastLog(suggestion.name, i);
                        }}
                        style={{
                          padding: "10px",
                          borderBottom: "1px solid #333",
                          cursor: "pointer",
                          color: "#ccc",
                          fontSize: "0.9rem",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.background = "#333")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background = "#222")
                        }
                      >
                        <span>{suggestion.name}</span>
                        <span style={{ fontSize: "0.7rem", color: "#666" }}>
                          {suggestion.muscle}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
                <option value="Core">Abs</option>
                <option value="Cardio">Cardio</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* SETS */}
            {ex.sets.map((s, j) => (
              <div key={j} style={{ marginBottom: "10px" }}>
                <div
                  style={{ display: "flex", gap: "10px", marginBottom: "2px" }}
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
                {/* GHOST SUGGESTION */}
                {suggestions[i] && suggestions[i][j] && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#666",
                      fontStyle: "italic",
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0 5px",
                    }}
                  >
                    <span>
                      Last: {suggestions[i][j].lastWeight}kg ×{" "}
                      {suggestions[i][j].lastReps}
                    </span>
                    <span style={{ color: "#facc15", fontWeight: "bold" }}>
                      {suggestions[i][j].suggestion}
                    </span>
                  </div>
                )}
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

        {/* FORM ACTIONS */}
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
          style={{
            ...btnStyle,
            background: "white",
            color: "black",
            fontSize: "1rem",
          }}
        >
          FINISH & LOG
        </button>
      </form>

      {/* 2️⃣ MIDDLE: ACTIVE TOOLS (TIMER + PLATE CALCULATOR) ⏱️💿 */}
      {/* Ye visible rahenge kyunki workout ke beech me chahiye */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <RestTimer />
        <PlateCalculator />
      </div>

      {/* 3️⃣ BOTTOM: HISTORY LIST 📜 */}
      <div style={{ marginTop: "20px" }}>
        {/* Saved Routines */}
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

        {/* Workout History */}
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

      {/* 4️⃣ FOOTER: HEAVY STATS & 1RM (COLLAPSIBLE) 📊 */}
      {/* Charts aur 1RM yahan hain. Toggle kar sakte hain taaki clutter na ho */}
      <div
        style={{
          marginTop: "30px",
          borderTop: "1px solid #333",
          paddingTop: "20px",
        }}
      >
        <button
          onClick={() => setShowStats(!showStats)}
          style={{
            width: "100%",
            padding: "10px",
            background: "#222",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {showStats
            ? "🔼 HIDE ANALYTICS (1RM & CHARTS)"
            : "🔽 SHOW ANALYTICS (1RM & CHARTS)"}
        </button>

        {showStats && (
          <div style={{ marginTop: "20px" }}>
            <PersonalRecords apiBase={apiBase} userId={userId} />
            <OneRepMax /> {/* 👈 1RM YAHAN HAI */}
            <MuscleSplitChart history={history} />
            <ExerciseChart history={history} />
          </div>
        )}
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
