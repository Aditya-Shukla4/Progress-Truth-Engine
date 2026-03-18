"use client";
import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--ember-border)",
        borderRadius: "var(--radius-md)",
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.62rem",
          color: "var(--text-3)",
          marginBottom: "4px",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "1.3rem",
          color: "var(--ember)",
          lineHeight: 1,
        }}
      >
        {payload[0].value}{" "}
        <span
          style={{
            fontSize: "0.7rem",
            fontFamily: "var(--font-mono)",
            fontWeight: 400,
          }}
        >
          kg
        </span>
      </p>
    </div>
  );
};

export default function ExerciseChart({ history }) {
  const [selectedExercise, setSelectedExercise] = useState("");

  const exerciseList = useMemo(() => {
    const names = new Set();
    history.forEach((w) => w.exercises.forEach((ex) => names.add(ex.name)));
    return Array.from(names).sort();
  }, [history]);

  const chartData = useMemo(() => {
    if (!selectedExercise) return [];
    const sorted = [...history].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
    return sorted.reduce((acc, workout) => {
      const ex = workout.exercises.find((e) => e.name === selectedExercise);
      if (ex) {
        const maxWeight = Math.max(
          ...ex.sets.map((s) => Number(s.weight) || 0),
        );
        if (maxWeight > 0)
          acc.push({
            date: new Date(workout.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }),
            weight: maxWeight,
          });
      }
      return acc;
    }, []);
  }, [history, selectedExercise]);

  if (!selectedExercise && exerciseList.length > 0)
    setSelectedExercise(exerciseList[0]);
  if (history.length === 0) return null;

  const maxWeight = chartData.length
    ? Math.max(...chartData.map((d) => d.weight))
    : 0;
  const minWeight = chartData.length
    ? Math.min(...chartData.map((d) => d.weight))
    : 0;
  const gain =
    chartData.length > 1
      ? chartData[chartData.length - 1].weight - chartData[0].weight
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ marginTop: "12px" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <span className="section-title">Strength Progress</span>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="cyber-input"
          style={{
            width: "auto",
            maxWidth: "160px",
            padding: "6px 10px",
            fontSize: "0.78rem",
          }}
        >
          {exerciseList.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Quick stats */}
      {chartData.length > 1 && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
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
                fontSize: "1.3rem",
                color: "var(--text-1)",
                lineHeight: 1,
              }}
            >
              {maxWeight}
            </div>
            <div className="label" style={{ marginTop: "2px" }}>
              Peak (kg)
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
                fontSize: "1.3rem",
                color: gain >= 0 ? "var(--green)" : "#ef4444",
                lineHeight: 1,
              }}
            >
              {gain >= 0 ? "+" : ""}
              {gain}
            </div>
            <div className="label" style={{ marginTop: "2px" }}>
              Total Gain
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
                fontSize: "1.3rem",
                color: "var(--text-1)",
                lineHeight: 1,
              }}
            >
              {chartData.length}
            </div>
            <div className="label" style={{ marginTop: "2px" }}>
              Sessions
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 ? (
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="emberGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff4500" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#ff6030" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="transparent"
                tick={{
                  fill: "var(--text-3)",
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                }}
                tickMargin={8}
              />
              <YAxis
                stroke="transparent"
                tick={{
                  fill: "var(--text-3)",
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                }}
                domain={["auto", "auto"]}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "rgba(255,69,0,0.2)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="url(#emberGrad)"
                strokeWidth={2.5}
                dot={{
                  r: 3.5,
                  fill: "var(--ember)",
                  stroke: "var(--bg)",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: "#fff",
                  stroke: "var(--ember)",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            color: "var(--text-3)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
          }}
        >
          Log this exercise at least twice to see the trend.
        </div>
      )}
    </motion.div>
  );
}
