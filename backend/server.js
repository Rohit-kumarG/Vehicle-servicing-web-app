const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Garage App Backend is Running!");
});
// ✅ Auth route is now active
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/garages", require("./src/routes/garage"));
app.use("/api/vehicles", require("./src/routes/vehicle"));
app.use("/api/bookings", require("./src/routes/booking"));
app.use("/api/feedback", require("./src/routes/feedback"));
app.use("/api/notifications", require("./src/routes/notification"));
app.use("/api/admin", require("./src/routes/admin"));
app.use("/api/chat", require("./src/routes/chat"));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
  });
};

startServer();
