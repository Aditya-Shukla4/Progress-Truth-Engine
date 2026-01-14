const express = require("express");
const router = express.Router();
const Workout = require("../models/Workout");

// 1. SAVE WORKOUT (Aaj ka quota)
router.post("/add", async (req, res) => {
  try {
    const { userId, workoutName, exercises } = req.body;

    const newWorkout = new Workout({
      userId,
      workoutName,
      exercises,
    });

    const savedWorkout = await newWorkout.save();
    res.json(savedWorkout);
    console.log(`💪 Workout Logged: ${workoutName}`);
  } catch (err) {
    res.status(500).json({ error: "Workout save nahi hua bhai!" });
  }
});

// 2. GET HISTORY (Purana hisaab)
router.get("/history/:userId", async (req, res) => {
  try {
    const history = await Workout.find({ userId: req.params.userId })
      .sort({ date: -1 }) // Latest upar
      .limit(10); // Last 10 workouts
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "History nahi mili" });
  }
});

router.get("/prs/:userId", async (req, res) => {
  try {
    // MongoDB Magic Pipeline 🪄
    const prs = await Workout.aggregate([
      { $match: { userId: req.params.userId } }, // 1. Sirf is user ka data lo
      { $unwind: "$exercises" }, // 2. Saari exercises ko khol do
      { $unwind: "$exercises.sets" }, // 3. Saare sets ko khol do
      {
        $group: {
          _id: "$exercises.name", // 4. Exercise naam se group karo
          maxLift: { $max: "$exercises.sets.weight" }, // 5. Max weight dhundo
        },
      },
      { $sort: { maxLift: -1 } }, // 6. Bhaari wala upar
    ]);

    res.json(prs);
  } catch (err) {
    res.status(500).json({ error: "Records nahi mile" });
  }
});

module.exports = router;
