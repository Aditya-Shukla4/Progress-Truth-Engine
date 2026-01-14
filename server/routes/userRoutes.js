const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs"); // Password hash ke liye
const jwt = require("jsonwebtoken"); // Login token ke liye

// ==========================================
// 🔐 AUTH ROUTES (Login/Register)
// ==========================================

// 1. REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check user
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save User
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.json({ message: "User Registered", userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// 2. LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid Credentials" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid Credentials" });

    // Return Data
    res.json({
      message: "Login Success",
      userId: user._id,
      name: user.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// ==========================================
// 👤 PROFILE ROUTES (New Update)
// ==========================================

// 3. GET USER DETAILS
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// 4. UPDATE USER DETAILS
router.put("/:id", async (req, res) => {
  try {
    const { height, targetWeight, dietType } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { height, targetWeight, dietType },
      { new: true } // Return updated doc
    ).select("-password");
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

module.exports = router;
