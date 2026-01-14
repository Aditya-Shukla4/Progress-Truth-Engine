"use client";
import { useState, useEffect } from "react";

export default function PersonalRecords({ apiBase, userId }) {
  const [prs, setPrs] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const fetchPRs = async () => {
      try {
        const res = await fetch(`${apiBase}/api/workout/prs/${userId}`);
        if (res.ok) setPrs(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchPRs();
  }, [apiBase, userId]);

  if (prs.length === 0) return null; // Agar koi record nahi hai toh kuch mat dikhao

  return (
    <div style={{ marginBottom: "20px" }}>
      <h3
        style={{
          color: "#facc15",
          fontSize: "0.9rem",
          marginBottom: "10px",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        🏆 Hall of Fame (PRs)
      </h3>
      <div
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          paddingBottom: "10px",
        }}
      >
        {prs.map((record) => (
          <div
            key={record._id}
            style={{
              minWidth: "100px",
              backgroundColor: "#222",
              border: "1px solid #facc15",
              padding: "10px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                color: "#ccc",
                textTransform: "uppercase",
                marginBottom: "5px",
              }}
            >
              {record._id}
            </div>
            <div
              style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white" }}
            >
              {record.maxLift}
              <span style={{ fontSize: "0.8rem", color: "#666" }}>kg</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
