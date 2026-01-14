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
} from "recharts";
import { motion } from "framer-motion";

export default function ExerciseChart({ history }) {
  const [selectedExercise, setSelectedExercise] = useState("");

  // 1. Unique Exercises nikalo
  const exerciseList = useMemo(() => {
    const names = new Set();
    history.forEach((w) => {
      w.exercises.forEach((ex) => names.add(ex.name));
    });
    return Array.from(names).sort();
  }, [history]);

  // 2. Data Prepare karo (Sirf Selected Exercise ka Max Weight)
  const chartData = useMemo(() => {
    if (!selectedExercise) return [];

    const data = [];
    // Oldest to Newest sort karo
    const sortedHistory = [...history].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    sortedHistory.forEach((workout) => {
      const exercise = workout.exercises.find(
        (ex) => ex.name === selectedExercise
      );
      if (exercise) {
        // Us din ka sabse bhaari set nikalo
        const maxWeight = Math.max(
          ...exercise.sets.map((s) => Number(s.weight) || 0)
        );

        if (maxWeight > 0) {
          data.push({
            date: new Date(workout.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }),
            weight: maxWeight,
            fullDate: new Date(workout.date).toDateString(),
          });
        }
      }
    });
    return data;
  }, [history, selectedExercise]);

  // Auto-select first exercise
  if (!selectedExercise && exerciseList.length > 0) {
    setSelectedExercise(exerciseList[0]);
  }

  if (history.length === 0) return null;

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h3
          style={{
            color: "#888",
            fontSize: "0.8rem",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          📈 STRENGTH PROGRESS
        </h3>

        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          style={{
            padding: "5px",
            backgroundColor: "#222",
            color: "white",
            border: "1px solid #444",
            fontSize: "0.8rem",
            maxWidth: "150px",
          }}
        >
          {exerciseList.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {chartData.length > 1 ? (
        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis
                dataKey="date"
                stroke="#666"
                fontSize={10}
                tickMargin={10}
              />
              <YAxis stroke="#666" fontSize={10} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "1px solid #ef4444",
                }}
                labelStyle={{ color: "#888", marginBottom: "5px" }}
                itemStyle={{ color: "#fff", fontWeight: "bold" }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, fill: "#ef4444" }}
                activeDot={{ r: 6, fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "30px",
            color: "#444",
            fontSize: "0.8rem",
          }}
        >
          Select an exercise you have done at least twice to see the graph. 📉
        </div>
      )}
    </motion.div>
  );
}
