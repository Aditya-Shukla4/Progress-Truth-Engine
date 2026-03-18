"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PERCENTAGE_TABLE = [
  { pct: 100, rpe: "10", label: "1RM" },
  { pct: 95, rpe: "9", label: "2 reps" },
  { pct: 90, rpe: "8", label: "3 reps" },
  { pct: 85, rpe: "7", label: "5 reps" },
  { pct: 80, rpe: "6", label: "8 reps" },
  { pct: 75, rpe: "5", label: "10 reps" },
  { pct: 70, rpe: "4", label: "12 reps" },
];

export default function OneRepMax() {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const r = parseFloat(reps);
    if (!w || !r) return;
    setResult(Math.round(w * (1 + r / 30)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ marginTop: "12px" }}
    >
      <div className="section-header">
        <span className="section-title">1RM Estimator</span>
        <span className="badge">Epley Formula</span>
      </div>

      {/* Inputs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <label className="label">Weight</label>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              placeholder="100"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="cyber-input"
              style={{ paddingRight: "36px" }}
            />
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--text-3)",
              }}
            >
              kg
            </span>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <label className="label">Reps</label>
          <input
            type="number"
            placeholder="5"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="cyber-input"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="neon-btn"
        style={{ marginBottom: "4px" }}
      >
        Calculate 1RM
      </button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            {/* Big result */}
            <div
              style={{
                marginTop: "16px",
                padding: "20px",
                background: "var(--ember-dim)",
                border: "1px solid var(--ember-border)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-40px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "160px",
                  height: "160px",
                  background:
                    "radial-gradient(circle, rgba(255,69,0,0.15) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--text-3)",
                  marginBottom: "6px",
                }}
              >
                Estimated 1 Rep Max
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontStyle: "italic",
                  fontSize: "4rem",
                  color: "var(--ember)",
                  lineHeight: 1,
                  textShadow: "0 0 40px rgba(255,69,0,0.35)",
                }}
              >
                {result}
                <span
                  style={{
                    fontSize: "1.4rem",
                    marginLeft: "4px",
                    opacity: 0.7,
                  }}
                >
                  kg
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  color: "var(--text-3)",
                  marginTop: "8px",
                  fontStyle: "italic",
                }}
              >
                Valid for compound lifts only · Don't ego-lift accessories
              </div>
            </div>

            {/* Percentage breakdown */}
            <div style={{ marginTop: "12px" }}>
              <div className="section-title" style={{ marginBottom: "8px" }}>
                Training Zones
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                {PERCENTAGE_TABLE.map((row, i) => {
                  const kg = Math.round((result * row.pct) / 100);
                  const isMax = row.pct === 100;
                  return (
                    <motion.div
                      key={row.pct}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "7px 10px",
                        background: isMax
                          ? "var(--ember-dim)"
                          : "var(--surface-2)",
                        border: `1px solid ${isMax ? "var(--ember-border)" : "var(--border)"}`,
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          color: isMax ? "var(--ember)" : "var(--text-3)",
                          minWidth: "34px",
                        }}
                      >
                        {row.pct}%
                      </span>
                      <div
                        className="progress-track"
                        style={{ flex: 1, height: "3px" }}
                      >
                        <div
                          style={{
                            width: `${row.pct}%`,
                            height: "100%",
                            background: isMax
                              ? "var(--ember)"
                              : "var(--surface-3)",
                            borderRadius: "99px",
                            transition: "width 0.6s",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: isMax ? "var(--ember)" : "var(--text-1)",
                          minWidth: "52px",
                          textAlign: "right",
                        }}
                      >
                        {kg}{" "}
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.6rem",
                            fontWeight: 400,
                            color: "var(--text-3)",
                          }}
                        >
                          kg
                        </span>
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6rem",
                          color: "var(--text-3)",
                          minWidth: "48px",
                        }}
                      >
                        {row.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
