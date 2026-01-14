const mongoose = require("mongoose");

const TemplateSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true }, // e.g., "Push Day A"
  exercises: [
    {
      name: { type: String, required: true },
      targetMuscle: { type: String, default: "Other" },
    },
  ],
});

module.exports = mongoose.model("Template", TemplateSchema);
