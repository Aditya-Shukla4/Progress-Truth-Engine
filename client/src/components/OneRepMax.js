"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function OneRepMax() {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const r = parseFloat(reps);

    if (!w || !r) return;

    // 🧮 Epley Formula: Weight * (1 + Reps/30)
    const oneRepMax = Math.round(w * (1 + r / 30));

    setResult(oneRepMax);
  };

  return (
    <div
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
        }}
      >
        🧪 1RM ESTIMATOR (EGO CHECK)
      </h3>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          style={inputStyle}
        />
      </div>

      <button onClick={calculate} style={btnStyle}>
        CALCULATE POTENTIAL
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: "15px",
            textAlign: "center",
            padding: "10px",
            borderTop: "1px dashed #333",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "#666" }}>
            ESTIMATED 1 REP MAX
          </div>
          <div
            style={{ fontSize: "2.5rem", fontWeight: "900", color: "#ef4444" }}
          >
            {result}
            <span style={{ fontSize: "1rem" }}>kg</span>
          </div>
          <div style={{ fontSize: "0.7rem", color: "#888", marginTop: "5px" }}>
            (If you push till death 💀)
          </div>
        </motion.div>
      )}
    </div>
  );
}

const inputStyle = {
  flex: 1,
  padding: "10px",
  backgroundColor: "#222",
  border: "1px solid #444",
  color: "white",
  outline: "none",
};
const btnStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#333",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
};
