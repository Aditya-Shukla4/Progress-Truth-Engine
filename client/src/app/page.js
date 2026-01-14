"use client";
import { useState, useEffect, useCallback } from "react";

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]); // 📜 State for Past Records

  // FORMS
  const [userForm, setUserForm] = useState({
    username: "",
    height: "",
    dietType: "veg",
    lactoseIntolerant: false,
    hostelOrHome: "home",
  });

  const [checkInForm, setCheckInForm] = useState({
    currentWeight: "",
    avgSleep: "",
    dailyProtein: "",
    caloriesLevel: "maintenance",
    workoutDays: "",
    strengthTrend: "same",
  });

  const [result, setResult] = useState(null);

  const API_BASE = "https://progresstruth-api.onrender.com";
  // const API_BASE = "http://localhost:5000";
  // 🔄 FETCH HISTORY FUNCTION
  const fetchHistory = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/api/checkin/history/${id}`);

      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("History fetch failed");
    }
  }, []);

  // 🕵️‍♂️ LOAD USER & HISTORY ON START
  useEffect(() => {
    const savedId = localStorage.getItem("pte_userId");
    if (savedId) {
      setUserId(savedId);
      fetchHistory(savedId); // Load history immediately
    }
  }, [fetchHistory]);

  // HANDLE USER SUBMIT
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      const data = await res.json();
      if (data._id) {
        localStorage.setItem("pte_userId", data._id);
        setUserId(data._id);
        fetchHistory(data._id);
      }
    } catch (err) {
      alert("Server Error!");
    }
    setLoading(false);
  };

  // HANDLE TRUTH CHECK SUBMIT
  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    setTimeout(async () => {
      try {
        const payload = { ...checkInForm, userId: userId };
        const res = await fetch(`${API_BASE}/api/checkin/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setResult(data);
        fetchHistory(userId); // 🔄 Refresh list after checkin
      } catch (err) {
        alert("Engine Failed!");
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "monospace",
      }}
    >
      <h1
        style={{
          color: "#ef4444",
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "20px",
          textTransform: "uppercase",
          letterSpacing: "-1px",
        }}
      >
        PROGRESS TRUTH ENGINE
      </h1>

      {!userId ? (
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            border: "1px solid #333",
            padding: "20px",
            backgroundColor: "#111",
          }}
        >
          <h2
            style={{
              color: "#fff",
              borderBottom: "1px solid #333",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}
          >
            WHO ARE YOU?
          </h2>
          <form
            onSubmit={handleUserSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <input
              placeholder="Name"
              required
              onChange={(e) =>
                setUserForm({ ...userForm, username: e.target.value })
              }
              style={inputStyle}
            />
            <input
              placeholder="Height (cm)"
              type="number"
              required
              onChange={(e) =>
                setUserForm({ ...userForm, height: e.target.value })
              }
              style={inputStyle}
            />
            <select
              onChange={(e) =>
                setUserForm({ ...userForm, dietType: e.target.value })
              }
              style={inputStyle}
            >
              <option value="veg">Vegetarian</option>
              <option value="eggs">Veg + Eggs</option>
              <option value="whey">Veg + Whey</option>
            </select>
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "SAVING..." : "START PROTOCOL"}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span style={{ color: "#444", fontSize: "0.8rem" }}>
              ID: {userId.slice(-4)}
            </span>
            <button
              onClick={() => {
                localStorage.removeItem("pte_userId");
                setUserId(null);
              }}
              style={{
                fontSize: "0.7rem",
                color: "#666",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              [ RESET ]
            </button>
          </div>

          {result ? (
            <div
              style={{
                padding: "20px",
                border: "2px solid",
                borderColor:
                  result.status === "RED"
                    ? "red"
                    : result.status === "YELLOW"
                    ? "yellow"
                    : "green",
                backgroundColor: "#111",
                marginBottom: "30px",
              }}
            >
              <h2
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "900",
                  color:
                    result.status === "RED"
                      ? "red"
                      : result.status === "YELLOW"
                      ? "yellow"
                      : "green",
                }}
              >
                {result.status}
              </h2>
              <p
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  margin: "10px 0",
                }}
              >
                {result.resultMessage}
              </p>
              <div
                style={{
                  backgroundColor: "#222",
                  padding: "10px",
                  borderRadius: "5px",
                  color: "#ccc",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    color: "#666",
                  }}
                >
                  Action Step:
                </span>
                {result.actionStep}
              </div>
              <button
                onClick={() => setResult(null)}
                style={{
                  ...btnStyle,
                  backgroundColor: "white",
                  color: "black",
                  marginTop: "20px",
                }}
              >
                CHECK AGAIN
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleCheckInSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                marginBottom: "30px",
              }}
            >
              <input
                name="currentWeight"
                placeholder="Current Weight (kg)"
                type="number"
                required
                onChange={(e) =>
                  setCheckInForm({
                    ...checkInForm,
                    currentWeight: e.target.value,
                  })
                }
                style={inputStyle}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  name="avgSleep"
                  placeholder="Sleep (hrs)"
                  type="number"
                  required
                  onChange={(e) =>
                    setCheckInForm({ ...checkInForm, avgSleep: e.target.value })
                  }
                  style={{ ...inputStyle, flex: 1 }}
                />
                <input
                  name="dailyProtein"
                  placeholder="Protein (g)"
                  type="number"
                  required
                  onChange={(e) =>
                    setCheckInForm({
                      ...checkInForm,
                      dailyProtein: e.target.value,
                    })
                  }
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
              <select
                name="caloriesLevel"
                onChange={(e) =>
                  setCheckInForm({
                    ...checkInForm,
                    caloriesLevel: e.target.value,
                  })
                }
                style={inputStyle}
              >
                <option value="maintenance">Maintenance Calories</option>
                <option value="deficit">Deficit (Cutting)</option>
                <option value="surplus">Surplus (Bulking)</option>
              </select>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  name="workoutDays"
                  placeholder="Workouts/Week"
                  type="number"
                  required
                  onChange={(e) =>
                    setCheckInForm({
                      ...checkInForm,
                      workoutDays: e.target.value,
                    })
                  }
                  style={{ ...inputStyle, flex: 1 }}
                />
                <select
                  name="strengthTrend"
                  onChange={(e) =>
                    setCheckInForm({
                      ...checkInForm,
                      strengthTrend: e.target.value,
                    })
                  }
                  style={{ ...inputStyle, flex: 1 }}
                >
                  <option value="same">Strength: Same ➖</option>
                  <option value="increasing">Strength: Up ⬆️</option>
                  <option value="decreasing">Strength: Down ⬇️</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ ...btnStyle, backgroundColor: "#dc2626" }}
              >
                {loading ? "ANALYZING..." : "REVEAL TRUTH"}
              </button>
            </form>
          )}

          {/* 📜 HISTORY SECTION (NEW) */}
          <div style={{ borderTop: "1px solid #333", paddingTop: "20px" }}>
            <h3
              style={{
                color: "#666",
                fontSize: "0.9rem",
                marginBottom: "10px",
                textTransform: "uppercase",
              }}
            >
              Recent Evidence
            </h3>
            {history.length === 0 ? (
              <p style={{ color: "#444", fontSize: "0.8rem" }}>
                No records found.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {history.map((record) => (
                  <div
                    key={record._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px",
                      backgroundColor: "#111",
                      borderLeft: `4px solid ${
                        record.status === "RED"
                          ? "#ef4444"
                          : record.status === "YELLOW"
                          ? "#facc15"
                          : "#22c55e"
                      }`,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.9rem",
                          fontWeight: "bold",
                        }}
                      >
                        {new Date(record.weekStartDate).toLocaleDateString()}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "#888" }}>
                        {record.currentWeight}kg • {record.workoutDays} workouts
                      </span>
                    </div>
                    <span
                      style={{
                        fontWeight: "bold",
                        color:
                          record.status === "RED"
                            ? "#ef4444"
                            : record.status === "YELLOW"
                            ? "#facc15"
                            : "#22c55e",
                      }}
                    >
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#222",
  border: "1px solid #444",
  color: "white",
  outline: "none",
};
const btnStyle = {
  width: "100%",
  padding: "15px",
  backgroundColor: "#333",
  color: "white",
  fontWeight: "bold",
  border: "none",
  cursor: "pointer",
};
