"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RestTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      // 🚨 TIME UP LOGIC
      setIsActive(false);

      // 1. Phone Vibrate karega (Android mostly)
      if (navigator.vibrate) navigator.vibrate([500, 200, 500]);

      // 2. Play Audio (Optional - Browser blocks auto-audio usually, so alert is safer)
      // const audio = new Audio('/beep.mp3'); audio.play();

      alert("⏰ TIME UP! LIGHTWEIGHT BABY! 💪");
    }

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const startTimer = (time) => {
    setSeconds(time);
    setIsActive(true);
  };

  const stopTimer = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "15px",
        backgroundColor: isActive ? "#1a1a1a" : "#111",
        border: isActive ? "1px solid #ef4444" : "1px solid #333",
        borderRadius: "8px",
        textAlign: "center",
        transition: "all 0.3s",
      }}
    >
      <h3
        style={{
          color: isActive ? "#ef4444" : "#666",
          fontSize: "0.8rem",
          marginBottom: "10px",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {isActive ? "🔥 RECOVERING..." : "⏱️ REST TIMER"}
      </h3>

      {/* BIG COUNTDOWN DISPLAY */}
      <div
        style={{
          fontSize: "2.5rem",
          fontWeight: "900",
          color: isActive ? "white" : "#444",
          fontFamily: "monospace",
          marginBottom: "10px",
        }}
      >
        {formatTime(seconds)}
      </div>

      {/* CONTROL BUTTONS */}
      {!isActive ? (
        <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
          <button onClick={() => startTimer(30)} style={btnStyle}>
            30s
          </button>
          <button onClick={() => startTimer(60)} style={btnStyle}>
            60s
          </button>
          <button onClick={() => startTimer(90)} style={btnStyle}>
            90s
          </button>
          <button onClick={() => startTimer(120)} style={btnStyle}>
            2m
          </button>
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={stopTimer}
          style={{
            ...btnStyle,
            backgroundColor: "#ef4444",
            color: "white",
            width: "100%",
          }}
        >
          STOP / I'M READY
        </motion.button>
      )}
    </div>
  );
}

const btnStyle = {
  flex: 1,
  padding: "8px",
  backgroundColor: "#333",
  color: "white",
  border: "1px solid #444",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "0.9rem",
};
