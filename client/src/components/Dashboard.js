"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Stagger animation helper ──────────────────────────────────────────────
const stagger = (i, base = 0.06) => ({
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { delay: i * base, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
});

// ── Animated counter ──────────────────────────────────────────────────────
function CountUp({ to, duration = 1.2, suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!to) return;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to]);
  return (
    <>
      {val.toLocaleString()}
      {suffix}
    </>
  );
}

// ── Greeting ──────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return { text: "Still up?", sub: "Champions don't sleep." };
  if (h < 12) return { text: "Morning,", sub: "Start strong. Set the tone." };
  if (h < 17)
    return { text: "Afternoon,", sub: "Midday grind hits different." };
  if (h < 21) return { text: "Evening,", sub: "End the day right." };
  return { text: "Late night,", sub: "The grind never stops." };
}

// ── Motivational quotes ───────────────────────────────────────────────────
const QUOTES = [
  "The iron never lies to you.",
  "Suffer the pain of discipline or regret.",
  "Every rep is a deposit in your future self.",
  "Pain is temporary. Quitting lasts forever.",
  "The only bad workout is the one that didn't happen.",
  "Show up. Do the work. Go home.",
  "Your body can do it. Convince your mind.",
];

// ── Weekday grid ──────────────────────────────────────────────────────────
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

// ── Today's suggested split ───────────────────────────────────────────────
const SPLIT_SUGGESTIONS = {
  1: { name: "Push Day", muscles: ["Chest", "Shoulders", "Arms"], emoji: "💪" },
  2: { name: "Pull Day", muscles: ["Back", "Arms"], emoji: "🏋️" },
  3: { name: "Leg Day", muscles: ["Legs", "Core"], emoji: "🦵" },
  4: { name: "Push Day", muscles: ["Chest", "Shoulders", "Arms"], emoji: "💪" },
  5: { name: "Pull Day", muscles: ["Back", "Arms"], emoji: "🏋️" },
  6: { name: "Full Body", muscles: ["Chest", "Back", "Legs"], emoji: "⚡" },
  0: { name: "Active Rest", muscles: ["Cardio", "Core"], emoji: "🧘" },
};

export default function Dashboard({
  apiBase,
  userId,
  userName,
  onStartWorkout,
  onNavigate,
}) {
  const [history, setHistory] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  const greeting = getGreeting();
  const today = new Date();
  const todaySplit = SPLIT_SUGGESTIONS[today.getDay()];
  const quote = QUOTES[today.getDate() % QUOTES.length];

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      fetch(`${apiBase}/api/workout/history/${userId}`).then((r) =>
        r.ok ? r.json() : [],
      ),
      fetch(`${apiBase}/api/checkin/history/${userId}`).then((r) =>
        r.ok ? r.json() : [],
      ),
    ])
      .then(([hist, cin]) => {
        setHistory(hist);
        setCheckins(cin);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [apiBase, userId]);

  // ── Computed stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!history.length)
      return {
        totalWorkouts: 0,
        totalVolume: 0,
        streak: 0,
        weekWorkouts: 0,
        bestLift: null,
      };

    // Total volume
    let totalVolume = 0;
    let bestLift = { weight: 0, name: "" };
    history.forEach((w) =>
      w.exercises?.forEach((ex) =>
        ex.sets?.forEach((s) => {
          const wt = Number(s.weight) || 0;
          const rp = Number(s.reps) || 0;
          totalVolume += wt * rp;
          if (wt > bestLift.weight) bestLift = { weight: wt, name: ex.name };
        }),
      ),
    );

    // Streak
    const uniqueDates = [
      ...new Set(history.map((w) => new Date(w.date).toDateString())),
    ]
      .map((d) => new Date(d))
      .sort((a, b) => b - a);
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const last = uniqueDates[0] ? new Date(uniqueDates[0]) : null;
    if (last) last.setHours(0, 0, 0, 0);
    const diffDays = last ? Math.round((todayMidnight - last) / 86400000) : 99;
    let streak = 0;
    if (diffDays <= 1) {
      streak = 1;
      for (let i = 0; i < uniqueDates.length - 1; i++) {
        const d = Math.round((uniqueDates[i] - uniqueDates[i + 1]) / 86400000);
        if (d === 1) streak++;
        else break;
      }
    }

    // This week
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekWorkouts = history.filter(
      (w) => new Date(w.date) >= weekStart,
    ).length;

    // Last workout
    const last7 = history.slice(0, 7);

    return {
      totalWorkouts: history.length,
      totalVolume,
      streak,
      weekWorkouts,
      bestLift: bestLift.weight > 0 ? bestLift : null,
      last7,
    };
  }, [history]);

  // ── Last workout summary ──────────────────────────────────────────────
  const lastWorkout = history[0] || null;
  const lastWeight = checkins[0]?.currentWeight || null;

  // ── Week heatmap (last 7 days) ────────────────────────────────────────
  const weekDots = useMemo(() => {
    const dots = [];
    const workoutDates = new Set(
      history.map((w) => new Date(w.date).toDateString()),
    );
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dots.push({
        label: WEEKDAYS[(d.getDay() + 6) % 7],
        done: workoutDates.has(d.toDateString()),
        isToday: i === 0,
      });
    }
    return dots;
  }, [history]);

  const todayDone = weekDots[6]?.done;

  if (loading)
    return (
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {[120, 80, 160, 100].map((h, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: h, borderRadius: "var(--radius-lg)" }}
          />
        ))}
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        paddingBottom: "8px",
      }}
    >
      {/* ── HERO GREETING ──────────────────────────────────────────────── */}
      <motion.div
        {...stagger(0)}
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--radius-xl)",
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          padding: "24px 22px 22px",
        }}
      >
        {/* Diagonal ember accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "180px",
            height: "180px",
            background:
              "radial-gradient(circle at top right, rgba(255,69,0,0.14) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, var(--ember), transparent 60%)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                color: "var(--text-3)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              {today.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontStyle: "italic",
                fontSize: "2.2rem",
                color: "var(--text-1)",
                lineHeight: 1,
                letterSpacing: "0.5px",
              }}
            >
              {greeting.text}
              <br />
              <span style={{ color: "var(--ember)" }}>
                {userName?.split(" ")[0] || "Warrior"}.
              </span>
            </h1>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--text-3)",
                marginTop: "8px",
                letterSpacing: "0.06em",
              }}
            >
              {greeting.sub}
            </p>
          </div>

          {/* Streak badge */}
          {stats.streak > 0 && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "var(--ember-dim)",
                border: "1px solid var(--ember-border)",
                borderRadius: "var(--radius-lg)",
                padding: "10px 14px",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>
                {stats.streak >= 7 ? "⚡" : "🔥"}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "1.6rem",
                  color: "var(--ember)",
                  lineHeight: 1,
                  marginTop: "2px",
                }}
              >
                {stats.streak}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.52rem",
                  color: "var(--ember)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  opacity: 0.8,
                }}
              >
                streak
              </span>
            </motion.div>
          )}
        </div>

        {/* Week heatmap dots */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            marginTop: "20px",
            alignItems: "center",
          }}
        >
          {weekDots.map((dot, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                style={{
                  width: "100%",
                  height: "28px",
                  borderRadius: "6px",
                  background: dot.done
                    ? "var(--ember)"
                    : dot.isToday
                      ? "var(--surface-3)"
                      : "var(--surface-2)",
                  border: dot.isToday
                    ? "1px solid var(--ember-border)"
                    : "1px solid transparent",
                  boxShadow: dot.done ? "0 0 10px rgba(255,69,0,0.3)" : "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {dot.done && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.15), transparent)",
                      borderRadius: "6px",
                    }}
                  />
                )}
              </motion.div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.52rem",
                  color: dot.isToday ? "var(--ember)" : "var(--text-4)",
                  letterSpacing: "0.05em",
                }}
              >
                {dot.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── TODAY'S MISSION ────────────────────────────────────────────── */}
      <motion.div {...stagger(1)}>
        {!todayDone ? (
          <div
            style={{
              borderRadius: "var(--radius-xl)",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "18px 20px 14px" }}>
              <p className="section-title" style={{ marginBottom: "12px" }}>
                Today's Mission
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    background: "var(--ember-dim)",
                    border: "1px solid var(--ember-border)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    flexShrink: 0,
                  }}
                >
                  {todaySplit.emoji}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontSize: "1.3rem",
                      color: "var(--text-1)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {todaySplit.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      color: "var(--text-3)",
                      marginTop: "2px",
                    }}
                  >
                    {todaySplit.muscles.join(" · ")}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => onStartWorkout && onStartWorkout(todaySplit.name)}
              style={{
                width: "100%",
                padding: "15px",
                background: "var(--ember)",
                border: "none",
                color: "white",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.05rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--ember-bright)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--ember)")
              }
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="16"
                height="16"
              >
                <path
                  d="M5 10h10M12 6l4 4-4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Start Today's Session
            </button>
          </div>
        ) : (
          <div
            style={{
              borderRadius: "var(--radius-xl)",
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, var(--surface-1) 60%)",
              border: "1px solid rgba(34,197,94,0.25)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                flexShrink: 0,
              }}
            >
              ✅
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "1.1rem",
                  color: "var(--green)",
                  letterSpacing: "0.5px",
                }}
              >
                Today's done.
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  color: "var(--text-3)",
                  marginTop: "2px",
                }}
              >
                Rest, eat, grow. See you tomorrow.
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── STATS ROW ─────────────────────────────────────────────────── */}
      <motion.div
        {...stagger(2)}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "8px",
        }}
      >
        {[
          {
            label: "Sessions",
            value: stats.totalWorkouts,
            suffix: "",
            color: "var(--ember)",
          },
          {
            label: "This Week",
            value: stats.weekWorkouts,
            suffix: "d",
            color: "var(--blue)",
          },
          {
            label: "Tons Lifted",
            value: Math.round(stats.totalVolume / 1000),
            suffix: "k",
            color: "var(--green)",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.07 }}
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "14px 10px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "15%",
                right: "15%",
                height: "2px",
                background: s.color,
                opacity: 0.5,
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "1.8rem",
                color: s.color,
                lineHeight: 1,
              }}
            >
              <CountUp to={s.value} />
              {s.suffix}
            </div>
            <div className="label" style={{ marginTop: "4px" }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── LAST WORKOUT RECAP ────────────────────────────────────────── */}
      {lastWorkout && (
        <motion.div {...stagger(3)}>
          <div
            style={{
              borderRadius: "var(--radius-xl)",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 18px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <p className="section-title">Last Session</p>
              <button
                onClick={() => onNavigate?.("workout")}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  color: "var(--ember)",
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                }}
              >
                View All →
              </button>
            </div>
            <div style={{ padding: "14px 18px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: "var(--text-1)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {lastWorkout.workoutName}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color: "var(--text-3)",
                      marginTop: "2px",
                    }}
                  >
                    {new Date(lastWorkout.date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontSize: "1.1rem",
                      color: "var(--text-1)",
                    }}
                  >
                    {lastWorkout.exercises?.length || 0}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        color: "var(--text-3)",
                        fontWeight: 400,
                        marginLeft: "3px",
                      }}
                    >
                      exercises
                    </span>
                  </div>
                </div>
              </div>
              {/* Exercise pills */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {lastWorkout.exercises?.slice(0, 5).map((ex, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color: "var(--text-2)",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      padding: "3px 8px",
                    }}
                  >
                    {ex.name}
                  </span>
                ))}
                {(lastWorkout.exercises?.length || 0) > 5 && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color: "var(--text-3)",
                      padding: "3px 4px",
                    }}
                  >
                    +{lastWorkout.exercises.length - 5}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── BODY WEIGHT TREND ─────────────────────────────────────────── */}
      {checkins.length >= 2 && (
        <motion.div {...stagger(4)}>
          <div
            style={{
              borderRadius: "var(--radius-xl)",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <p className="section-title">Body Weight</p>
              <button
                onClick={() => onNavigate?.("checkin")}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  color: "var(--ember)",
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                }}
              >
                Check In →
              </button>
            </div>
            {/* Mini sparkline */}
            {(() => {
              const pts = [...checkins]
                .reverse()
                .slice(-8)
                .map((c) => c.currentWeight);
              const min = Math.min(...pts) - 1;
              const max = Math.max(...pts) + 1;
              const norm = pts.map((p) => 1 - (p - min) / (max - min));
              const w = 100,
                h = 40;
              const pointsStr = norm
                .map((y, i) => `${(i / (pts.length - 1)) * w},${y * h}`)
                .join(" ");
              const change = pts[pts.length - 1] - pts[0];
              const isDown = change < 0;
              return (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <div style={{ flex: 1 }}>
                    <svg
                      viewBox={`0 0 ${w} ${h}`}
                      style={{
                        width: "100%",
                        height: "44px",
                        overflow: "visible",
                      }}
                    >
                      <polyline
                        points={pointsStr}
                        fill="none"
                        stroke="var(--blue)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {norm.map((y, i) => (
                        <circle
                          key={i}
                          cx={(i / (pts.length - 1)) * w}
                          cy={y * h}
                          r="2.5"
                          fill={
                            i === pts.length - 1
                              ? "var(--blue)"
                              : "var(--surface-2)"
                          }
                          stroke="var(--blue)"
                          strokeWidth="1.5"
                        />
                      ))}
                    </svg>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 900,
                        fontSize: "1.8rem",
                        color: "var(--text-1)",
                        lineHeight: 1,
                      }}
                    >
                      {pts[pts.length - 1]}
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.7rem",
                          color: "var(--text-3)",
                          fontWeight: 400,
                          marginLeft: "3px",
                        }}
                      >
                        kg
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        color: isDown ? "var(--green)" : "var(--ember)",
                        marginTop: "2px",
                      }}
                    >
                      {isDown ? "▼" : "▲"} {Math.abs(change).toFixed(1)} kg
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.div>
      )}

      {/* ── DAILY QUOTE ───────────────────────────────────────────────── */}
      <motion.div {...stagger(5)}>
        <div
          style={{
            borderRadius: "var(--radius-lg)",
            padding: "16px 20px",
            background: "var(--surface-0)",
            border: "1px solid var(--border)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "3px",
              height: "100%",
              background: "var(--ember)",
              opacity: 0.6,
            }}
          />
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "1.05rem",
              fontWeight: 600,
              color: "var(--text-2)",
              lineHeight: 1.5,
              paddingLeft: "10px",
              letterSpacing: "0.3px",
            }}
          >
            "{quote}"
          </p>
        </div>
      </motion.div>

      {/* ── QUICK ACTIONS ─────────────────────────────────────────────── */}
      <motion.div
        {...stagger(6)}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}
      >
        {[
          {
            label: "Log Workout",
            icon: "🏋️",
            tab: "workout",
            color: "var(--ember)",
          },
          {
            label: "Check In",
            icon: "⚖️",
            tab: "checkin",
            color: "var(--blue)",
          },
        ].map((a, i) => (
          <button
            key={a.tab}
            onClick={() => onNavigate?.(a.tab)}
            style={{
              padding: "16px",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "8px",
              transition: "border-color 0.2s, background 0.2s",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = a.color.includes("ember")
                ? "var(--ember-border)"
                : "rgba(59,130,246,0.3)";
              e.currentTarget.style.background = "var(--surface-2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "var(--surface-1)";
            }}
          >
            <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{a.icon}</span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "var(--text-1)",
                letterSpacing: "0.5px",
              }}
            >
              {a.label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* ── BEST LIFT CALLOUT ─────────────────────────────────────────── */}
      {stats.bestLift && (
        <motion.div {...stagger(7)}>
          <div
            style={{
              borderRadius: "var(--radius-lg)",
              padding: "14px 18px",
              background:
                "linear-gradient(135deg, rgba(245,166,35,0.08) 0%, var(--surface-1) 60%)",
              border: "1px solid rgba(245,166,35,0.25)",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>👑</span>
            <div style={{ flex: 1 }}>
              <div className="label" style={{ marginBottom: "2px" }}>
                All-time Top Lift
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "var(--text-1)",
                  letterSpacing: "0.5px",
                }}
              >
                {stats.bestLift.name}
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "1.8rem",
                color: "var(--gold)",
                lineHeight: 1,
              }}
            >
              {stats.bestLift.weight}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  color: "var(--text-3)",
                  fontWeight: 400,
                }}
              >
                kg
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
