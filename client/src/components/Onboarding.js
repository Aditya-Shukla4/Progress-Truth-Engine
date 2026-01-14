"use client";
import { useState } from "react";

export default function Onboarding({ apiBase, onLogin }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    height: "",
    dietType: "veg",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/user/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data._id) onLogin(data._id); // Parent ko batao login ho gaya
    } catch (err) {
      alert("Server Error");
    }
    setLoading(false);
  };

  return (
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
          borderBottom: "1px solid #333",
          paddingBottom: "10px",
          marginBottom: "15px",
        }}
      >
        WHO ARE YOU?
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          placeholder="Name"
          required
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Height (cm)"
          type="number"
          required
          onChange={(e) => setForm({ ...form, height: e.target.value })}
          style={inputStyle}
        />
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "SAVING..." : "START PROTOCOL"}
        </button>
      </form>
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
  fontWeight: "bold",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#333",
  color: "white",
};
