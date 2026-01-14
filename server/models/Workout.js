const mongoose = require("mongoose");

const WorkoutSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true, // Kiska workout hai?
  },
  date: {
    type: Date,
    default: Date.now, // Kab kiya?
  },
  workoutName: {
    type: String, // e.g., "Push Day" or "Leg Day"
    required: true,
  },
  exercises: [
    {
      name: { type: String, required: true }, // e.g., "Bench Press"
      sets: [
        {
          reps: { type: Number, required: true },
          weight: { type: Number, required: true }, // kg mein
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Workout", WorkoutSchema);
