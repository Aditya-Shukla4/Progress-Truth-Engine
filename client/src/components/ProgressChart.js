"use client";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border-md)",
        borderRadius: "var(--radius-md)",
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        minWidth: "120px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.62rem",
          color: "var(--text-3)",
          letterSpacing: "0.1em",
          marginBottom: "6px",
        }}
      >
        {label}
      </p>
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: p.color,
            }}
          >
            {p.dataKey === "weight" ? "Weight" : "Days"}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--text-1)",
              lineHeight: 1,
            }}
          >
            {p.value}
            {p.dataKey === "weight" ? "kg" : "d"}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function ProgressChart({ data }) {
  const chartData = [...data].reverse().map((item) => ({
    date: new Date(item.weekStartDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    weight: item.currentWeight,
    workouts: item.workoutDays,
  }));

  if (chartData.length < 2) {
    return (
      <div
        style={{
          padding: "28px 0",
          textAlign: "center",
          color: "var(--text-3)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
        }}
      >
        Keep logging — graph unlocks after 2 check-ins.
      </div>
    );
  }

  const firstWeight = chartData[0].weight;
  const lastWeight = chartData[chartData.length - 1].weight;
  const weightChange = (lastWeight - firstWeight).toFixed(1);
  const isDown = weightChange < 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Mini delta stats */}
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
              fontSize: "1.2rem",
              color: "var(--text-1)",
              lineHeight: 1,
            }}
          >
            {lastWeight}kg
          </div>
          <div className="label" style={{ marginTop: "2px" }}>
            Current
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
              fontSize: "1.2rem",
              color: isDown ? "var(--green)" : "var(--ember)",
              lineHeight: 1,
            }}
          >
            {weightChange > 0 ? "+" : ""}
            {weightChange}kg
          </div>
          <div className="label" style={{ marginTop: "2px" }}>
            Change
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
              fontSize: "1.2rem",
              color: "var(--blue)",
              lineHeight: 1,
            }}
          >
            {chartData.length}
          </div>
          <div className="label" style={{ marginTop: "2px" }}>
            Weeks
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <ComposedChart
            data={chartData}
            margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
          >
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff4500" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#ff6030" />
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
              yAxisId="weight"
              stroke="transparent"
              tick={{
                fill: "var(--text-3)",
                fontSize: 10,
                fontFamily: "var(--font-mono)",
              }}
              domain={["auto", "auto"]}
            />
            <YAxis
              yAxisId="workouts"
              orientation="right"
              stroke="transparent"
              tick={false}
              domain={[0, 10]}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 1 }}
            />
            <Bar
              yAxisId="workouts"
              dataKey="workouts"
              fill="rgba(59,130,246,0.15)"
              radius={[3, 3, 0, 0]}
            />
            <Line
              yAxisId="weight"
              type="monotone"
              dataKey="weight"
              stroke="url(#weightGrad)"
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
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "14px",
          justifyContent: "center",
          marginTop: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "16px",
              height: "2px",
              background: "var(--ember)",
              borderRadius: "2px",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "var(--text-3)",
            }}
          >
            Weight
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              background: "rgba(59,130,246,0.3)",
              borderRadius: "2px",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "var(--text-3)",
            }}
          >
            Workout days
          </span>
        </div>
      </div>
    </motion.div>
  );
}
