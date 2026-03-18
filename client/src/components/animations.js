"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useSpring, useTransform, animate } from "framer-motion";

// ═══════════════════════════════════════════════════════════════════════════
//  EASING PRESETS
// ═══════════════════════════════════════════════════════════════════════════
export const ease = {
  bounce: [0.34, 1.56, 0.64, 1],
  out: [0.16, 1, 0.3, 1],
  inOut: [0.45, 0, 0.15, 1],
  snap: [0.23, 1, 0.32, 1],
  rubber: [0.36, 0.07, 0.19, 0.97],
};

// ═══════════════════════════════════════════════════════════════════════════
//  HOOK: useCountUp
//  Animates a number from 0 → target with cubic ease-out
// ═══════════════════════════════════════════════════════════════════════════
export function useCountUp(
  target,
  { duration = 1.4, delay = 0, decimals = 0 } = {},
) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!target && target !== 0) return;
    const startTime = performance.now() + delay * 1000;

    const tick = (now) => {
      if (now < startTime) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const current = eased * target;
      setValue(
        decimals > 0
          ? parseFloat(current.toFixed(decimals))
          : Math.round(current),
      );
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, delay, decimals]);

  return value;
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT: CountUp
//  Drop-in animated number display
// ═══════════════════════════════════════════════════════════════════════════
export function CountUp({
  to = 0,
  duration = 1.4,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  style,
}) {
  const val = useCountUp(to, { duration, delay, decimals });
  return (
    <span className={className} style={style}>
      {prefix}
      {decimals > 0 ? val.toFixed(decimals) : val.toLocaleString()}
      {suffix}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  HOOK: useInView
//  Triggers once when element enters viewport
// ═══════════════════════════════════════════════════════════════════════════
export function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT: AnimatedStat
//  Stat card that counts up when scrolled into view
// ═══════════════════════════════════════════════════════════════════════════
export function AnimatedStat({
  value,
  label,
  suffix = "",
  prefix = "",
  color = "var(--ember)",
  delay = 0,
  decimals = 0,
}) {
  const [ref, inView] = useInView();
  const val = useCountUp(inView ? value : 0, {
    duration: 1.2,
    delay,
    decimals,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: ease.out }}
      className="stat-card"
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "2.2rem",
          color,
          lineHeight: 1,
        }}
      >
        {prefix}
        {decimals > 0 ? val.toFixed(decimals) : val.toLocaleString()}
        {suffix}
      </div>
      <div className="label" style={{ marginTop: "4px" }}>
        {label}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT: PRFlash
//  Gold burst animation for personal records
// ═══════════════════════════════════════════════════════════════════════════
export function PRFlash({ children, isPR = false }) {
  const [flashed, setFlashed] = useState(false);

  useEffect(() => {
    if (isPR && !flashed) {
      setFlashed(true);
    }
  }, [isPR]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {children}
      <AnimatePresence>
        {flashed && (
          <>
            {/* Ring burst */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.6, ease: ease.out }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid var(--gold)",
                pointerEvents: "none",
              }}
            />
            {/* PR badge pop */}
            <motion.div
              initial={{ scale: 0, y: 0, opacity: 1 }}
              animate={{ scale: 1, y: -28, opacity: 1 }}
              exit={{ opacity: 0, y: -36 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
                delay: 0.1,
              }}
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                background: "var(--gold)",
                color: "#000",
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                padding: "2px 6px",
                borderRadius: "4px",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              PR 🏆
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT: StreakCelebration
//  Full-screen celebration for milestone streaks
// ═══════════════════════════════════════════════════════════════════════════
export function StreakCelebration({ streak, onDone }) {
  const milestones = [3, 7, 14, 21, 30, 60, 100];
  const isMilestone = milestones.includes(streak);

  useEffect(() => {
    if (!isMilestone) {
      onDone?.();
      return;
    }
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [isMilestone]);

  if (!isMilestone) return null;

  const messages = {
    3: { text: "3 Days Strong", sub: "The habit is forming.", emoji: "🔥" },
    7: { text: "One Full Week", sub: "Most people quit by now.", emoji: "⚡" },
    14: {
      text: "Two Weeks Solid",
      sub: "You're built different.",
      emoji: "💎",
    },
    21: { text: "21 Day Streak", sub: "This is who you are now.", emoji: "🦍" },
    30: { text: "30 Days. A Month.", sub: "Respect.", emoji: "👑" },
    60: { text: "60 Days", sub: "Elite tier. Unreal.", emoji: "⚡" },
    100: { text: "100 DAYS", sub: "You are the 1%.", emoji: "🏆" },
  };
  const msg = messages[streak];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(6,6,8,0.95)",
        backdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        textAlign: "center",
        padding: "32px",
      }}
      onClick={onDone}
    >
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, rgba(255,69,0,0.18) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
        style={{ fontSize: "6rem", lineHeight: 1 }}
      >
        {msg.emoji}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: ease.out }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: "3.2rem",
            color: "var(--text-1)",
            lineHeight: 1,
            letterSpacing: "1px",
          }}
        >
          {msg.text}
        </div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "var(--text-3)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginTop: "12px",
          }}
        >
          {msg.sub}
        </p>
      </motion.div>

      {/* Streak number */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
        style={{
          background: "var(--ember-dim)",
          border: "1px solid var(--ember-border)",
          borderRadius: "var(--radius-xl)",
          padding: "12px 32px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "4rem",
            color: "var(--ember)",
            lineHeight: 1,
          }}
        >
          {streak}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            color: "var(--ember)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            display: "block",
            marginTop: "4px",
          }}
        >
          day streak
        </span>
      </motion.div>

      {/* Animated rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.3, opacity: 0.6 }}
          animate={{ scale: 3 + i, opacity: 0 }}
          transition={{
            duration: 1.8,
            delay: i * 0.2,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 1,
          }}
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: `1px solid var(--ember)`,
            pointerEvents: "none",
          }}
        />
      ))}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          color: "var(--text-4)",
          letterSpacing: "0.1em",
          marginTop: "8px",
        }}
      >
        Tap anywhere to continue
      </motion.p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT: WorkoutCompleteBanner
//  Slides up after finishing a workout
// ═══════════════════════════════════════════════════════════════════════════
export function WorkoutCompleteBanner({
  workoutName,
  totalSets,
  totalVolume,
  elapsed,
  onDone,
}) {
  const fmt = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        gap: "24px",
        textAlign: "center",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "300px",
          height: "300px",
          background:
            "radial-gradient(circle, rgba(255,69,0,0.16) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.15,
          type: "spring",
          stiffness: 240,
          damping: 18,
        }}
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "var(--ember)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 60px rgba(255,69,0,0.5)",
        }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="white"
          strokeWidth="3"
          width="32"
          height="32"
        >
          <motion.path
            d="M6 16l7 7 13-13"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: "2.6rem",
            color: "var(--text-1)",
            lineHeight: 1,
            letterSpacing: "1px",
          }}
        >
          Session
          <br />
          <span style={{ color: "var(--ember)" }}>Complete.</span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "1.1rem",
            color: "var(--text-2)",
            marginTop: "8px",
          }}
        >
          {workoutName}
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
          width: "100%",
        }}
      >
        {[
          { label: "Sets", value: totalSets, color: "var(--ember)" },
          {
            label: "Volume",
            value: `${totalVolume.toLocaleString()}kg`,
            color: "var(--blue)",
            raw: true,
          },
          {
            label: "Duration",
            value: fmt(elapsed),
            color: "var(--green)",
            raw: true,
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.08 }}
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "14px 8px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "1.6rem",
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.raw ? (
                s.value
              ) : (
                <CountUp to={s.value} duration={0.8} delay={0.5 + i * 0.08} />
              )}
            </div>
            <div className="label" style={{ marginTop: "3px" }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileTap={{ scale: 0.97 }}
        onClick={onDone}
        className="neon-btn"
        style={{ marginTop: "8px" }}
      >
        Back to Dashboard
      </motion.button>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT: PulseButton
//  Ember pulse ring on hover/focus — for primary CTAs
// ═══════════════════════════════════════════════════════════════════════════
export function PulseButton({ children, onClick, disabled, style, className }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ position: "relative", overflow: "visible", ...style }}
    >
      <AnimatePresence>
        {hovered && !disabled && (
          <motion.div
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.08, opacity: 0 }}
            exit={{}}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: "-4px",
              borderRadius: "inherit",
              border: "2px solid var(--ember)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>
      {children}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT: FadeUp
//  Staggered fade-up wrapper for lists
// ═══════════════════════════════════════════════════════════════════════════
export function FadeUp({ children, delay = 0, duration = 0.4 }) {
  const [ref, inView] = useInView(0.15);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration, delay, ease: ease.out }}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT: NumberTicker
//  Slot-machine style number change (for live stats)
// ═══════════════════════════════════════════════════════════════════════════
export function NumberTicker({ value, style }) {
  const [prev, setPrev] = useState(value);
  const [display, setDisplay] = useState(value);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (value === prev) return;
    setAnimating(true);
    const t = setTimeout(() => {
      setDisplay(value);
      setPrev(value);
      setAnimating(false);
    }, 200);
    return () => clearTimeout(t);
  }, [value, prev]);

  return (
    <motion.span
      key={display}
      initial={{ y: animating ? -12 : 0, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: ease.out }}
      style={style}
    >
      {display}
    </motion.span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT: ShimmerCard
//  Loading skeleton with animated shimmer
// ═══════════════════════════════════════════════════════════════════════════
export function ShimmerCard({
  height = 80,
  borderRadius = "var(--radius-lg)",
}) {
  return (
    <div
      style={{
        height,
        borderRadius,
        overflow: "hidden",
        position: "relative",
        background: "var(--surface-2)",
      }}
    >
      <motion.div
        animate={{ x: ["−100%", "200%"] }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 0.3,
        }}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
          width: "60%",
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT: HapticButton
//  Rubber-band press effect for interactive buttons
// ═══════════════════════════════════════════════════════════════════════════
export function HapticButton({
  children,
  onClick,
  style,
  className,
  disabled,
}) {
  return (
    <motion.button
      whileTap={{
        scale: 0.94,
        transition: { type: "spring", stiffness: 600, damping: 20 },
      }}
      whileHover={{
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT: ProgressBar
//  Animated fill bar with optional glow
// ═══════════════════════════════════════════════════════════════════════════
export function AnimatedProgressBar({
  percent,
  color = "var(--ember)",
  height = 5,
  delay = 0,
  glow = true,
}) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className="progress-track" style={{ height }}>
      <motion.div
        initial={{ width: 0 }}
        animate={inView ? { width: `${Math.min(percent, 100)}%` } : {}}
        transition={{ duration: 1, delay, ease: ease.out }}
        style={{
          height: "100%",
          background: color,
          borderRadius: "99px",
          boxShadow: glow ? `0 0 8px ${color}88` : "none",
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT: PageTransition
//  Wraps page content with coordinated entry animation
// ═══════════════════════════════════════════════════════════════════════════
export function PageTransition({ children, tabKey }) {
  return (
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 14, filter: "blur(2px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(1px)" }}
      transition={{ duration: 0.28, ease: ease.out }}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT: VolumeBar (for workout history)
//  Horizontal bar showing relative volume
// ═══════════════════════════════════════════════════════════════════════════
export function VolumeBar({ value, max, delay = 0 }) {
  const [ref, inView] = useInView(0.1);
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div
      ref={ref}
      style={{
        height: 3,
        background: "var(--surface-3)",
        borderRadius: "99px",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={inView ? { width: `${pct}%` } : {}}
        transition={{ duration: 0.7, delay, ease: ease.out }}
        style={{
          height: "100%",
          background: "var(--ember)",
          borderRadius: "99px",
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  HOOK: useHaptic
//  Triggers vibration on mobile for key interactions
// ═══════════════════════════════════════════════════════════════════════════
export function useHaptic() {
  const tap = useCallback(() => navigator.vibrate?.(8), []);
  const success = useCallback(() => navigator.vibrate?.([10, 30, 10]), []);
  const error = useCallback(() => navigator.vibrate?.([50, 20, 50]), []);
  const heavy = useCallback(() => navigator.vibrate?.(40), []);
  return { tap, success, error, heavy };
}

// ═══════════════════════════════════════════════════════════════════════════
//  EXPORT: Shared animation variants for AnimatePresence
// ═══════════════════════════════════════════════════════════════════════════
export const variants = {
  fadeUp: {
    initial: { opacity: 0, y: 16 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.38, ease: ease.out },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  },
  slideRight: {
    initial: { opacity: 0, x: -24 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.35, ease: ease.out },
    },
    exit: { opacity: 0, x: 24, transition: { duration: 0.2 } },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: ease.bounce },
    },
    exit: { opacity: 0, scale: 0.92, transition: { duration: 0.18 } },
  },
  slideUp: {
    initial: { opacity: 0, y: "100%" },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: { opacity: 0, y: "100%", transition: { duration: 0.22 } },
  },
};
