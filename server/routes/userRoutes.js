const express = require("express");
const router = express.Router();
const User = require("../models/User");

// CREATE USER (ONBOARDING)
router.post("/create", async (req, res) => {
  try {
    const { username, height, dietType, lactoseIntolerant, hostelOrHome } =
      req.body;

    // Naya user banao
    const newUser = new User({
      username,
      height,
      dietType,
      lactoseIntolerant,
      hostelOrHome,
    });

    const savedUser = await newUser.save();

    // Frontend ko ID wapas bhejo (Yehi ID LocalStorage me jayegi)
    res.json(savedUser);
    console.log("🔥 New User Created:", username);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "User creation failed" });
  }
});

module.exports = router;
