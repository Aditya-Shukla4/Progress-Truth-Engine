const mongoose = require("mongoose");

const CheckInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  weekStartDate: { type: Date, default: Date.now },

  // User Inputs
  currentWeight: { type: Number, required: true },
  avgSleep: { type: Number, required: true },
  dailyProtein: { type: Number, required: true },
  caloriesLevel: { type: String, enum: ["deficit", "maintenance", "surplus"] },
  workoutDays: { type: Number, required: true },
  strengthTrend: { type: String, enum: ["increasing", "same", "decreasing"] },

  // Truth Engine Output (Stored History)
  status: { type: String, enum: ["RED", "YELLOW", "GREEN"] },
  resultMessage: { type: String },
  actionStep: { type: String },
});

module.exports = mongoose.model("CheckIn", CheckInSchema);
