const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// IMPORT ROUTES
const userRoutes = require("./routes/userRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const templateRoutes = require("./routes/templateRoutes");
const checkinRoutes = require("./routes/checkInRoutes"); // 👈 NEW ADDITION ✅

const app = express();
app.use(cors());
app.use(express.json());

// ENABLE ROUTES
app.use("/api/user", userRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/template", templateRoutes);
app.use("/api/checkin", checkinRoutes); // 👈 NEW CONNECTION ✅

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(5000, () => console.log("Server running on port 5000"));
