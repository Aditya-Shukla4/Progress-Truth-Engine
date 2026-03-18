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
  const [showStats, setShowStats] = useState(false);
  const [suggestions, setSuggestions] = useState({});
  const [nameSuggestions, setNameSuggestions] = useState({});
  const shareCardRef = useRef(null);
  const [shareData, setShareData] = useState(null);
  const [log, setLog] = useState({
    workoutName: "",
    exercises: [
      { name: "", targetMuscle: "Chest", sets: [{ reps: "", weight: "" }] },
    ],
  });

  const playSuccessSound = () => {
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/cartoon/pop.ogg",
    );
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 65,
      origin: { y: 0.6 },
      colors: ["#ff4500", "#ffffff", "#ff6030"],
    });
  };

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
          const n = { ...prev };
          delete n[index];
          return n;
        });
      }
    } catch (err) {
      console.error("Brain freeze", err);
    }
  };

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
      alert("Error saving workout");
    }
    setLoading(false);
  };

  const handleSaveTemplate = async () => {
    if (!log.workoutName) return alert("Add a session name first!");
    if (!confirm(`Save "${log.workoutName}" as a routine?`)) return;
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
        alert("Routine saved!");
        fetchData();
      }
    } catch (err) {
      alert("Save failed");
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
    if (!confirm("Log today as a rest day?")) return;
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

  const handleDeleteTemplate = async (e, id) => {
    e.stopPropagation();
    if (confirm("Delete this routine?")) {
      await fetch(`${apiBase}/api/template/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  const handleDeleteWorkout = async (e, id) => {
    e.stopPropagation();
    if (confirm("Delete this workout?")) {
      await fetch(`${apiBase}/api/workout/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  const handleDeleteExercise = async (e, wId, exId) => {
    e.stopPropagation();
    if (confirm("Remove this exercise?")) {
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
    const n = [...log.exercises];
    n[i][f] = v;
    setLog({ ...log, exercises: n });
  };
  const updateSet = (i, j, f, v) => {
    const n = [...log.exercises];
    n[i].sets[j][f] = v;
    setLog({ ...log, exercises: n });
  };
  const toggleCard = (id) => setExpandedId(expandedId === id ? null : id);

  const getWorkoutStats = (w) => {
    let totalVol = 0,
      best = { weight: 0, reps: 0, name: "" };
    w.exercises.forEach((ex) =>
      ex.sets.forEach((set) => {
        const weight = parseFloat(set.weight) || 0;
        const reps = parseFloat(set.reps) || 0;
        totalVol += weight * reps;
        if (weight > best.weight) best = { weight, reps, name: ex.name };
      }),
    );
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
  const historyNames = [...new Set(history.map((w) => w.workoutName))];
  const allChips = [...new Set([...historyNames, ...defaultSplits])].slice(
    0,
    10,
  );

  const muscles = [
    "Chest",
    "Back",
    "Legs",
    "Shoulders",
    "Arms",
    "Core",
    "Cardio",
    "Other",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Hidden share card */}
      <div style={{ position: "absolute", left: "-9999px" }}>
        <ShareableWorkoutCard ref={shareCardRef} {...shareData} />
      </div>

      {/* ── LOG FORM ── */}
      <form
        onSubmit={handleSubmit}
        className="card"
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        {/* Form header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "1.3rem",
                letterSpacing: "1px",
                color: "var(--text-1)",
              }}
            >
              LOG WORKOUT
            </span>
            <StreakFire history={history} />
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleRestDay}
              className="ghost-btn"
              style={{ fontSize: "0.78rem", padding: "7px 12px" }}
            >
              😴 Rest Day
            </button>
            <select
              onChange={(e) => handleLoadTemplate(e.target.value)}
              defaultValue=""
              className="cyber-input"
              style={{
                width: "auto",
                padding: "7px 12px",
                fontSize: "0.78rem",
              }}
            >
              <option value="" disabled>
                Load Routine…
              </option>
              {templates.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="divider" style={{ margin: "0" }} />

        {/* Session name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label className="label">Session Name</label>
          <input
            placeholder="e.g. Push Day"
            required
            value={log.workoutName}
            onChange={(e) => setLog({ ...log, workoutName: e.target.value })}
            className="cyber-input"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.5px",
            }}
          />
          {/* Name chips */}
          <div
            className="hide-scrollbar"
            style={{
              display: "flex",
              gap: "7px",
              overflowX: "auto",
              paddingBottom: "2px",
            }}
          >
            {allChips.map((name, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLog({ ...log, workoutName: name })}
                className={`chip ${log.workoutName === name ? "chip--active" : ""}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {log.exercises.map((ex, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="exercise-block"
            >
              {/* Exercise header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span className="label" style={{ color: "var(--ember)" }}>
                  Exercise {i + 1}
                </span>
              </div>

              {/* Name + muscle row */}
              <div
                style={{ display: "flex", gap: "8px", marginBottom: "10px" }}
              >
                <div style={{ position: "relative", flex: 2 }}>
                  <input
                    placeholder="Exercise name…"
                    required
                    value={ex.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateEx(i, "name", val);
                      if (val.length > 0) {
                        const matches = EXERCISE_DB.filter((item) =>
                          item.name.toLowerCase().includes(val.toLowerCase()),
                        ).slice(0, 5);
                        setNameSuggestions((prev) => ({
                          ...prev,
                          [i]: matches,
                        }));
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
                    className="cyber-input"
                  />
                  <AnimatePresence>
                    {nameSuggestions[i]?.length > 0 && (
                      <motion.ul
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="autocomplete-list hide-scrollbar"
                      >
                        {nameSuggestions[i].map((s, idx) => (
                          <li
                            key={idx}
                            className="autocomplete-item"
                            onClick={() => {
                              updateEx(i, "name", s.name);
                              updateEx(i, "targetMuscle", s.muscle);
                              setNameSuggestions((prev) => ({
                                ...prev,
                                [i]: [],
                              }));
                              fetchLastLog(s.name, i);
                            }}
                          >
                            <span>{s.name}</span>
                            <span className="badge">{s.muscle}</span>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
                <select
                  value={ex.targetMuscle}
                  onChange={(e) => updateEx(i, "targetMuscle", e.target.value)}
                  className="cyber-input"
                  style={{ flex: 1, cursor: "pointer" }}
                >
                  {muscles.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sets */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {ex.sets.map((s, j) => (
                  <div key={j}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        className="label"
                        style={{ minWidth: "28px", textAlign: "center" }}
                      >
                        S{j + 1}
                      </span>
                      <input
                        placeholder="kg"
                        type="number"
                        required
                        value={s.weight}
                        onChange={(e) =>
                          updateSet(i, j, "weight", e.target.value)
                        }
                        className="cyber-input"
                        style={{ flex: 1 }}
                      />
                      <span
                        className="label"
                        style={{ color: "var(--text-3)" }}
                      >
                        ×
                      </span>
                      <input
                        placeholder="reps"
                        type="number"
                        required
                        value={s.reps}
                        onChange={(e) =>
                          updateSet(i, j, "reps", e.target.value)
                        }
                        className="cyber-input"
                        style={{ flex: 1 }}
                      />
                    </div>
                    {suggestions[i]?.[j] && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "4px 36px 0",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.65rem",
                            color: "var(--text-3)",
                          }}
                        >
                          Last: {suggestions[i][j].lastWeight}kg ×{" "}
                          {suggestions[i][j].lastReps}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.65rem",
                            color: "var(--gold)",
                            fontWeight: 600,
                          }}
                        >
                          {suggestions[i][j].suggestion}
                        </span>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addSet(i)}
                className="btn-dashed"
                style={{ marginTop: "10px" }}
              >
                + Add Set
              </button>
            </motion.div>
          ))}
        </div>

        {/* Form actions */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={addExercise}
            className="ghost-btn"
            style={{ flex: 1 }}
          >
            + Exercise
          </button>
          <button
            type="button"
            onClick={handleSaveTemplate}
            className="ghost-btn"
            style={{
              flex: 1,
              color: "var(--ember)",
              borderColor: "var(--ember-border)",
            }}
          >
            Save Routine
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="neon-btn"
          style={{ marginTop: "4px" }}
        >
          {loading ? "Saving…" : "Finish & Log Workout"}
        </button>
      </form>

      {/* ── TOOLS: REST TIMER + PLATE CALC ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <RestTimer />
        <PlateCalculator />
      </div>

      {/* ── SAVED ROUTINES ── */}
      {templates.length > 0 && (
        <div className="card">
          <div className="section-header">
            <span className="section-title">Saved Routines</span>
            <span className="badge badge--ember">{templates.length}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {templates.map((t) => (
              <div
                key={t._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "5px 10px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    color: "var(--text-2)",
                  }}
                >
                  {t.name}
                </span>
                <button
                  onClick={(e) => handleDeleteTemplate(e, t._id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-3)",
                    cursor: "pointer",
                    lineHeight: 1,
                    fontSize: "0.75rem",
                    padding: "0 2px",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── WORKOUT HISTORY ── */}
      <div>
        <div className="section-header" style={{ marginBottom: "12px" }}>
          <span className="section-title">History</span>
          <span className="badge">{history.length} sessions</span>
        </div>

        <AnimatePresence mode="popLayout">
          {history.length === 0 ? (
            <p
              style={{
                color: "var(--text-3)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                textAlign: "center",
                padding: "32px 0",
              }}
            >
              No sessions logged yet.
            </p>
          ) : (
            history.map((w, idx) => {
              const isOpen = expandedId === w._id;
              const stats = getWorkoutStats(w);
              return (
                <motion.div
                  layout
                  key={w._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`history-item ${isOpen ? "history-item--active" : ""}`}
                  onClick={() => toggleCard(w._id)}
                >
                  {/* Header row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "3px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: "1.05rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {w.workoutName}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.63rem",
                          color: "var(--text-3)",
                        }}
                      >
                        {new Date(w.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {stats.totalVolume > 0 && (
                          <span
                            style={{
                              marginLeft: "10px",
                              color: "var(--ember)",
                            }}
                          >
                            {(stats.totalVolume / 1000).toFixed(1)}k kg
                          </span>
                        )}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <button
                        onClick={(e) => handleShare(e, w)}
                        className="icon-btn"
                        title="Share"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          width="15"
                          height="15"
                        >
                          <path d="M15 7a2 2 0 100-4 2 2 0 000 4zM5 12a2 2 0 100-4 2 2 0 000 4zM15 17a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            d="M7.6 10.7l4.8 2.6M12.4 6.7L7.6 9.3"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteWorkout(e, w._id)}
                        className="icon-btn"
                        title="Delete"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          width="15"
                          height="15"
                        >
                          <path
                            d="M3 5h14M8 5V3h4v2M6 5v11a1 1 0 001 1h6a1 1 0 001-1V5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <div
                        style={{
                          color: "var(--text-3)",
                          fontSize: "0.8rem",
                          marginLeft: "2px",
                          transition: "transform 0.2s",
                          transform: isOpen ? "rotate(180deg)" : "none",
                        }}
                      >
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          width="14"
                          height="14"
                        >
                          <path
                            d="M4 6l4 4 4-4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div
                          style={{
                            borderTop: "1px solid var(--border)",
                            padding: "14px 16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          {w.exercises.length === 0 ? (
                            <span
                              style={{
                                color: "var(--text-3)",
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.72rem",
                              }}
                            >
                              Rest Day 😴
                            </span>
                          ) : (
                            w.exercises.map((ex, k) => (
                              <div
                                key={k}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  gap: "12px",
                                }}
                              >
                                <div>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      marginBottom: "3px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontFamily: "var(--font-display)",
                                        fontWeight: 700,
                                        fontSize: "0.95rem",
                                        color: "var(--text-1)",
                                      }}
                                    >
                                      {ex.name}
                                    </span>
                                    <span className="badge">
                                      {ex.targetMuscle || "Other"}
                                    </span>
                                  </div>
                                  <span
                                    style={{
                                      fontFamily: "var(--font-mono)",
                                      fontSize: "0.68rem",
                                      color: "var(--text-3)",
                                    }}
                                  >
                                    {ex.sets
                                      .map((s) => `${s.weight}kg×${s.reps}`)
                                      .join("  ·  ")}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) =>
                                    handleDeleteExercise(e, w._id, ex._id)
                                  }
                                  className="icon-btn"
                                  style={{
                                    marginTop: "2px",
                                    width: "28px",
                                    height: "28px",
                                  }}
                                >
                                  <svg
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    width="11"
                                    height="11"
                                  >
                                    <path
                                      d="M2 2l10 10M12 2L2 12"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* ── ANALYTICS ── */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "16px",
          marginTop: "4px",
        }}
      >
        <button
          onClick={() => setShowStats(!showStats)}
          className="ghost-btn"
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Analytics — 1RM & Charts
          </span>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            width="14"
            height="14"
            style={{
              transform: showStats ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          >
            <path
              d="M4 6l4 4 4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  paddingTop: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <PersonalRecords apiBase={apiBase} userId={userId} />
                <OneRepMax />
                <MuscleSplitChart history={history} />
                <ExerciseChart history={history} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
