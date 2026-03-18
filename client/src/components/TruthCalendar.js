"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function TruthCalendar({ history }) {
  const { weeks, monthLabels, totalWorkouts, longestStreak } = useMemo(() => {
    const today = new Date();
    const workoutSet = new Set(
      history.map((w) => new Date(w.date).toISOString().split("T")[0]),
    );

    // Build 91 days (13 full weeks), starting from the most recent Sunday
    const startOffset = today.getDay(); // days since last Sunday
    const totalDays = 91;
    const days = [];

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        hasWorkout: workoutSet.has(dateStr),
        dayOfWeek: d.getDay(),
        month: d.getMonth(),
        day: d.getDate(),
      });
    }

    // Group into weeks (columns of 7)
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    // Month labels: find where each month starts (by week col)
    const monthLabels = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const firstDay = week.find((d) => d);
      if (firstDay && firstDay.month !== lastMonth) {
        monthLabels.push({ col: wi, label: MONTHS[firstDay.month] });
        lastMonth = firstDay.month;
      }
    });

    const totalWorkouts = days.filter((d) => d.hasWorkout).length;

    // Longest streak
    let longest = 0,
      cur = 0;
    days.forEach((d) => {
      if (d.hasWorkout) {
        cur++;
        longest = Math.max(longest, cur);
      } else cur = 0;
    });

    return { weeks, monthLabels, totalWorkouts, longestStreak: longest };
  }, [history]);

  const getCellColor = (hasWorkout) => {
    if (!hasWorkout) return "var(--surface-3)";
    return "var(--green)";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Mini stats */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
        <div
          style={{
            flex: 1,
            background: "var(--surface-2)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 10px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "1.4rem",
              color: "var(--green)",
              lineHeight: 1,
            }}
          >
            {totalWorkouts}
          </div>
          <div className="label" style={{ marginTop: "2px" }}>
            Sessions / 90d
          </div>
        </div>
        <div
          style={{
            flex: 1,
            background: "var(--surface-2)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 10px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "1.4rem",
              color: "var(--ember)",
              lineHeight: 1,
            }}
          >
            {Math.round((totalWorkouts / 90) * 100)}%
          </div>
          <div className="label" style={{ marginTop: "2px" }}>
            Consistency
          </div>
        </div>
        <div
          style={{
            flex: 1,
            background: "var(--surface-2)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 10px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "1.4rem",
              color: "var(--gold)",
              lineHeight: 1,
            }}
          >
            {longestStreak}
          </div>
          <div className="label" style={{ marginTop: "2px" }}>
            Best Streak
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ overflowX: "auto" }} className="hide-scrollbar">
        <div style={{ display: "inline-block", minWidth: "100%" }}>
          {/* Month labels */}
          <div
            style={{
              display: "flex",
              marginLeft: "22px",
              marginBottom: "4px",
              gap: "3px",
            }}
          >
            {weeks.map((_, wi) => {
              const label = monthLabels.find((m) => m.col === wi);
              return (
                <div key={wi} style={{ width: "13px", flexShrink: 0 }}>
                  {label && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.55rem",
                        color: "var(--text-3)",
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: "2px" }}>
            {/* Day labels */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                marginRight: "4px",
                width: "14px",
              }}
            >
              {DAYS.map((d, i) => (
                <div
                  key={i}
                  style={{
                    height: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.5rem",
                    color: "var(--text-4)",
                    lineHeight: 1,
                  }}
                >
                  {i % 2 === 1 ? d : ""}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div
                key={wi}
                style={{ display: "flex", flexDirection: "column", gap: "3px" }}
              >
                {week.map((day, di) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (wi * 7 + di) * 0.002 }}
                    title={`${day.date} · ${day.hasWorkout ? "Trained 💪" : "Rest 😴"}`}
                    style={{
                      width: "13px",
                      height: "13px",
                      borderRadius: "3px",
                      background: getCellColor(day.hasWorkout),
                      boxShadow: day.hasWorkout
                        ? "0 0 5px rgba(34,197,94,0.45)"
                        : "none",
                      cursor: "default",
                      flexShrink: 0,
                      transition: "background 0.2s",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "10px",
              marginLeft: "18px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                color: "var(--text-3)",
              }}
            >
              Less
            </span>
            {[
              "var(--surface-3)",
              "rgba(34,197,94,0.3)",
              "rgba(34,197,94,0.6)",
              "var(--green)",
            ].map((c, i) => (
              <div
                key={i}
                style={{
                  width: "13px",
                  height: "13px",
                  borderRadius: "3px",
                  background: c,
                }}
              />
            ))}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                color: "var(--text-3)",
              }}
            >
              More
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
