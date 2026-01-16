const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Workout = require("../models/Workout");

// ==========================================
// 1️⃣ AUTH ROUTES (Login/Register)
// ==========================================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, height, targetWeight, dietType } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username: name,
      email,
      password: hashedPassword,
      height: height || 0,
      targetWeight: targetWeight || 0,
      dietType: dietType || "Non-Veg",
    });

    await user.save();
    res.json({ message: "User Registered", userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid Credentials" });

    if (!user.password)
      return res.status(400).json({ error: "Please use Google Login" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid Credentials" });

    res.json({
      message: "Login Success",
      userId: user._id,
      name: user.username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { email, name } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      return res.json({
        message: "Google Login Success",
        userId: user._id,
        name: user.username,
      });
    } else {
      user = new User({
        username: name,
        email: email,
        password: "",
        height: 0,
        targetWeight: 0,
        dietType: "Non-Veg",
      });
      await user.save();

      return res.json({
        message: "Google Signup Success",
        userId: user._id,
      });
    }
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ error: "Google Login Failed" });
  }
});

// ==========================================
// 2️⃣ SPECIFIC ROUTES (Ye Upar Hone Chahiye!) 🚨
// ==========================================

// 🏆 LEADERBOARD
router.get("/leaderboard/global", async (req, res) => {
  try {
    const topUsers = await User.find()
      .sort({ totalVolume: -1 })
      .limit(10)
      .select("username totalVolume dietType");

    res.json(topUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Leaderboard error" });
  }
});

// 🔧 FIX SCORES
router.get("/fix-scores", async (req, res) => {
  try {
    const users = await User.find();
    let updates = 0;

    console.log(`Found ${users.length} users. Starting fix...`);

    for (const user of users) {
      const workouts = await Workout.find({ userId: user._id });
      let totalVol = 0;

      workouts.forEach((w) => {
        if (w.exercises) {
          w.exercises.forEach((ex) => {
            if (ex.sets) {
              ex.sets.forEach((s) => {
                totalVol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
              });
            }
          });
        }
      });

      // 👇 CHANGE: save() ki jagah update use kiya (Validation Ignore karega)
      await User.findByIdAndUpdate(user._id, { totalVolume: totalVol });

      console.log(`User: ${user.username} | Volume: ${totalVol}`);
      updates++;
    }

    res.json({ message: `Scores Recalculated for ${updates} users! 🚀` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fix failed" });
  }
});

// ==========================================
// 3️⃣ DYNAMIC ROUTES (Ye Sabse Neeche!)
// ==========================================

// GET USER (Profile)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// UPDATE USER
router.put("/:id", async (req, res) => {
  try {
    const { height, targetWeight, dietType } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { height, targetWeight, dietType },
      { new: true }
    ).select("-password");
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

module.exports = router;
