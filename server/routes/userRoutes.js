const express = require("express");
const router = express.Router();
const User = require("../models/User");

// CREATE OR LOGIN USER
router.post("/create", async (req, res) => {
  try {
    const { username, email, height, dietType } = req.body;

    // 1. Check karo user pehle se hai kya? (Email se)
    let user = await User.findOne({ email });

    if (user) {
      // User mil gaya -> Login successful
      console.log("Existing User Login:", username);
      return res.json(user);
    }

    // 2. Agar nahi mila -> Naya User banao
    user = new User({
      username,
      email,
      height,
      dietType,
    });

    const savedUser = await user.save();
    console.log("New User Created:", username);
    res.json(savedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
  