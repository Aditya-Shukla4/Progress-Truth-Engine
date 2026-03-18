"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, provider, signInWithPopup } from "../firebase";

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
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
      if (res.ok) onLogin(data.userId);
      else alert(data.error || "Failed");
    } catch {
      alert("Server Error");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const res = await fetch(`${apiBase}/api/user/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, name: user.displayName }),
      });
      const data = await res.json();
      if (res.ok) onLogin(data.userId);
      else alert("Google Backend Error");
    } catch (err) {
      console.error(err);
      alert("Google sign-in failed");
    }
    setGoogleLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          top: "-120px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(255,69,0,0.12) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      {/* Bottom glow */}
      <div
        style={{
          position: "fixed",
          bottom: "-80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "300px",
          height: "300px",
          background:
            "radial-gradient(circle, rgba(255,69,0,0.06) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: "32px" }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: "3rem",
            letterSpacing: "2px",
            lineHeight: 1,
          }}
        >
          <span style={{ color: "var(--ember)" }}>PROGRESS</span>{" "}
          <span style={{ color: "var(--text-1)" }}>TRUTH</span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--text-3)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginTop: "6px",
          }}
        >
          No excuses. Only data.
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="glass-card"
        style={{ width: "100%", maxWidth: "420px", padding: "28px 24px" }}
      >
        {/* Mode toggle header */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            background: "var(--surface-2)",
            borderRadius: "var(--radius-md)",
            padding: "4px",
            marginBottom: "24px",
          }}
        >
          {["Sign Up", "Login"].map((label, i) => {
            const active = isLoginMode === (i === 1);
            return (
              <button
                key={label}
                onClick={() => setIsLoginMode(i === 1)}
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: active ? "var(--surface-3)" : "transparent",
                  color: active ? "var(--text-1)" : "var(--text-3)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontWeight: active ? 500 : 400,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          style={{
            width: "100%",
            padding: "12px 18px",
            background: "var(--surface-2)",
            border: "1px solid var(--border-md)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-1)",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "20px",
            transition: "border-color 0.2s, background 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border-hi)";
            e.currentTarget.style.background = "var(--surface-3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-md)";
            e.currentTarget.style.background = "var(--surface-2)";
          }}
        >
          {googleLoading ? (
            <span
              style={{
                width: "18px",
                height: "18px",
                border: "2px solid var(--border-md)",
                borderTopColor: "var(--text-1)",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
                display: "block",
              }}
            />
          ) : (
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="G"
              style={{ width: "18px" }}
            />
          )}
          {googleLoading ? "Connecting…" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{ flex: 1, height: "1px", background: "var(--border)" }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              color: "var(--text-3)",
              letterSpacing: "0.12em",
            }}
          >
            OR
          </span>
          <div
            style={{ flex: 1, height: "1px", background: "var(--border)" }}
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <AnimatePresence>
            {!isLoginMode && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    paddingBottom: "2px",
                  }}
                >
                  <label className="label">Name</label>
                  <input
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="cyber-input"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label className="label">Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="cyber-input"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label className="label">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="cyber-input"
            />
          </div>

          <AnimatePresence>
            {!isLoginMode && (
              <motion.div
                key="extra-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", gap: "10px" }}>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <label className="label">Height</label>
                    <div style={{ position: "relative" }}>
                      <input
                        name="height"
                        type="number"
                        placeholder="170"
                        value={formData.height}
                        onChange={handleChange}
                        required
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
                        cm
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <label className="label">Target Weight</label>
                    <div style={{ position: "relative" }}>
                      <input
                        name="targetWeight"
                        type="number"
                        placeholder="80"
                        value={formData.targetWeight}
                        onChange={handleChange}
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
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label className="label">Diet Type</label>
                  <select
                    name="dietType"
                    value={formData.dietType}
                    onChange={handleChange}
                    className="cyber-input"
                  >
                    <option value="Non-Veg">Non-Veg 🥩</option>
                    <option value="Eggetarian">Eggetarian 🥚</option>
                    <option value="Vegetarian">Vegetarian 🥦</option>
                    <option value="Vegan">Vegan 🌱</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="neon-btn"
            style={{ marginTop: "4px" }}
          >
            {loading ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    display: "inline-block",
                  }}
                />
                Processing…
              </span>
            ) : isLoginMode ? (
              "Login"
            ) : (
              "Get Started"
            )}
          </button>
        </form>
      </motion.div>

      {/* Footer switch */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          marginTop: "20px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          color: "var(--text-3)",
          textAlign: "center",
        }}
      >
        {isLoginMode ? "New here?" : "Already training?"}{" "}
        <span
          onClick={() => setIsLoginMode(!isLoginMode)}
          style={{
            color: "var(--ember)",
            cursor: "pointer",
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}
        >
          {isLoginMode ? "Create account" : "Sign in"}
        </span>
      </motion.p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
