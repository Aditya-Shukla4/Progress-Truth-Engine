const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// 👇 1. IMPORT (Ye line check kar, upar honi chahiye)
const userRoutes = require("./routes/userRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const templateRoutes = require("./routes/templateRoutes"); // 👈 YE ADD KAR

const app = express();
app.use(cors());
app.use(express.json());

// 👇 2. ENABLE ROUTE (Ye line check kar, neeche honi chahiye)
app.use("/api/user", userRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/template", templateRoutes); // 👈 YE BHI ADD KAR (Iske bina 404 aayega)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(5000, () => console.log("Server running on port 5000"));
