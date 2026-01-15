const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ==========================================
// 1️⃣ MANUAL REGISTER (Email + Password)
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
      password: hashedPassword, // 🔐 Password Save hoga
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

// ==========================================
// 2️⃣ MANUAL LOGIN (Email + Password)
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid Credentials" });

    // 🛑 Password Check Zaroori Hai
    // Agar user Google se bana tha, toh uska password empty hoga, isliye ye fail hoga (Sahi hai)
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

// ==========================================
// 3️⃣ GOOGLE LOGIN (No Password) 🆕
// ==========================================
router.post("/google", async (req, res) => {
  try {
    const { email, name } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      // A. USER HAI -> Login karwa do (Password check mat karo)
      return res.json({
        message: "Google Login Success",
        userId: user._id,
        name: user.username,
      });
    } else {
      // B. USER NAHI HAI -> Naya banao (Password Empty rakho)
      user = new User({
        username: name,
        email: email,
        password: "", // 👈 Password Khali
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
// 4️⃣ PROFILE ROUTES (Common for All)
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

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
