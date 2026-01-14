const express = require("express");
const router = express.Router();
const CheckIn = require("../models/CheckIn");
const User = require("../models/User");

const calculateTruth = (data) => {
  const proteinPerKg = data.dailyProtein / data.currentWeight;

  if (data.avgSleep < 6) {
    return {
      status: "RED",
      resultMessage: "Recovery System Broken.",
      actionStep: "Sleep at least 7 hours. Muscles grow in bed, not in gym.",
    };
  }

  if (proteinPerKg < 1.6) {
    return {
      status: "RED",
      resultMessage: "Insufficient Building Blocks.",
      actionStep: `Eat more protein. Target: ${Math.round(
        data.currentWeight * 1.8
      )}g daily.`,
    };
  }

  if (data.workoutDays < 3) {
    return {
      status: "RED",
      resultMessage: "Weak Stimulus.",
      actionStep: "Train at least 3 days a week to force adaptation.",
    };
  }

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

  return {
    status: "GREEN",
    resultMessage: "System Optimized.",
    actionStep: "Do NOT change anything. Consistency is the key now.",
  };
};

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

    const result = calculateTruth({
      currentWeight,
      avgSleep,
      dailyProtein,
      caloriesLevel,
      workoutDays,
      strengthTrend,
    });

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

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
