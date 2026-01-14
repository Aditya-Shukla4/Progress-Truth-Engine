"use client";
import { forwardRef } from "react";

// forwardRef zaroori hai taaki parent (WorkoutLog) iska photo kheench sake
const ShareableWorkoutCard = forwardRef(
  ({ workout, totalVolume, bestLift }, ref) => {
    // Agar data nahi hai toh khali div return karo
    if (!workout) return <div ref={ref} />;

    return (
      <div ref={ref} style={instaCardStyle} id="share-card-hidden">
        {/* HEADER with Logo feel */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#ef4444",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "15px",
              fontWeight: "900",
              fontSize: "1.2rem",
            }}
          >
            PT
          </div>
          <div>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "900",
                color: "white",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              SESSION COMPLETE
            </h2>
            <div style={{ fontSize: "0.9rem", color: "#ef4444" }}>
              {new Date(workout.date).toLocaleDateString()} •{" "}
              {workout.workoutName}
            </div>
          </div>
        </div>

        <hr
          style={{ borderColor: "#333", width: "100%", marginBottom: "25px" }}
        />

        {/* STATS SECTION */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          {bestLift && bestLift.weight > 0 && (
            <div>
              <div
                style={{
                  color: "#ef4444",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                }}
              >
                🏆 TODAY'S TOP LIFT
              </div>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "900",
                  color: "white",
                  lineHeight: "1",
                }}
              >
                {bestLift.weight}
                <span style={{ fontSize: "1.2rem", color: "#ccc" }}>kg</span>
              </div>
              <div style={{ fontSize: "1rem", color: "#888" }}>
                {bestLift.name} (x{bestLift.reps})
              </div>
            </div>
          )}
          {totalVolume > 0 && (
            <div>
              <div
                style={{
                  color: "#ef4444",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                }}
              >
                🏗️ TOTAL VOLUME MOVED
              </div>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "900",
                  color: "white",
                  lineHeight: "1",
                }}
              >
                {totalVolume.toLocaleString()}
                <span style={{ fontSize: "1.2rem", color: "#ccc" }}>kg</span>
              </div>
            </div>
          )}
        </div>

        <hr
          style={{
            borderColor: "#333",
            width: "100%",
            marginTop: "auto",
            marginBottom: "20px",
          }}
        />

        {/* FOOTER BRANDING */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "1rem",
              fontWeight: "bold",
              color: "white",
              letterSpacing: "2px",
            }}
          >
            PROGRESS TRUTH ENGINE
          </div>
          <div style={{ fontSize: "0.7rem", color: "#666", marginTop: "5px" }}>
            THE BRUTALLY HONEST TRACKER
          </div>
        </div>
      </div>
    );
  }
);

// Styling for Instagram Story size (approx)
const instaCardStyle = {
  width: "450px", // Fixed width for consistency
  height: "800px", // Taller for story format
  padding: "40px",
  backgroundColor: "#000", // Pure black background
  backgroundImage: "linear-gradient(135deg, #1a1a1a 0%, #000000 100%)", // Subtle gradient
  color: "white",
  fontFamily: "monospace",
  border: "4px solid #ef4444",
  display: "flex",
  flexDirection: "column",
  // 🤫 THE SECRET SAUCE: Hide it off-screen
  position: "fixed",
  top: "-9999px",
  left: "-9999px",
  zIndex: -1,
};

export default ShareableWorkoutCard;
