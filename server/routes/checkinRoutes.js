const express = require("express");
const router = express.Router();
const CheckIn = require("../models/CheckIn");

// 👇 TRUTH ENGINE LOGIC (Dimaag yahan hai) 🧠
const calculateTruth = (data) => {
  const proteinPerKg = data.dailyProtein / data.currentWeight;

  // RULE 1: SLEEP (Sabse Zaroori)
  if (data.avgSleep < 6) {
    return {
      status: "RED",
      resultMessage: "Recovery System Broken.",
      actionStep: "Sleep at least 7 hours. Muscles grow in bed, not in gym.",
    };
  }

  // RULE 2: PROTEIN (Building Blocks)
  if (proteinPerKg < 1.6) {
    return {
      status: "RED",
      resultMessage: "Insufficient Building Blocks.",
      actionStep: `Eat more protein. Target: ${Math.round(
        data.currentWeight * 1.8
      )}g daily.`,
    };
  }

  // RULE 3: FREQUENCY (Kaam chori)
  if (data.workoutDays < 3) {
    return {
      status: "RED",
      resultMessage: "Weak Stimulus.",
      actionStep: "Train at least 3 days a week to force adaptation.",
    };
  }

  // RULE 4: STAGNATION (Ruka hua progress)
  if (
    data.strengthTrend === "decreasing" ||
    (data.strengthTrend === "same" && data.caloriesLevel === "maintenance")
  ) {
    return {
      status: "YELLOW",
      resultMessage: "Stagnation Detected.",
      actionStep: "Increase calories by 200 or add 1 extra set per exercise.",
    };
  }

  // AGAR SAB SAHI HAI:
  return {
    status: "GREEN",
    resultMessage: "System Optimized.",
    actionStep: "Do NOT change anything. Consistency is the key now.",
  };
};

// 👇 ROUTE 1: ANALYZE & SAVE (POST)
router.post("/analyze", async (req, res) => {
  try {
    const {
      userId,
      currentWeight,
      avgSleep,
      dailyProtein,
      caloriesLevel,
      workoutDays,
      strengthTrend,
    } = req.body;

    // 1. Logic Run Karo
    const result = calculateTruth({
      currentWeight,
      avgSleep,
      dailyProtein,
      caloriesLevel,
      workoutDays,
      strengthTrend,
    });

    // 2. Database mein Save Karo
    const newCheckIn = new CheckIn({
      userId,
      currentWeight,
      avgSleep,
      dailyProtein,
      caloriesLevel,
      workoutDays,
      strengthTrend,
      status: result.status,
      resultMessage: result.resultMessage,
      actionStep: result.actionStep,
    });

    await newCheckIn.save();

    // 3. Frontend ko Result bhejo
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error: Check-in failed" });
  }
});

// 👇 ROUTE 2: GET HISTORY (GET)
router.get("/history/:userId", async (req, res) => {
  try {
    const history = await CheckIn.find({ userId: req.params.userId })
      .sort({ weekStartDate: -1 }) // Latest pehle
      .limit(5); // Sirf last 5 weeks
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch history" });
  }
});

module.exports = router;
