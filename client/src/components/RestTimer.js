"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PRESETS = [
  { label: "30s", seconds: 30 },
  { label: "1m", seconds: 60 },
  { label: "90s", seconds: 90 },
  { label: "2m", seconds: 120 },
  { label: "3m", seconds: 180 },
];

const SIZE = 120;
const R = 50;
const CIRC = 2 * Math.PI * R;

export default function RestTimer() {
  const [total, setTotal] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds((prev) => prev - 1), 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
      alert("⏰ Time's up — get back to it!");
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const start = (time) => {
    setTotal(time);
    setSeconds(time);
    setIsActive(true);
  };
  const stop = () => {
    setIsActive(false);
    setSeconds(0);
    setTotal(0);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const progress = total > 0 ? seconds / total : 0;
  const dashOffset = CIRC * (1 - progress);

  return (
    <div
      style={{
        border: `1px solid ${isActive ? "var(--ember-border)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        background: "var(--surface-1)",
        overflow: "hidden",
        transition: "border-color 0.3s",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${isActive ? "var(--ember-border)" : "var(--border)"}`,
          transition: "border-color 0.3s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: isActive ? "var(--ember)" : "var(--text-4)",
              boxShadow: isActive ? "0 0 8px var(--ember)" : "none",
              transition: "all 0.3s",
              animation: isActive ? "pulse-dot 1.4s ease infinite" : "none",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: "0.5px",
              color: isActive ? "var(--text-1)" : "var(--text-2)",
            }}
          >
            {isActive ? "Resting…" : "Rest Timer"}
          </span>
        </div>
        {isActive && (
          <button
            onClick={stop}
            className="icon-btn"
            style={{ width: "28px", height: "28px" }}
          >
            <svg viewBox="0 0 14 14" fill="currentColor" width="10" height="10">
              <rect x="2" y="2" width="4" height="10" rx="1" />
              <rect x="8" y="2" width="4" height="10" rx="1" />
            </svg>
          </button>
        )}
      </div>

      <div style={{ padding: "16px" }}>
        {isActive ? (
          /* Active: circular countdown */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div style={{ position: "relative", width: SIZE, height: SIZE }}>
              <svg
                width={SIZE}
                height={SIZE}
                style={{ transform: "rotate(-90deg)" }}
              >
                {/* Track */}
                <circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  fill="none"
                  stroke="var(--surface-3)"
                  strokeWidth="6"
                />
                {/* Progress */}
                <motion.circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  fill="none"
                  stroke="var(--ember)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={dashOffset}
                  style={{
                    filter: "drop-shadow(0 0 6px var(--ember-glow))",
                    transition: "stroke-dashoffset 0.9s linear",
                  }}
                />
              </svg>
              {/* Center time */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: "1.8rem",
                    color: seconds <= 10 ? "var(--ember)" : "var(--text-1)",
                    lineHeight: 1,
                    transition: "color 0.3s",
                  }}
                >
                  {formatTime(seconds)}
                </span>
                <span className="label" style={{ marginTop: "2px" }}>
                  {Math.round(progress * 100)}%
                </span>
              </div>
            </div>

            <button
              onClick={stop}
              className="ghost-btn"
              style={{ width: "100%" }}
            >
              Done — Back to it
            </button>
          </motion.div>
        ) : (
          /* Idle: preset buttons */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", gap: "7px" }}
          >
            {PRESETS.map((p) => (
              <button
                key={p.seconds}
                onClick={() => start(p.seconds)}
                style={{
                  flex: 1,
                  padding: "10px 4px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-md)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-2)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "border-color 0.2s, color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--ember-border)";
                  e.currentTarget.style.color = "var(--ember)";
                  e.currentTarget.style.background = "var(--ember-dim)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-md)";
                  e.currentTarget.style.color = "var(--text-2)";
                  e.currentTarget.style.background = "var(--surface-2)";
                }}
              >
                {p.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
