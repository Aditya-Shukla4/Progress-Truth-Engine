"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EXERCISE_DB } from "../utils/exerciseDB";
import confetti from "canvas-confetti";

// ── Constants ────────────────────────────────────────────────────────────
const REST_PRESETS = [30, 60, 90, 120, 180];
const MUSCLES = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Cardio",
  "Other",
];

// ── Helpers ───────────────────────────────────────────────────────────────
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const uid = () => Math.random().toString(36).slice(2, 8);
const newSet = (prev) => ({
  id: uid(),
  weight: prev?.weight || "",
  reps: prev?.reps || "",
  done: false,
});
const newExercise = () => ({
  id: uid(),
  name: "",
  targetMuscle: "Chest",
  sets: [newSet()],
});

// ── Circular timer SVG ────────────────────────────────────────────────────
const R = 44;
const CIRC = 2 * Math.PI * R;

function RingTimer({ total, remaining, onDone }) {
  const pct = total > 0 ? remaining / total : 0;
  const offset = CIRC * (1 - pct);
  const urgent = remaining <= 10 && remaining > 0;

  useEffect(() => {
    if (remaining === 0) onDone?.();
  }, [remaining]);

  return (
    <div style={{ position: "relative", width: 100, height: 100 }}>
      <svg width={100} height={100} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={50}
          cy={50}
          r={R}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={6}
        />
        <motion.circle
          cx={50}
          cy={50}
          r={R}
          fill="none"
          stroke={urgent ? "#ef4444" : "var(--ember)"}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 6px ${urgent ? "rgba(239,68,68,0.5)" : "var(--ember-glow)"})`,
            transition: "stroke-dashoffset 0.9s linear, stroke 0.3s",
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "1.5rem",
            color: urgent ? "#ef4444" : "var(--text-1)",
            lineHeight: 1,
            transition: "color 0.3s",
          }}
        >
          {fmt(remaining)}
        </span>
        <span className="label" style={{ marginTop: "1px" }}>
          rest
        </span>
      </div>
    </div>
  );
}

// ── Set row ───────────────────────────────────────────────────────────────
function SetRow({
  set,
  idx,
  lastSet,
  onUpdate,
  onComplete,
  onDelete,
  isActive,
}) {
  const weightRef = useRef();
  const repsRef = useRef();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, height: 0 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 0",
        borderBottom: "1px solid var(--border)",
        opacity: set.done && !isActive ? 0.5 : 1,
        transition: "opacity 0.3s",
      }}
    >
      {/* Set number */}
      <div style={{ width: "24px", textAlign: "center", flexShrink: 0 }}>
        {set.done ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ color: "var(--green)", fontSize: "1rem" }}
          >
            ✓
          </motion.span>
        ) : (
          <span className="label">{idx + 1}</span>
        )}
      </div>

      {/* Ghost suggestion */}
      {lastSet && !set.weight && !set.reps && (
        <div style={{ flex: 1, display: "flex", gap: "8px" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--text-4)",
              }}
            >
              {lastSet.weight}
            </span>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--text-4)",
              }}
            >
              {lastSet.reps}
            </span>
          </div>
        </div>
      )}

      {/* Weight */}
      <div style={{ flex: 1, position: "relative" }}>
        <input
          ref={weightRef}
          type="number"
          inputMode="decimal"
          placeholder={lastSet?.weight || "kg"}
          value={set.weight}
          disabled={set.done}
          onChange={(e) => onUpdate("weight", e.target.value)}
          onFocus={() => weightRef.current?.select()}
          style={{
            width: "100%",
            background: set.done ? "transparent" : "var(--surface-2)",
            border: `1px solid ${isActive && !set.done ? "var(--ember-border)" : "var(--border)"}`,
            color: "var(--text-1)",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.1rem",
            padding: "8px 10px",
            borderRadius: "var(--radius-sm)",
            outline: "none",
            textAlign: "center",
            transition: "border-color 0.2s",
          }}
        />
      </div>
      <span className="label" style={{ flexShrink: 0 }}>
        ×
      </span>
      {/* Reps */}
      <div style={{ flex: 1 }}>
        <input
          ref={repsRef}
          type="number"
          inputMode="numeric"
          placeholder={lastSet?.reps || "reps"}
          value={set.reps}
          disabled={set.done}
          onChange={(e) => onUpdate("reps", e.target.value)}
          onFocus={() => repsRef.current?.select()}
          onKeyDown={(e) => {
            if (e.key === "Enter") onComplete();
          }}
          style={{
            width: "100%",
            background: set.done ? "transparent" : "var(--surface-2)",
            border: `1px solid ${isActive && !set.done ? "var(--ember-border)" : "var(--border)"}`,
            color: "var(--text-1)",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.1rem",
            padding: "8px 10px",
            borderRadius: "var(--radius-sm)",
            outline: "none",
            textAlign: "center",
            transition: "border-color 0.2s",
          }}
        />
      </div>

      {/* Complete / delete */}
      {!set.done ? (
        <button
          onClick={onComplete}
          disabled={!set.weight || !set.reps}
          style={{
            width: "36px",
            height: "36px",
            flexShrink: 0,
            background:
              set.weight && set.reps ? "var(--ember)" : "var(--surface-3)",
            border: "none",
            borderRadius: "50%",
            color: "white",
            cursor: set.weight && set.reps ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
            boxShadow:
              set.weight && set.reps ? "0 0 12px var(--ember-glow)" : "none",
          }}
        >
          <svg
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            width="12"
            height="12"
          >
            <path
              d="M2 7l3.5 3.5L12 3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <button
          onClick={onDelete}
          style={{
            width: "36px",
            height: "36px",
            flexShrink: 0,
            background: "transparent",
            border: "none",
            color: "var(--text-4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            width="12"
            height="12"
          >
            <path d="M2 2l10 10M12 2L2 12" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}

// ── Exercise card ─────────────────────────────────────────────────────────
function ExerciseCard({
  ex,
  exIdx,
  isActive,
  lastSets,
  suggestions,
  onUpdate,
  onAddSet,
  onCompleteSet,
  onDeleteSet,
  onDeleteExercise,
  onFocus,
}) {
  const [showSug, setShowSug] = useState(false);
  const [nameQuery, setNameQuery] = useState(ex.name);

  const allDone = ex.sets.length > 0 && ex.sets.every((s) => s.done);
  const doneSets = ex.sets.filter((s) => s.done).length;

  const matches =
    nameQuery.length > 1
      ? EXERCISE_DB.filter((e) =>
          e.name.toLowerCase().includes(nameQuery.toLowerCase()),
        ).slice(0, 5)
      : [];

  return (
    <motion.div
      layout
      onClick={onFocus}
      style={{
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${isActive ? "var(--ember-border)" : allDone ? "rgba(34,197,94,0.25)" : "var(--border)"}`,
        background: isActive
          ? "linear-gradient(135deg, rgba(255,69,0,0.05) 0%, var(--surface-1) 50%)"
          : allDone
            ? "linear-gradient(135deg, rgba(34,197,94,0.05) 0%, var(--surface-1) 60%)"
            : "var(--surface-1)",
        overflow: "hidden",
        transition: "border-color 0.3s, background 0.3s",
        boxShadow: isActive
          ? "0 0 0 1px var(--ember-border), 0 4px 24px rgba(255,69,0,0.08)"
          : "none",
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: "14px 16px 10px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
        }}
      >
        <div style={{ flex: 1 }}>
          {/* Exercise name input */}
          <div style={{ position: "relative" }}>
            <input
              value={nameQuery}
              onChange={(e) => {
                setNameQuery(e.target.value);
                onUpdate("name", e.target.value);
                setShowSug(true);
              }}
              onFocus={() => {
                setShowSug(true);
                onFocus();
              }}
              onBlur={() => setTimeout(() => setShowSug(false), 200)}
              placeholder="Exercise name…"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: "var(--text-1)",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.1rem",
                letterSpacing: "0.5px",
                outline: "none",
                padding: 0,
              }}
            />
            <AnimatePresence>
              {showSug && matches.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="autocomplete-list hide-scrollbar"
                  style={{ top: "calc(100% + 6px)" }}
                >
                  {matches.map((m, i) => (
                    <li
                      key={i}
                      className="autocomplete-item"
                      onClick={() => {
                        onUpdate("name", m.name);
                        onUpdate("targetMuscle", m.muscle);
                        setNameQuery(m.name);
                        setShowSug(false);
                      }}
                    >
                      <span>{m.name}</span>
                      <span className="badge">{m.muscle}</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Muscle + progress */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            <select
              value={ex.targetMuscle}
              onChange={(e) => onUpdate("targetMuscle", e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-3)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                letterSpacing: "0.08em",
                cursor: "pointer",
                outline: "none",
                padding: 0,
              }}
            >
              {MUSCLES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {ex.sets.length > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  color: allDone ? "var(--green)" : "var(--text-3)",
                }}
              >
                {doneSets}/{ex.sets.length} sets {allDone ? "✓" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Volume badge + delete */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {allDone &&
            ex.sets.length > 0 &&
            (() => {
              const vol = ex.sets.reduce(
                (a, s) => a + (Number(s.weight) || 0) * (Number(s.reps) || 0),
                0,
              );
              return vol > 0 ? (
                <span className="badge badge--green">{vol}kg vol</span>
              ) : null;
            })()}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteExercise();
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-4)",
              cursor: "pointer",
              padding: "4px",
              lineHeight: 1,
            }}
          >
            <svg
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              width="13"
              height="13"
            >
              <path d="M2 2l10 10M12 2L2 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sets */}
      <div style={{ padding: "0 16px" }}>
        <div style={{ display: "flex", gap: "8px", paddingBottom: "6px" }}>
          <div style={{ width: "24px" }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <span className="label">kg</span>
          </div>
          <div style={{ width: "16px" }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <span className="label">reps</span>
          </div>
          <div style={{ width: "36px" }} />
        </div>

        <AnimatePresence>
          {ex.sets.map((set, si) => (
            <SetRow
              key={set.id}
              set={set}
              idx={si}
              lastSet={lastSets?.[si]}
              isActive={isActive}
              onUpdate={(field, val) => onUpdate("set", si, field, val)}
              onComplete={() => onCompleteSet(si)}
              onDelete={() => onDeleteSet(si)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Suggestion bar */}
      {suggestions && !allDone && (
        <div
          style={{
            padding: "8px 16px",
            background: "var(--surface-0)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "var(--text-3)",
            }}
          >
            Last session →
          </span>
          <div style={{ display: "flex", gap: "12px" }}>
            {suggestions.slice(0, 3).map((s, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  color: "var(--text-2)",
                }}
              >
                {s.lastWeight}kg×{s.lastReps}
                {s.suggestion && (
                  <span style={{ color: "var(--gold)", marginLeft: "4px" }}>
                    ↑
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add set */}
      <div style={{ padding: "10px 16px 14px" }}>
        <button
          onClick={onAddSet}
          style={{
            width: "100%",
            padding: "8px",
            background: "transparent",
            border: "1px dashed var(--border-md)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text-3)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--ember-border)";
            e.currentTarget.style.color = "var(--ember)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-md)";
            e.currentTarget.style.color = "var(--text-3)";
          }}
        >
          + Add Set
        </button>
      </div>
    </motion.div>
  );
}

// ── Rest timer overlay ────────────────────────────────────────────────────
function RestOverlay({ onDismiss }) {
  const [selected, setSelected] = useState(90);
  const [active, setActive] = useState(false);
  const [secs, setSecs] = useState(90);

  useEffect(() => {
    if (!active) return;
    if (secs <= 0) {
      if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
      setActive(false);
      return;
    }
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [active, secs]);

  const start = (t) => {
    setSelected(t);
    setSecs(t);
    setActive(true);
  };
  const stop = () => {
    setActive(false);
    setSecs(selected);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(6,6,8,0.96)",
        backdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "32px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <p className="label" style={{ marginBottom: "8px" }}>
          Rest Timer
        </p>
        <RingTimer
          total={selected}
          remaining={secs}
          onDone={() => setActive(false)}
        />
      </div>

      {/* Presets */}
      <div style={{ display: "flex", gap: "8px" }}>
        {REST_PRESETS.map((t) => (
          <button
            key={t}
            onClick={() => start(t)}
            style={{
              padding: "8px 14px",
              background:
                selected === t && active ? "var(--ember)" : "var(--surface-2)",
              border: `1px solid ${selected === t ? "var(--ember-border)" : "var(--border)"}`,
              borderRadius: "var(--radius-md)",
              color: selected === t && active ? "white" : "var(--text-2)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {t < 60 ? `${t}s` : `${t / 60}m`}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        {active && (
          <button
            onClick={stop}
            style={{
              padding: "12px 24px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-2)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        )}
        <button
          onClick={onDismiss}
          style={{
            padding: "12px 28px",
            background: "var(--ember)",
            border: "none",
            borderRadius: "var(--radius-md)",
            color: "white",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1rem",
            letterSpacing: "0.05em",
            cursor: "pointer",
            boxShadow: "0 0 20px var(--ember-glow)",
          }}
        >
          Done Resting →
        </button>
      </div>
    </motion.div>
  );
}

// ── Main ActiveWorkout component ──────────────────────────────────────────
export default function ActiveWorkout({
  apiBase,
  userId,
  initialName = "",
  onFinish,
  onDiscard,
}) {
  const [workoutName, setWorkoutName] = useState(initialName || "");
  const [exercises, setExercises] = useState([newExercise()]);
  const [activeExIdx, setActiveExIdx] = useState(0);
  const [suggestions, setSuggestions] = useState({});
  const [showRest, setShowRest] = useState(false);
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showDiscard, setShowDiscard] = useState(false);
  const startTime = useRef(Date.now());

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(
      () => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)),
      1000,
    );
    return () => clearInterval(t);
  }, []);

  // Fetch last log for exercise
  const fetchSuggestions = useCallback(
    async (name, idx) => {
      if (!name || !apiBase || !userId) return;
      try {
        const res = await fetch(
          `${apiBase}/api/workout/last-log?userId=${userId}&exerciseName=${encodeURIComponent(name)}`,
        );
        const data = await res.json();
        if (data.found)
          setSuggestions((prev) => ({ ...prev, [idx]: data.sets }));
      } catch {}
    },
    [apiBase, userId],
  );

  // ── Exercise mutations ─────────────────────────────────────────────────
  const updateExercise = (idx, field, ...args) => {
    setExercises((prev) => {
      const next = prev.map((e, i) => {
        if (i !== idx) return e;
        if (field === "set") {
          const [si, sField, val] = args;
          const sets = e.sets.map((s, j) =>
            j === si ? { ...s, [sField]: val } : s,
          );
          return { ...e, sets };
        }
        return { ...e, [field]: args[0] };
      });
      return next;
    });
    if (field === "name") fetchSuggestions(args[0], idx);
  };

  const addSet = (idx) => {
    setExercises((prev) =>
      prev.map((e, i) => {
        if (i !== idx) return e;
        const lastSet = e.sets[e.sets.length - 1];
        return { ...e, sets: [...e.sets, newSet(lastSet)] };
      }),
    );
  };

  const completeSet = (exIdx, setIdx) => {
    setExercises((prev) =>
      prev.map((e, i) => {
        if (i !== exIdx) return e;
        const sets = e.sets.map((s, j) =>
          j === setIdx ? { ...s, done: true } : s,
        );
        return { ...e, sets };
      }),
    );
    // Auto-trigger rest timer
    setShowRest(true);
  };

  const undoSet = (exIdx, setIdx) => {
    setExercises((prev) =>
      prev.map((e, i) => {
        if (i !== exIdx) return e;
        const sets = e.sets.map((s, j) =>
          j === setIdx ? { ...s, done: false } : s,
        );
        return { ...e, sets };
      }),
    );
  };

  const deleteSet = (exIdx, setIdx) => {
    setExercises((prev) =>
      prev.map((e, i) => {
        if (i !== exIdx) return e;
        const sets = e.sets.filter((_, j) => j !== setIdx);
        return { ...e, sets };
      }),
    );
  };

  const addExercise = () => {
    const newEx = newExercise();
    setExercises((prev) => [...prev, newEx]);
    setActiveExIdx(exercises.length);
    setTimeout(() => {
      document
        .getElementById(`ex-${exercises.length}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const deleteExercise = (idx) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
    setActiveExIdx((prev) => Math.max(0, prev > idx ? prev - 1 : prev));
  };

  // ── Stats ──────────────────────────────────────────────────────────────
  const totalSets = exercises.reduce(
    (a, e) => a + e.sets.filter((s) => s.done).length,
    0,
  );
  const totalVol = exercises.reduce(
    (a, e) =>
      a +
      e.sets
        .filter((s) => s.done)
        .reduce(
          (b, s) => b + (Number(s.weight) || 0) * (Number(s.reps) || 0),
          0,
        ),
    0,
  );

  // ── Finish & save ──────────────────────────────────────────────────────
  const handleFinish = async () => {
    const validExercises = exercises
      .filter(
        (e) =>
          e.name.trim() && e.sets.some((s) => s.done && s.weight && s.reps),
      )
      .map((e) => ({
        name: e.name,
        targetMuscle: e.targetMuscle,
        sets: e.sets
          .filter((s) => s.done && s.weight && s.reps)
          .map((s) => ({ weight: s.weight, reps: s.reps })),
      }));

    if (!validExercises.length) {
      alert("Complete at least one set first!");
      return;
    }
    setSaving(true);

    try {
      const res = await fetch(`${apiBase}/api/workout/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          workoutName: workoutName || "Workout",
          exercises: validExercises,
        }),
      });
      if (res.ok) {
        confetti({
          particleCount: 120,
          spread: 65,
          origin: { y: 0.6 },
          colors: ["#ff4500", "#ffffff", "#ff6030"],
        });
        onFinish?.();
      } else {
        alert("Save failed. Try again.");
      }
    } catch {
      alert("Network error.");
    }
    setSaving(false);
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* ── TOP BAR ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(6,6,8,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          padding: "12px 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Discard */}
          <button
            onClick={() => setShowDiscard(true)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-3)",
              cursor: "pointer",
              padding: "6px",
              lineHeight: 1,
            }}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              width="16"
              height="16"
            >
              <path d="M2 2l12 12M14 2L2 14" strokeLinecap="round" />
            </svg>
          </button>

          {/* Workout name */}
          <input
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Workout Name…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "var(--text-1)",
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "1.1rem",
              letterSpacing: "0.5px",
              outline: "none",
            }}
          />

          {/* Elapsed */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "5px 10px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--green)",
                boxShadow: "0 0 6px var(--green)",
                animation: "pulse-dot 1.4s ease infinite",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "var(--text-1)",
              }}
            >
              {fmt(elapsed)}
            </span>
          </div>
        </div>

        {/* Live stats strip */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "10px",
            paddingTop: "10px",
            borderTop: "1px solid var(--border)",
          }}
        >
          {[
            { label: "Sets Done", value: totalSets },
            {
              label: "Volume",
              value: totalVol > 0 ? `${totalVol.toLocaleString()}kg` : "—",
            },
            {
              label: "Exercises",
              value: exercises.filter((e) => e.name).length,
            },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "1.1rem",
                  color: "var(--text-1)",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div className="label" style={{ marginTop: "2px" }}>
                {s.label}
              </div>
            </div>
          ))}
          {/* Rest timer trigger */}
          <button
            onClick={() => setShowRest(true)}
            style={{
              flex: 1,
              background: "var(--surface-2)",
              border: "1px solid var(--ember-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--ember)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.08em",
              cursor: "pointer",
              padding: "4px 8px",
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            ⏱ Rest
          </button>
        </div>
      </div>

      {/* ── EXERCISE CARDS ── */}
      <div
        style={{
          flex: 1,
          padding: "14px 14px 140px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <AnimatePresence>
          {exercises.map((ex, idx) => (
            <div key={ex.id} id={`ex-${idx}`}>
              <ExerciseCard
                ex={ex}
                exIdx={idx}
                isActive={activeExIdx === idx}
                lastSets={null}
                suggestions={suggestions[idx]}
                onFocus={() => setActiveExIdx(idx)}
                onUpdate={(field, ...args) =>
                  updateExercise(idx, field, ...args)
                }
                onAddSet={() => addSet(idx)}
                onCompleteSet={(si) => completeSet(idx, si)}
                onDeleteSet={(si) => deleteSet(idx, si)}
                onDeleteExercise={() => deleteExercise(idx)}
              />
            </div>
          ))}
        </AnimatePresence>

        {/* Add exercise */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={addExercise}
          style={{
            width: "100%",
            padding: "14px",
            background: "transparent",
            border: "1px dashed var(--border-md)",
            borderRadius: "var(--radius-lg)",
            color: "var(--text-3)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--ember-border)";
            e.currentTarget.style.color = "var(--ember)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-md)";
            e.currentTarget.style.color = "var(--text-3)";
          }}
        >
          + Add Exercise
        </motion.button>
      </div>

      {/* ── FINISH BAR ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "480px",
          padding: "12px 14px",
          background: "rgba(6,6,8,0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border)",
          zIndex: 100,
        }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleFinish}
          disabled={saving}
          style={{
            width: "100%",
            padding: "16px",
            background: "var(--ember)",
            border: "none",
            borderRadius: "var(--radius-lg)",
            color: "white",
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "1.1rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "0 0 28px var(--ember-glow)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "background 0.2s",
          }}
        >
          {saving ? (
            <>
              <span
                style={{
                  width: "18px",
                  height: "18px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                  display: "inline-block",
                }}
              />{" "}
              Saving…
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                width="16"
                height="16"
              >
                <path
                  d="M3 9l4 4 8-8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>{" "}
              Finish Workout — {fmt(elapsed)}
            </>
          )}
        </motion.button>
      </div>

      {/* ── REST TIMER OVERLAY ── */}
      <AnimatePresence>
        {showRest && <RestOverlay onDismiss={() => setShowRest(false)} />}
      </AnimatePresence>

      {/* ── DISCARD CONFIRM ── */}
      <AnimatePresence>
        {showDiscard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              background: "rgba(6,6,8,0.88)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              padding: "0 14px 40px",
            }}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              style={{
                width: "100%",
                maxWidth: "480px",
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-xl)",
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "1.3rem",
                  color: "var(--text-1)",
                  letterSpacing: "0.5px",
                }}
              >
                Discard workout?
              </div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  color: "var(--text-3)",
                  lineHeight: 1.6,
                }}
              >
                {totalSets > 0
                  ? `You've logged ${totalSets} sets. This progress will be lost.`
                  : "No sets logged yet."}
              </p>
              <button
                onClick={onDiscard}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: "#ef4444",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  color: "white",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Yes, Discard
              </button>
              <button
                onClick={() => setShowDiscard(false)}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: "transparent",
                  border: "1px solid var(--border-md)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-2)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Keep Going
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}
