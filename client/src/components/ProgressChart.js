"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ProgressChart({ data }) {
  // Data ko reverse karna padega taaki graph Left (Old) se Right (New) jaye
  // Kyunki abhi humare paas Latest pehle hai.
  const chartData = [...data].reverse().map((item) => ({
    date: new Date(item.weekStartDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }), // e.g. "Oct 24"
    weight: item.currentWeight,
    workouts: item.workoutDays,
  }));

  if (chartData.length < 2) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "#666",
          fontSize: "0.8rem",
        }}
      >
        Not enough data for Graph yet. Keep grinding! 📉
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: 250,
        marginTop: "20px",
        padding: "10px",
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
        Weight (kg) vs Consistency
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#666" fontSize={12} tick={{ dy: 10 }} />
          <YAxis stroke="#666" fontSize={12} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ backgroundColor: "#000", border: "1px solid #333" }}
            itemStyle={{ color: "#fff" }}
          />
          {/* Weight Line (Red) */}
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />

          {/* Workouts Line (Blue - Consistency) */}
          <Line
            type="monotone"
            dataKey="workouts"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          fontSize: "0.7rem",
          marginTop: "10px",
        }}
      >
        <span style={{ color: "#ef4444" }}>● Weight</span>
        <span style={{ color: "#3b82f6" }}>-- Workouts</span>
      </div>
    </div>
  );
}
