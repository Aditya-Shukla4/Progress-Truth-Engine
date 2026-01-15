"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { auth, provider, signInWithPopup } from "../firebase"; // 👈 FIREBASE IMPORT

export default function Onboarding({ apiBase, onLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    height: "",
    targetWeight: "",
    dietType: "Non-Veg",
  });
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. MANUAL LOGIN / SIGNUP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLoginMode ? "/api/user/login" : "/api/user/register";

    try {
      const res = await fetch(`${apiBase}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.userId);
      } else {
        alert(data.error || "Failed");
      }
    } catch (err) {
      alert("Server Error");
    }
    setLoading(false);
  };

  // 2. 👇 GOOGLE LOGIN HANDLER (New & Fixed)
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Backend ko batao ki Google se banda aaya hai
      const res = await fetch(`${apiBase}/api/user/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onLogin(data.userId); // 🎉 Login Done!
      } else {
        alert("Google Backend Error");
      }
    } catch (err) {
      console.error(err);
      alert("Google Popup Closed or Error");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center", color: "white" }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: "#111",
          padding: "30px",
          borderRadius: "10px",
          border: "1px solid #333",
        }}
      >
        <h2 style={{ color: "#ef4444", marginBottom: "20px" }}>
          {isLoginMode ? "WELCOME BACK" : "WHO ARE YOU?"}
        </h2>

        {/* 👇 GOOGLE BUTTON */}
        <button
          onClick={handleGoogleLogin}
          style={{
            ...btnStyle,
            background: "white",
            color: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="G"
            style={{ width: "20px" }}
          />
          CONTINUE WITH GOOGLE
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#666",
            marginBottom: "20px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "#333" }}></div>
          OR
          <div style={{ flex: 1, height: "1px", background: "#333" }}></div>
        </div>

        {/* MANUAL FORM */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          {!isLoginMode && (
            <input
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          {!isLoginMode && (
            <>
              <input
                name="height"
                type="number"
                placeholder="Height (cm)"
                value={formData.height}
                onChange={handleChange}
                required
                style={inputStyle}
              />
              <input
                name="targetWeight"
                type="number"
                placeholder="Target Weight (kg)"
                value={formData.targetWeight}
                onChange={handleChange}
                style={inputStyle}
              />
              <select
                name="dietType"
                value={formData.dietType}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="Non-Veg">Non-Veg</option>
                <option value="Veg">Vegetarian</option>
                <option value="Eggetarian">Eggetarian</option>
                <option value="Vegan">Vegan</option>
              </select>
            </>
          )}

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "PROCESSING..." : isLoginMode ? "LOGIN" : "GET STARTED"}
          </button>
        </form>

        <p style={{ marginTop: "15px", fontSize: "0.8rem", color: "#888" }}>
          {isLoginMode ? "New here?" : "Already have an account?"}{" "}
          <span
            onClick={() => setIsLoginMode(!isLoginMode)}
            style={{
              color: "#ef4444",
              cursor: "pointer",
              fontWeight: "bold",
              textDecoration: "underline",
            }}
          >
            {isLoginMode ? "Join the Cult" : "Login"}
          </span>
        </p>
      </motion.div>
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
  borderRadius: "5px",
};
const btnStyle = {
  width: "100%",
  padding: "15px",
  backgroundColor: "#ef4444",
  color: "white",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  borderRadius: "5px",
};
