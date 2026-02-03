const express = require("express");
const router = express.Router();
const Workout = require("../models/Workout");
const User = require("../models/User"); // 👈 Ye Import Zaroori hai Leaderboard ke liye

// 1. SAVE WORKOUT (Aaj ka quota + Score Update)
router.post("/add", async (req, res) => {
  try {
    const { userId, workoutName, exercises } = req.body;

    // A. Workout Save karo
    const newWorkout = new Workout({
      userId,
      workoutName,
      exercises,
    });

    const savedWorkout = await newWorkout.save();

    // B. Volume Calculate karo (Leaderboard ke liye) 🧮
    let sessionVolume = 0;
    if (exercises && exercises.length > 0) {
      exercises.forEach((ex) => {
        if (ex.sets) {
          ex.sets.forEach((set) => {
            sessionVolume +=
              (Number(set.weight) || 0) * (Number(set.reps) || 0);
          });
        }
      });
    }

    // C. User ke Total Volume mein jod do 🏆
    if (sessionVolume > 0) {
      await User.findByIdAndUpdate(userId, {
        $inc: { totalVolume: sessionVolume }, // Score badhao
      });
    }

    res.json(savedWorkout);
    console.log(
      `💪 Workout Logged: ${workoutName} | Score Added: ${sessionVolume}`,
    );
  } catch (err) {
    console.error(err);
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

// 3. GET PRS (Personal Records)
router.get("/prs/:userId", async (req, res) => {
  try {
    // MongoDB Magic Pipeline 🪄
    const prs = await Workout.aggregate([
      { $match: { userId: req.params.userId } },
      { $unwind: "$exercises" },
      { $unwind: "$exercises.sets" },
      {
        $group: {
          _id: "$exercises.name",
          maxLift: { $max: "$exercises.sets.weight" },
        },
      },
      { $sort: { maxLift: -1 } },
    ]);

    res.json(prs);
  } catch (err) {
    res.status(500).json({ error: "Records nahi mile" });
  }
});

// 🧠 SMART LOGIC: GET LAST PERFORMANCE OF AN EXERCISE
router.get("/last-log", async (req, res) => {
  try {
    const { userId, exerciseName } = req.query;

    // 1. Database me dhundo: Is user ka wo workout jisme ye exercise thi
    // Sort by Date Descending (Sabse naya pehle)
    const lastWorkout = await Workout.findOne({
      userId,
      "exercises.name": { $regex: new RegExp(`^${exerciseName}$`, "i") }, // Case insensitive search
    }).sort({ date: -1 });

    if (!lastWorkout) {
      return res.json({ found: false, message: "New Exercise" });
    }

    // 2. Workout mil gaya, ab usme se exact exercise nikalo
    const exerciseData = lastWorkout.exercises.find(
      (ex) => ex.name.toLowerCase() === exerciseName.toLowerCase(),
    );

    // 3. Simple Overload Logic (Backend Brain) 🧠
    // Agar pichli baar user ne achha kiya tha, toh thoda push karo
    const suggestedSets = exerciseData.sets.map((s) => {
      const lastReps = Number(s.reps) || 0;
      const lastWeight = Number(s.weight) || 0;

      let suggestion = "";

      // LOGIC: PROGRESSIVE OVERLOAD
      if (lastReps >= 12) {
        suggestion = "Try heavy weight? ⬆️";
      } else if (lastReps < 8) {
        suggestion = `Aim for ${lastReps + 1}-${lastReps + 2} reps 🎯`;
      } else {
        suggestion = "Match last week 🛡️";
      }

      return {
        lastWeight,
        lastReps,
        suggestion,
      };
    });

    res.json({
      found: true,
      date: lastWorkout.date,
      sets: suggestedSets,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Memory Loss" });
  }
});

// 4. DELETE WORKOUT
router.delete("/:id", async (req, res) => {
  try {
    const result = await Workout.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Workout nahi mila" });

    res.json({ message: "Workout Deleted! 🗑️" });
  } catch (err) {
    res.status(500).json({ error: "Delete nahi ho paya" });
  }
});

// 5. DELETE SINGLE EXERCISE
router.delete("/:workoutId/exercise/:exerciseId", async (req, res) => {
  try {
    const { workoutId, exerciseId } = req.params;

    const updatedWorkout = await Workout.findByIdAndUpdate(
      workoutId,
      { $pull: { exercises: { _id: exerciseId } } },
      { new: true },
    );

    if (!updatedWorkout)
      return res.status(404).json({ error: "Workout nahi mila" });

    res.json(updatedWorkout);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Exercise delete nahi hui" });
  }
});

module.exports = router;
