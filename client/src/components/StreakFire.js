"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";

export default function StreakFire({ history }) {
  const streak = useMemo(() => {
    if (!history || history.length === 0) return 0;

    const uniqueDates = Array.from(
      new Set(history.map((w) => new Date(w.date).toDateString())),
    );

    const sortedDates = uniqueDates
      .map((d) => new Date(d))
      .sort((a, b) => b - a);

    if (sortedDates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastWorkout = new Date(sortedDates[0]);
    lastWorkout.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      Math.abs(today - lastWorkout) / (1000 * 60 * 60 * 24),
    );
    if (diffDays > 1) return 0;

    let currentStreak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const curr = sortedDates[i];
      const prev = sortedDates[i + 1];
      if (Math.round((curr - prev) / (1000 * 60 * 60 * 24)) === 1) {
        currentStreak++;
      } else break;
    }

    return currentStreak;
  }, [history]);

  const getFlameIntensity = (s) => {
    if (s === 0)
      return {
        tier: 0,
        label: "No Streak",
        color: "var(--text-4)",
        border: "var(--border)",
        bg: "transparent",
      };
    if (s < 3)
      return {
        tier: 1,
        label: "Day Streak",
        color: "#60a5fa",
        border: "rgba(96,165,250,0.3)",
        bg: "rgba(96,165,250,0.08)",
      };
    if (s < 7)
      return {
        tier: 2,
        label: "Day Streak",
        color: "var(--ember)",
        border: "var(--ember-border)",
        bg: "var(--ember-dim)",
      };
    if (s < 14)
      return {
        tier: 3,
        label: "Day Streak",
        color: "#facc15",
        border: "rgba(250,204,21,0.35)",
        bg: "rgba(250,204,21,0.08)",
      };
    return {
      tier: 4,
      label: "Day Streak",
      color: "#c084fc",
      border: "rgba(192,132,252,0.35)",
      bg: "rgba(192,132,252,0.08)",
    };
  };

  const { tier, label, color, border, bg } = getFlameIntensity(streak);

  if (streak === 0)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          border: "1px solid var(--border)",
          padding: "4px 10px",
          borderRadius: "99px",
          color: "var(--text-4)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          letterSpacing: "0.08em",
        }}
      >
        <span style={{ fontSize: "0.75rem" }}>💀</span> No Streak
      </div>
    );

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        background: bg,
        border: `1px solid ${border}`,
        padding: "5px 12px",
        borderRadius: "99px",
        cursor: "default",
        boxShadow: tier >= 2 ? `0 0 14px ${color}20` : "none",
      }}
    >
      <motion.span
        animate={
          tier >= 2
            ? { scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }
            : { scale: 1 }
        }
        transition={{ duration: 1.4, repeat: Infinity }}
        style={{ fontSize: "1rem", lineHeight: 1 }}
      >
        {tier === 0
          ? "💀"
          : tier === 1
            ? "🔥"
            : tier === 2
              ? "🔥"
              : tier === 3
                ? "⚡"
                : "👑"}
      </motion.span>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          lineHeight: 1,
          gap: "1px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "1rem",
            color,
            lineHeight: 1,
          }}
        >
          {streak}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            color,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            opacity: 0.8,
          }}
        >
          {label}
        </span>
      </div>
    </motion.div>
  );
}
