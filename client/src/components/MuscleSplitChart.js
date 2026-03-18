"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const MUSCLE_COLORS = {
  Chest: "#ff4500",
  Back: "#3b82f6",
  Legs: "#22c55e",
  Shoulders: "#facc15",
  Arms: "#a855f7",
  Core: "#f97316",
  Cardio: "#64748b",
  Other: "#374151",
};

const DEFAULT_COLORS = [
  "#ff4500",
  "#3b82f6",
  "#22c55e",
  "#facc15",
  "#a855f7",
  "#f97316",
  "#64748b",
  "#374151",
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border-md)",
        borderRadius: "var(--radius-md)",
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "0.95rem",
          color: "var(--text-1)",
          marginBottom: "2px",
        }}
      >
        {d.name}
      </p>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          color: "var(--text-3)",
        }}
      >
        {d.value} sets · {d.pct}%
      </p>
    </div>
  );
};

export default function MuscleSplitChart({ history }) {
  const muscleCounts = {};
  history.forEach((workout) => {
    workout.exercises.forEach((ex) => {
      const muscle = ex.targetMuscle || "Other";
      muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;
    });
  });

  const total = Object.values(muscleCounts).reduce((a, b) => a + b, 0);
  const data = Object.entries(muscleCounts)
    .map(([name, value]) => ({
      name,
      value,
      pct: Math.round((value / total) * 100),
      color:
        MUSCLE_COLORS[name] ||
        DEFAULT_COLORS[
          Object.keys(muscleCounts).indexOf(name) % DEFAULT_COLORS.length
        ],
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ marginTop: "12px" }}
    >
      <div className="section-header">
        <span className="section-title">Muscle Balance</span>
        <span className="badge">{total} total sets</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Donut */}
        <div style={{ width: 140, height: 140, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={44}
                outerRadius={62}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar breakdown */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "7px",
          }}
        >
          {data.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "3px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: d.color,
                      display: "block",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: "var(--text-2)",
                    }}
                  >
                    {d.name}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    color: "var(--text-3)",
                  }}
                >
                  {d.pct}%
                </span>
              </div>
              <div className="progress-track" style={{ height: "3px" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${d.pct}%` }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    height: "100%",
                    background: d.color,
                    borderRadius: "99px",
                    boxShadow: "none",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Imbalance warning */}
      {(() => {
        const top = data[0];
        const pushMuscles = ["Chest", "Shoulders"];
        const pullMuscles = ["Back"];
        const pushVol = data
          .filter((d) => pushMuscles.includes(d.name))
          .reduce((a, b) => a + b.value, 0);
        const pullVol = data
          .filter((d) => pullMuscles.includes(d.name))
          .reduce((a, b) => a + b.value, 0);
        const ratio = pullVol > 0 ? pushVol / pullVol : null;

        if (top.pct > 45)
          return (
            <div
              style={{
                marginTop: "14px",
                padding: "10px 12px",
                background: "rgba(250,204,21,0.08)",
                border: "1px solid rgba(250,204,21,0.25)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                gap: "8px",
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: "0.85rem" }}>⚠️</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "rgba(250,204,21,0.85)",
                  lineHeight: 1.5,
                }}
              >
                {top.name} dominates at {top.pct}% — consider balancing your
                split.
              </span>
            </div>
          );
        if (ratio !== null && ratio > 1.8)
          return (
            <div
              style={{
                marginTop: "14px",
                padding: "10px 12px",
                background: "rgba(250,204,21,0.08)",
                border: "1px solid rgba(250,204,21,0.25)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                gap: "8px",
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: "0.85rem" }}>⚠️</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "rgba(250,204,21,0.85)",
                  lineHeight: 1.5,
                }}
              >
                Push-to-pull ratio is {ratio.toFixed(1)}:1 — add more back work.
              </span>
            </div>
          );
        return null;
      })()}
    </motion.div>
  );
}
