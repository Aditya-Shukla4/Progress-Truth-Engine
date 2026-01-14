"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";

export default function StreakFire({ history }) {
  // 🔥 STREAK CALCULATION ENGINE
  const streak = useMemo(() => {
    if (!history || history.length === 0) return 0;

    // 1. Saare dates nikalo aur Time hata do (Sirf YYYY-MM-DD chahiye)
    const uniqueDates = Array.from(
      new Set(history.map((w) => new Date(w.date).toDateString()))
    );

    // 2. Sort karo (Newest First)
    // Date objects mein convert karke sort karo
    const sortedDates = uniqueDates
      .map((d) => new Date(d))
      .sort((a, b) => b - a);

    if (sortedDates.length === 0) return 0;

    // 3. Check karo Streak Zinda hai kya?
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const lastWorkout = sortedDates[0];
    lastWorkout.setHours(0, 0, 0, 0);

    // Agar last workout na aaj hai, na kal hai -> Streak Toot gayi 💔
    // (Matlab gap > 1 day)
    const diffTime = Math.abs(today - lastWorkout);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Note: DiffDays 0 (Today), 1 (Yesterday). If > 1, streak is 0.
    if (diffDays > 1) return 0;

    // 4. Consecutive Days Count karo
    let currentStreak = 1;

    for (let i = 0; i < sortedDates.length - 1; i++) {
      const curr = sortedDates[i];
      const prev = sortedDates[i + 1]; // Pichla din (kyunki descending sort hai)

      const dayDiff = (curr - prev) / (1000 * 60 * 60 * 24);

      if (Math.round(dayDiff) === 1) {
        currentStreak++;
      } else {
        break; // Lagaatar nahi hai, chain toot gayi
      }
    }

    return currentStreak;
  }, [history]);

  // Agar streak 0 hai toh kuch mat dikhao (ya grey dikhao)
  if (streak === 0)
    return (
      <div
        style={{
          color: "#444",
          fontSize: "0.8rem",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          border: "1px solid #333",
          padding: "5px 10px",
          borderRadius: "20px",
        }}
      >
        <span>💀</span> NO STREAK
      </div>
    );

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        backgroundColor: "rgba(239, 68, 68, 0.1)", // Light Red BG
        border: "1px solid #ef4444",
        padding: "5px 12px",
        borderRadius: "20px",
        cursor: "default",
      }}
    >
      <motion.span
        animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ fontSize: "1.2rem" }}
      >
        🔥
      </motion.span>

      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontSize: "1rem", fontWeight: "900", color: "#ef4444" }}>
          {streak}
        </span>
        <span
          style={{
            fontSize: "0.6rem",
            color: "#ef4444",
            textTransform: "uppercase",
          }}
        >
          DAY STREAK
        </span>
      </div>
    </motion.div>
  );
}
