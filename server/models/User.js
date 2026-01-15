const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  height: {
    type: Number,
    default: 0,
  },
  targetWeight: {
    type: Number,
    default: 0,
  },
  dietType: {
    type: String,
    default: "Non-Veg",
  },
  // Extra Fields
  lactoseIntolerant: { type: Boolean, default: false },
  hostelOrHome: { type: String, default: "home" },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
