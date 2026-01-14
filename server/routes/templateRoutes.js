const express = require("express");
const router = express.Router();
const Template = require("../models/Template");

// 1. GET ALL TEMPLATES FOR USER
router.get("/:userId", async (req, res) => {
  try {
    const templates = await Template.find({ userId: req.params.userId });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: "Templates load nahi huye" });
  }
});

// 2. CREATE NEW TEMPLATE
router.post("/create", async (req, res) => {
  try {
    const { userId, name, exercises } = req.body;

    // Sirf zaroori data save karo (Sets ki zaroorat nahi template mein)
    const cleanExercises = exercises.map((ex) => ({
      name: ex.name,
      targetMuscle: ex.targetMuscle || "Other",
    }));

    const newTemplate = new Template({
      userId,
      name,
      exercises: cleanExercises,
    });
    const saved = await newTemplate.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: "Template save nahi hua" });
  }
});

// 3. DELETE TEMPLATE
router.delete("/:id", async (req, res) => {
  try {
    await Template.findByIdAndDelete(req.params.id);
    res.json({ message: "Template Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete fail" });
  }
});

module.exports = router;
