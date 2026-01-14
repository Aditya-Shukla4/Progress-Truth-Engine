// Quick Test Script
const testData = {
  userId: "65a1234567890abcdef12345", // Fake ID
  currentWeight: 70,
  avgSleep: 5, // ❌ Ye fail hona chahiye (RED)
  dailyProtein: 150,
  caloriesLevel: "maintenance",
  workoutDays: 4,
  strengthTrend: "increasing",
};

fetch("http://localhost:5000/api/checkin/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(testData),
})
  .then((res) => res.json())
  .then((data) => console.log("🔥 TRUTH ENGINE SAID:", data))
  .catch((err) => console.error(err));
