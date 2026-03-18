"use client";
import { forwardRef } from "react";

const ShareableWorkoutCard = forwardRef(
  ({ workout, totalVolume, bestLift }, ref) => {
    if (!workout) return <div ref={ref} />;

    const date = new Date(workout.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div
        ref={ref}
        style={{
          width: "450px",
          height: "800px",
          padding: "44px 40px",
          background: "#060608",
          backgroundImage:
            "linear-gradient(160deg, #12090a 0%, #060608 45%, #06080d 100%)",
          color: "white",
          fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          zIndex: -1,
          overflow: "hidden",
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-60px",
            width: "280px",
            height: "280px",
            background:
              "radial-gradient(circle, rgba(255,69,0,0.14) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "-40px",
            width: "220px",
            height: "220px",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Top border accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #ff4500, #ff6030, transparent)",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              background: "#ff4500",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "1rem",
              letterSpacing: "0.5px",
              flexShrink: 0,
            }}
          >
            PT
          </div>
          <div>
            <div
              style={{
                fontSize: "1.6rem",
                fontWeight: 900,
                letterSpacing: "1.5px",
                lineHeight: 1,
                textTransform: "uppercase",
              }}
            >
              Session Complete
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#ff4500",
                marginTop: "2px",
                letterSpacing: "0.5px",
              }}
            >
              {date} · {workout.workoutName}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "rgba(255,255,255,0.08)",
            marginBottom: "32px",
          }}
        />

        {/* Stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            flex: 1,
          }}
        >
          {bestLift?.weight > 0 && (
            <div>
              <div
                style={{
                  fontSize: "0.65rem",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: "8px",
                }}
              >
                Top Lift
              </div>
              <div
                style={{
                  fontSize: "5rem",
                  fontWeight: 900,
                  fontStyle: "italic",
                  color: "#ff4500",
                  lineHeight: 1,
                  textShadow: "0 0 40px rgba(255,69,0,0.35)",
                }}
              >
                {bestLift.weight}
                <span
                  style={{
                    fontSize: "1.8rem",
                    marginLeft: "6px",
                    opacity: 0.6,
                  }}
                >
                  kg
                </span>
              </div>
              <div
                style={{
                  fontSize: "1rem",
                  color: "rgba(255,255,255,0.5)",
                  marginTop: "4px",
                  letterSpacing: "0.5px",
                }}
              >
                {bestLift.name} · {bestLift.reps} reps
              </div>
            </div>
          )}

          {totalVolume > 0 && (
            <div>
              <div
                style={{
                  fontSize: "0.65rem",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: "8px",
                }}
              >
                Total Volume Moved
              </div>
              <div
                style={{
                  fontSize: "4rem",
                  fontWeight: 900,
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1,
                }}
              >
                {totalVolume.toLocaleString()}
                <span
                  style={{
                    fontSize: "1.5rem",
                    marginLeft: "6px",
                    opacity: 0.4,
                  }}
                >
                  kg
                </span>
              </div>
            </div>
          )}

          {/* Exercise list */}
          {workout.exercises?.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: "0.65rem",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: "10px",
                }}
              >
                Exercises
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                {workout.exercises.slice(0, 5).map((ex, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.8)",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {ex.name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontFamily: "'JetBrains Mono', monospace",
                        color: "rgba(255,255,255,0.3)",
                      }}
                    >
                      {ex.sets.map((s) => `${s.weight}×${s.reps}`).join(" · ")}
                    </span>
                  </div>
                ))}
                {workout.exercises.length > 5 && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.25)",
                    }}
                  >
                    +{workout.exercises.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "rgba(255,255,255,0.06)",
            margin: "24px 0 20px",
          }}
        />

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: 900,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              <span style={{ color: "#ff4500" }}>PROGRESS</span>{" "}
              <span style={{ color: "rgba(255,255,255,0.9)" }}>TRUTH</span>
            </div>
            <div
              style={{
                fontSize: "0.6rem",
                fontFamily: "'JetBrains Mono', monospace",
                color: "rgba(255,255,255,0.25)",
                marginTop: "3px",
                letterSpacing: "0.1em",
              }}
            >
              THE BRUTALLY HONEST TRACKER
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "0.6rem",
                fontFamily: "'JetBrains Mono', monospace",
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.08em",
              }}
            >
              {workout.exercises?.length || 0} EXERCISES
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ShareableWorkoutCard.displayName = "ShareableWorkoutCard";
export default ShareableWorkoutCard;
