"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PLATES = [
  { weight: 25, color: "#ef4444", h: "80px", label: "25" },
  { weight: 20, color: "#3b82f6", h: "76px", label: "20" },
  { weight: 15, color: "#facc15", h: "68px", label: "15" },
  { weight: 10, color: "#22c55e", h: "58px", label: "10" },
  { weight: 5, color: "#e2e8f0", h: "44px", label: "5" },
  {
    weight: 2.5,
    color: "#1e293b",
    h: "36px",
    label: "2.5",
    border: "1px solid #475569",
  },
  {
    weight: 1.25,
    color: "#374151",
    h: "30px",
    label: "1.25",
    border: "1px solid #6b7280",
  },
];

const calculatePlates = (weight) => {
  const bar = 20;
  if (!weight || weight <= bar) return [];
  let remaining = (weight - bar) / 2;
  const result = [];
  PLATES.forEach((p) => {
    while (remaining >= p.weight - 0.001) {
      result.push(p);
      remaining = Math.round((remaining - p.weight) * 1000) / 1000;
    }
  });
  return result;
};

export default function PlateCalculator() {
  const [targetWeight, setTargetWeight] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const plates = calculatePlates(parseFloat(targetWeight));
  const totalWeight =
    plates.length > 0
      ? 20 + plates.reduce((sum, p) => sum + p.weight, 0) * 2
      : 20;
  const isExact = Math.abs(totalWeight - parseFloat(targetWeight)) < 0.01;

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "var(--surface-1)",
      }}
    >
      {/* Header toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "14px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          background: "transparent",
          border: "none",
          color: "var(--text-1)",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--surface-2)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              width: "30px",
              height: "30px",
              background: "var(--surface-3)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
            }}
          >
            🧮
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: "0.5px",
            }}
          >
            Plate Calculator
          </span>
        </div>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          width="14"
          height="14"
          style={{
            color: "var(--text-3)",
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{ padding: "16px", borderTop: "1px solid var(--border)" }}
            >
              {/* Input row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                <label className="label" style={{ whiteSpace: "nowrap" }}>
                  Target
                </label>
                <div
                  style={{ position: "relative", flex: 1, maxWidth: "160px" }}
                >
                  <input
                    type="number"
                    placeholder="100"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
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
                {parseFloat(targetWeight) > 0 && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      color: isExact ? "var(--green)" : "var(--gold)",
                    }}
                  >
                    {isExact ? `= ${totalWeight}kg ✓` : `≈ ${totalWeight}kg`}
                  </span>
                )}
              </div>

              {/* Visual barbell */}
              <div
                style={{
                  position: "relative",
                  height: "100px",
                  background: "var(--surface-0)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  marginBottom: "16px",
                }}
              >
                {/* Bar */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    right: 0,
                    height: "10px",
                    background: "linear-gradient(180deg, #888, #555, #888)",
                    transform: "translateY(-50%)",
                    zIndex: 0,
                  }}
                />
                {/* Collar */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    width: "24px",
                    height: "20px",
                    background: "linear-gradient(90deg, #aaa, #777)",
                    transform: "translateY(-50%)",
                    zIndex: 1,
                    borderRadius: "0 3px 3px 0",
                  }}
                />

                {/* Plates */}
                <div
                  style={{
                    display: "flex",
                    gap: "2px",
                    marginLeft: "28px",
                    zIndex: 2,
                    alignItems: "center",
                  }}
                >
                  <AnimatePresence>
                    {plates.length > 0 ? (
                      plates.map((p, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: -12, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          style={{
                            width: "14px",
                            height: p.h,
                            background: p.color,
                            border: p.border || "none",
                            borderRadius: "2px",
                            flexShrink: 0,
                            boxShadow: "1px 0 3px rgba(0,0,0,0.4)",
                            cursor: "default",
                          }}
                          title={`${p.label}kg`}
                        />
                      ))
                    ) : (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          color: "var(--text-3)",
                        }}
                      >
                        Empty bar — 20kg
                      </span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Plate summary chips */}
              {plates.length > 0 && (
                <div>
                  <div
                    className="section-title"
                    style={{ marginBottom: "8px" }}
                  >
                    Per Side
                  </div>
                  <div
                    style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}
                  >
                    {Object.entries(
                      plates.reduce((acc, p) => {
                        acc[p.weight] = {
                          count: (acc[p.weight]?.count || 0) + 1,
                          color: p.color,
                        };
                        return acc;
                      }, {}),
                    )
                      .sort((a, b) => b[0] - a[0])
                      .map(([weight, { count, color }]) => (
                        <div
                          key={weight}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "5px 10px",
                            background: "var(--surface-2)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-sm)",
                          }}
                        >
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "2px",
                              background: color,
                              display: "block",
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontFamily: "var(--font-display)",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                              color: "var(--text-1)",
                            }}
                          >
                            {weight}kg
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.65rem",
                              color: "var(--text-3)",
                            }}
                          >
                            ×{count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
