const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  height: { type: Number, required: true }, // cm
  dietType: { type: String, enum: ["veg", "eggs", "whey"], required: true },
  lactoseIntolerant: { type: Boolean, default: false },
  hostelOrHome: { type: String, enum: ["hostel", "home"] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
