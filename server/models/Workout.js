const mongoose = require("mongoose");

const WorkoutSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  workoutName: { type: String, required: true },
  exercises: [
    {
      name: { type: String, required: true },
      targetMuscle: { type: String, default: "Other" }, // 👈 YE WALI LINE ADD KAR
      sets: [
        {
          reps: { type: Number, required: true },
          weight: { type: Number, required: true },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Workout", WorkoutSchema);
