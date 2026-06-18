const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

dotenv.config();

const app = express();

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://garage-wala.vercel.app",
]);

const isPrivateNetworkOrigin = (origin) =>
  /^http:\/\/(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+):5173$/.test(
    origin,
  );

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || isPrivateNetworkOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
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
