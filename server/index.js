require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const checkInRoutes = require("./routes/checkInRoutes");
const app = express();
const port = process.env.PORT || 5000;
const userRoutes = require("./routes/userRoutes");

// Middleware
app.use(express.json());
app.use(cors());
app.use("/api/checkin", checkInRoutes);
app.use("/api/user", userRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("🔥 Progress Truth Engine Backend is ALIVE & CONNECTED!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
