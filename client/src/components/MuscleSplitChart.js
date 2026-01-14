"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

export default function MuscleSplitChart({ history }) {
  // 🧮 Data Process Karo
  const muscleCounts = {};

  history.forEach((workout) => {
    workout.exercises.forEach((ex) => {
      const muscle = ex.targetMuscle || "Other";
      muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;
    });
  });

  const data = Object.keys(muscleCounts).map((muscle) => ({
    name: muscle,
    value: muscleCounts[muscle],
  }));

  // Sexy Colors for Chart
  const COLORS = [
    "#ef4444",
    "#3b82f6",
    "#22c55e",
    "#eab308",
    "#a855f7",
    "#f97316",
    "#64748b",
  ];

  if (data.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginTop: "20px",
        padding: "15px",
        backgroundColor: "#111",
        border: "1px solid #333",
      }}
    >
      <h3
        style={{
          color: "#888",
          fontSize: "0.8rem",
          marginBottom: "10px",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        🥩 MUSCLE IMBALANCE CHECK
      </h3>
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#000",
                border: "1px solid #333",
              }}
              itemStyle={{ color: "#fff" }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
