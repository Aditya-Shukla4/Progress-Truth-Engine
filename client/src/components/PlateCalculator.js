"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PlateCalculator() {
  const [targetWeight, setTargetWeight] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // 🧮 THE MATHS LOGIC
  const calculatePlates = (weight) => {
    const barWeight = 20; // Standard Olympic Bar
    if (!weight || weight <= barWeight) return [];

    let remainingWeight = (weight - barWeight) / 2; // Per side weight
    const plates = [];

    // Standard Gym Plates (kg) & Colors
    const availablePlates = [
      { weight: 25, color: "#ef4444", height: "90px" }, // Red
      { weight: 20, color: "#3b82f6", height: "90px" }, // Blue
      { weight: 15, color: "#eab308", height: "80px" }, // Yellow
      { weight: 10, color: "#22c55e", height: "70px" }, // Green
      { weight: 5, color: "#ffffff", height: "50px" }, // White
      {
        weight: 2.5,
        color: "#000000",
        height: "40px",
        border: "1px solid #444",
      }, // Black
      {
        weight: 1.25,
        color: "#silver",
        height: "35px",
        border: "1px solid #444",
      }, // Silver
    ];

    availablePlates.forEach((p) => {
      while (remainingWeight >= p.weight) {
        plates.push(p);
        remainingWeight -= p.weight;
      }
    });

    return plates;
  };

  const calculatedPlates = calculatePlates(targetWeight);

  return (
    <div
      style={{
        marginTop: "20px",
        border: "1px solid #333",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#111",
      }}
    >
      {/* HEADER (CLICK TO OPEN) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          background: isOpen ? "#222" : "#111",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.2rem" }}>🧮</span>
          <span
            style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#ccc" }}
          >
            IRON BRAIN (Calculator)
          </span>
        </div>
        <span style={{ color: "#666" }}>{isOpen ? "🔼" : "🔽"}</span>
      </div>

      {/* CALCULATOR BODY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ padding: "20px", borderTop: "1px solid #333" }}
          >
            {/* INPUT */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <span style={{ color: "#888", fontSize: "0.9rem" }}>Target:</span>
              <input
                type="number"
                placeholder="e.g. 100"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                style={{
                  background: "#000",
                  border: "1px solid #444",
                  color: "#fff",
                  padding: "8px",
                  borderRadius: "5px",
                  width: "100px",
                  fontWeight: "bold",
                }}
              />
              <span style={{ color: "#888", fontSize: "0.9rem" }}>kg</span>
            </div>

            {/* 🏋️‍♂️ VISUAL BARBELL */}
            <div
              style={{
                position: "relative",
                height: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                background: "#0a0a0a",
                borderRadius: "8px",
                padding: "0 20px",
                overflowX: "auto",
              }}
            >
              {/* BAR SLEEVE */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "0",
                  right: "0",
                  height: "15px",
                  background: "#555",
                  zIndex: 0,
                  transform: "translateY(-50%)",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "0",
                  width: "30px",
                  height: "25px",
                  background: "#777",
                  zIndex: 1,
                  transform: "translateY(-50%)",
                  borderRight: "2px solid #333",
                }}
              ></div>

              {/* PLATES */}
              <div
                style={{
                  display: "flex",
                  gap: "2px",
                  marginLeft: "35px",
                  zIndex: 2,
                  alignItems: "center",
                }}
              >
                <AnimatePresence>
                  {calculatedPlates.length > 0 ? (
                    calculatedPlates.map((p, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        style={{
                          width: "15px",
                          height: p.height,
                          backgroundColor: p.color,
                          border: p.border || "none",
                          borderRadius: "2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title={`${p.weight}kg`}
                      />
                    ))
                  ) : (
                    <span
                      style={{
                        color: "#444",
                        fontSize: "0.8rem",
                        background: "#000",
                        padding: "5px",
                      }}
                    >
                      Empty Bar (20kg)
                    </span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* TEXT SUMMARY */}
            {calculatedPlates.length > 0 && (
              <div
                style={{
                  marginTop: "15px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {Object.entries(
                  calculatedPlates.reduce((acc, curr) => {
                    acc[curr.weight] = (acc[curr.weight] || 0) + 1;
                    return acc;
                  }, {})
                )
                  .sort((a, b) => b[0] - a[0])
                  .map(([weight, count]) => (
                    <div
                      key={weight}
                      style={{
                        fontSize: "0.8rem",
                        background: "#222",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        color: "#ccc",
                      }}
                    >
                      <span style={{ color: "#ef4444", fontWeight: "bold" }}>
                        {weight}kg
                      </span>{" "}
                      x {count}
                    </div>
                  ))}
                <span
                  style={{
                    color: "#666",
                    fontSize: "0.8rem",
                    alignSelf: "center",
                  }}
                >
                  (Per Side)
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
