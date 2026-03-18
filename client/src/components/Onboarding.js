"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, provider, signInWithPopup } from "../firebase";

const SIGNUP_STEPS = [
  "welcome",
  "mode",
  "name",
  "email",
  "password",
  "height",
  "weight",
  "diet",
  "ready",
];
const LOGIN_STEPS = ["welcome", "mode", "email", "password", "ready"];

const DIET_OPTIONS = [
  { value: "Non-Veg", emoji: "🥩", label: "Non-Veg", sub: "Meat & everything" },
  {
    value: "Eggetarian",
    emoji: "🥚",
    label: "Eggetarian",
    sub: "Eggs, no meat",
  },
  {
    value: "Vegetarian",
    emoji: "🥦",
    label: "Vegetarian",
    sub: "Plant + dairy",
  },
  { value: "Vegan", emoji: "🌱", label: "Vegan", sub: "100% plant" },
];

const INPUT_CONFIG = {
  name: {
    question: "What should we\ncall you?",
    placeholder: "Your name",
    type: "text",
    key: "name",
    hint: "How you'll appear on the leaderboard.",
  },
  email: {
    question: "Your email\naddress?",
    placeholder: "you@email.com",
    type: "email",
    key: "email",
    hint: "We'll never spam you. Ever.",
  },
  password: {
    question: (isLogin) =>
      isLogin ? "Enter your\npassword." : "Create a\npassword.",
    placeholder: "6+ characters",
    type: "password",
    key: "password",
    hint: (isLogin) =>
      isLogin ? "The one you set when signing up." : "Make it strong.",
  },
  height: {
    question: "How tall\nare you?",
    placeholder: "170",
    type: "number",
    key: "height",
    hint: "Used to calculate body metrics.",
    unit: "cm",
  },
  weight: {
    question: "Target body\nweight?",
    placeholder: "80",
    type: "number",
    key: "targetWeight",
    hint: "Where do you want to be? Be honest.",
    unit: "kg",
  },
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.706 17.64 9.2z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
    />
  </svg>
);

function ProgressDots({ steps, currentId }) {
  const trackSteps = steps.filter(
    (s) => !["welcome", "mode", "ready"].includes(s),
  );
  const currentIdx = trackSteps.indexOf(currentId);
  if (currentIdx < 0) return null;
  return (
    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
      {trackSteps.map((s, i) => (
        <motion.div
          key={s}
          animate={{
            width: i === currentIdx ? "18px" : "5px",
            background: i <= currentIdx ? "var(--ember)" : "var(--surface-3)",
            opacity: i <= currentIdx ? 1 : 0.4,
          }}
          transition={{ duration: 0.3 }}
          style={{ height: "5px", borderRadius: "99px" }}
        />
      ))}
    </div>
  );
}

export default function Onboarding({ apiBase, onLogin }) {
  const [isLogin, setIsLogin] = useState(false);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    height: "",
    targetWeight: "",
    dietType: "Non-Veg",
  });

  const steps = isLogin ? LOGIN_STEPS : SIGNUP_STEPS;
  const stepId = steps[idx];
  const isLast = idx === steps.length - 1;

  // Auto-advance splash
  useEffect(() => {
    if (stepId === "welcome") {
      const t = setTimeout(() => setIdx(1), 2200);
      return () => clearTimeout(t);
    }
  }, [stepId]);

  const next = () => {
    setError("");
    setIdx((i) => Math.min(i + 1, steps.length - 1));
  };
  const back = () => {
    setError("");
    setIdx((i) => Math.max(i - 1, 1));
  };

  const validate = () => {
    if (stepId === "name" && !form.name.trim())
      return "What should we call you?";
    if (stepId === "email" && !form.email.includes("@"))
      return "Enter a valid email.";
    if (stepId === "password" && form.password.length < 6)
      return "Password must be 6+ characters.";
    if (stepId === "height" && (!form.height || +form.height < 50))
      return "Enter a valid height.";
    return null;
  };

  const handleContinue = async () => {
    if (isLast) {
      await submit();
      return;
    }
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    next();
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${apiBase}/api/user/${isLogin ? "login" : "register"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await res.json();
      if (res.ok) onLogin(data.userId);
      else setError(data.error || "Something went wrong.");
    } catch {
      setError("Can't reach server. Try again.");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const res = await fetch(`${apiBase}/api/user/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: result.user.email,
          name: result.user.displayName,
        }),
      });
      const data = await res.json();
      if (res.ok) onLogin(data.userId);
      else setError("Google sign-in failed.");
    } catch {
      setError("Google sign-in cancelled.");
    }
    setGLoading(false);
  };

  const switchMode = () => {
    setIsLogin((m) => !m);
    setIdx(1);
    setError("");
  };

  const showBack = idx > 1 && !["welcome", "mode", "ready"].includes(stepId);
  const showCTA = !["welcome", "mode", "diet"].includes(stepId);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      {/* Glows */}
      <div
        style={{
          position: "fixed",
          top: "-120px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "480px",
          height: "480px",
          background:
            "radial-gradient(circle, rgba(255,69,0,0.11) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Top nav */}
      <AnimatePresence>
        {showBack && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: "480px",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 10,
              background:
                "linear-gradient(to bottom, rgba(6,6,8,0.9), transparent)",
            }}
          >
            <button
              onClick={back}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-3)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                padding: "6px 0",
              }}
            >
              <svg
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                width="12"
                height="12"
              >
                <path
                  d="M9 2L4 7l5 5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              BACK
            </button>
            <ProgressDots steps={steps} currentId={stepId} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 28px 32px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={stepId + String(isLogin)}
            initial={{ opacity: 0, x: 50, filter: "blur(4px)" }}
            animate={{
              opacity: 1,
              x: 0,
              filter: "blur(0px)",
              transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
            }}
            exit={{
              opacity: 0,
              x: -40,
              filter: "blur(2px)",
              transition: { duration: 0.22 },
            }}
          >
            {/* SPLASH */}
            {stepId === "welcome" && (
              <div style={{ textAlign: "center", paddingTop: "20px" }}>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 180, damping: 16 }}
                  style={{
                    width: "88px",
                    height: "88px",
                    background: "var(--ember)",
                    borderRadius: "50%",
                    margin: "0 auto 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: "2rem",
                    boxShadow: "0 0 70px rgba(255,69,0,0.45)",
                    letterSpacing: "1px",
                  }}
                >
                  PT
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontStyle: "italic",
                    fontSize: "3.4rem",
                    letterSpacing: "2px",
                    lineHeight: 1,
                  }}
                >
                  <div style={{ color: "var(--ember)" }}>PROGRESS</div>
                  <div style={{ color: "var(--text-1)" }}>TRUTH</div>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.68rem",
                    color: "var(--text-3)",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    marginTop: "16px",
                  }}
                >
                  No excuses. Only data.
                </motion.p>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.9, duration: 1.0 }}
                  style={{
                    height: "2px",
                    background:
                      "linear-gradient(90deg, transparent, var(--ember), transparent)",
                    marginTop: "36px",
                    transformOrigin: "left",
                  }}
                />
              </div>
            )}

            {/* MODE */}
            {stepId === "mode" && (
              <div>
                <div style={{ marginBottom: "36px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontStyle: "italic",
                      fontSize: "3rem",
                      color: "var(--text-1)",
                      lineHeight: 1,
                      marginBottom: "8px",
                    }}
                  >
                    Welcome.
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      color: "var(--text-3)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    First time or returning warrior?
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginBottom: "24px",
                  }}
                >
                  {[
                    {
                      mode: false,
                      emoji: "⚡",
                      title: "I'm New Here",
                      sub: "Create your account",
                    },
                    {
                      mode: true,
                      emoji: "🔥",
                      title: "Welcome Back",
                      sub: "Sign in to continue",
                    },
                  ].map((opt) => (
                    <motion.button
                      key={String(opt.mode)}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsLogin(opt.mode);
                        next();
                      }}
                      style={{
                        background: "var(--surface-1)",
                        border: "1px solid var(--border-md)",
                        borderRadius: "var(--radius-lg)",
                        padding: "16px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        transition: "border-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor =
                          "var(--ember-border)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = "var(--border-md)")
                      }
                    >
                      <span
                        style={{
                          fontSize: "1.5rem",
                          width: "38px",
                          height: "38px",
                          background: "var(--surface-3)",
                          borderRadius: "var(--radius-md)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {opt.emoji}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: "1.05rem",
                            color: "var(--text-1)",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {opt.title}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.62rem",
                            color: "var(--text-3)",
                            marginTop: "2px",
                          }}
                        >
                          {opt.sub}
                        </div>
                      </div>
                      <svg
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        width="12"
                        height="12"
                        style={{ color: "var(--text-3)" }}
                      >
                        <path
                          d="M5 2l5 5-5 5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.button>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      background: "var(--border)",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.58rem",
                      color: "var(--text-3)",
                      letterSpacing: "0.12em",
                    }}
                  >
                    OR
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      background: "var(--border)",
                    }}
                  />
                </div>

                <button
                  onClick={handleGoogle}
                  disabled={gLoading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-md)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-1)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.88rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border-hi)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border-md)")
                  }
                >
                  {gLoading ? (
                    <span
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid var(--border-md)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                        display: "block",
                      }}
                    />
                  ) : (
                    <GoogleIcon />
                  )}
                  {gLoading ? "Connecting…" : "Continue with Google"}
                </button>
              </div>
            )}

            {/* INPUT STEPS */}
            {INPUT_CONFIG[stepId] &&
              (() => {
                const cfg = INPUT_CONFIG[stepId];
                const question =
                  typeof cfg.question === "function"
                    ? cfg.question(isLogin)
                    : cfg.question;
                const hint =
                  typeof cfg.hint === "function" ? cfg.hint(isLogin) : cfg.hint;
                return (
                  <div>
                    <div style={{ marginBottom: "36px" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 900,
                          fontStyle: "italic",
                          fontSize: "2.8rem",
                          color: "var(--text-1)",
                          lineHeight: 1.1,
                          marginBottom: "8px",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {question}
                      </div>
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          color: "var(--text-3)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {hint}
                      </p>
                    </div>
                    <div style={{ position: "relative" }}>
                      <input
                        autoFocus
                        type={cfg.type}
                        placeholder={cfg.placeholder}
                        value={form[cfg.key]}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, [cfg.key]: e.target.value }));
                          setError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          borderBottom: `2px solid ${error ? "#ef4444" : "var(--border-hi)"}`,
                          color: "var(--text-1)",
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: "2.2rem",
                          padding: "6px 0",
                          outline: "none",
                          letterSpacing: "0.5px",
                          paddingRight: cfg.unit ? "52px" : "0",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => {
                          if (!error)
                            e.target.style.borderBottomColor = "var(--ember)";
                        }}
                        onBlur={(e) => {
                          if (!error)
                            e.target.style.borderBottomColor =
                              "var(--border-hi)";
                        }}
                      />
                      {cfg.unit && (
                        <span
                          style={{
                            position: "absolute",
                            right: 0,
                            bottom: "12px",
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.8rem",
                            color: "var(--text-3)",
                          }}
                        >
                          {cfg.unit}
                        </span>
                      )}
                    </div>
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.65rem",
                            color: "#ef4444",
                            marginTop: "8px",
                          }}
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })()}

            {/* DIET */}
            {stepId === "diet" && (
              <div>
                <div style={{ marginBottom: "28px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontStyle: "italic",
                      fontSize: "2.8rem",
                      color: "var(--text-1)",
                      lineHeight: 1.1,
                      marginBottom: "8px",
                    }}
                  >
                    How do
                    <br />
                    you eat?
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: "var(--text-3)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Affects your nutrition targets.
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "9px",
                  }}
                >
                  {DIET_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setForm((f) => ({ ...f, dietType: opt.value }));
                        next();
                      }}
                      style={{
                        background:
                          form.dietType === opt.value
                            ? "var(--ember-dim)"
                            : "var(--surface-1)",
                        border: `1px solid ${form.dietType === opt.value ? "var(--ember-border)" : "var(--border)"}`,
                        borderRadius: "var(--radius-lg)",
                        padding: "13px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        transition: "all 0.18s",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.4rem",
                          width: "34px",
                          textAlign: "center",
                          flexShrink: 0,
                        }}
                      >
                        {opt.emoji}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: "0.98rem",
                            color:
                              form.dietType === opt.value
                                ? "var(--ember)"
                                : "var(--text-1)",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {opt.label}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.6rem",
                            color: "var(--text-3)",
                            marginTop: "1px",
                          }}
                        >
                          {opt.sub}
                        </div>
                      </div>
                      <AnimatePresence>
                        {form.dietType === opt.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              background: "var(--ember)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <svg
                              viewBox="0 0 10 10"
                              fill="none"
                              stroke="white"
                              strokeWidth="2"
                              width="8"
                              height="8"
                            >
                              <path
                                d="M1.5 5l2.5 2.5 4.5-4.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* FINALE */}
            {stepId === "ready" && (
              <div style={{ textAlign: "center", paddingTop: "20px" }}>
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 240, damping: 18 }}
                  style={{
                    fontSize: "5.5rem",
                    lineHeight: 1,
                    marginBottom: "28px",
                  }}
                >
                  {isLogin ? "🔥" : "⚡"}
                </motion.div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontStyle: "italic",
                    fontSize: "3rem",
                    color: "var(--text-1)",
                    lineHeight: 1,
                    marginBottom: "14px",
                    whiteSpace: "pre-line",
                  }}
                >
                  {isLogin
                    ? "Welcome\nback."
                    : `Let's go,\n${form.name.split(" ")[0] || "Warrior"}.`}
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    color: "var(--text-3)",
                    letterSpacing: "0.1em",
                    lineHeight: 2,
                  }}
                >
                  {isLogin
                    ? "YOUR PROGRESS IS WAITING.\nTIME TO GET BACK TO WORK."
                    : "YOUR JOURNEY STARTS NOW.\nNO EXCUSES. ONLY RESULTS."}
                </p>
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        color: "#ef4444",
                        marginTop: "16px",
                      }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <AnimatePresence>
        {showCTA && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ padding: "0 28px 44px", position: "relative", zIndex: 1 }}
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleContinue}
              disabled={loading}
              className="neon-btn"
            >
              {loading ? (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
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
                  {isLogin ? "Signing in…" : "Creating account…"}
                </span>
              ) : isLast ? (
                isLogin ? (
                  "Sign In →"
                ) : (
                  "Create Account →"
                )
              ) : (
                "Continue →"
              )}
            </motion.button>
            <p
              style={{
                textAlign: "center",
                marginTop: "14px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                color: "var(--text-3)",
                letterSpacing: "0.08em",
              }}
            >
              {isLogin ? "New here? " : "Already training? "}
              <span
                onClick={switchMode}
                style={{ color: "var(--ember)", cursor: "pointer" }}
              >
                {isLogin ? "Create account" : "Sign in"}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
