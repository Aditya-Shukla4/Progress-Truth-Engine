"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";

export default function TruthCalendar({ history }) {
  // 📅 LOGIC: Generate Last 3 Months Data
  const calendarData = useMemo(() => {
    const today = new Date();
    const days = [];

    // History ko Set mein convert karo for O(1) lookup
    // Format: "YYYY-MM-DD"
    const workoutDates = new Set(
      history.map((w) => new Date(w.date).toISOString().split("T")[0])
    );

    // Pichle 90 din generate karo
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      days.push({
        date: dateStr,
        hasWorkout: workoutDates.has(dateStr),
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
    return days;
  }, [history]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginTop: "30px",
        padding: "20px",
        backgroundColor: "#111",
        border: "1px solid #333",
        borderRadius: "10px",
      }}
    >
      <h3
        style={{
          color: "#888",
          fontSize: "0.8rem",
          textTransform: "uppercase",
          marginBottom: "15px",
          letterSpacing: "1px",
        }}
      >
        📅 CONSISTENCY MAP (Last 90 Days)
      </h3>

      {/* THE HEATMAP GRID */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {calendarData.map((day, i) => (
          <div
            key={day.date}
            title={`${day.date} - ${
              day.hasWorkout ? "CRUSHED IT 💪" : "REST 😴"
            }`}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "2px",
              backgroundColor: day.hasWorkout ? "#22c55e" : "#222", // Green or Grey
              border: day.hasWorkout ? "none" : "1px solid #333",
              boxShadow: day.hasWorkout ? "0 0 5px #22c55e" : "none",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "15px",
          marginTop: "10px",
          fontSize: "0.7rem",
          color: "#666",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              background: "#22c55e",
              borderRadius: "2px",
            }}
          ></div>{" "}
          Work
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              background: "#222",
              border: "1px solid #333",
              borderRadius: "2px",
            }}
          ></div>{" "}
          Rest
        </div>
      </div>
    </motion.div>
  );
}
