import express from "express";
import dotenv from "dotenv";
import { sequelize } from "./config/database"; // ✅ notice 
import cors from "cors";
import path from 'path';
// Import routes
import { verifyTokenController } from "./middleware/auth.controller";
import userRoutes from "./routes";
dotenv.config();
const app = express();
app.use(
  cors({
    origin: "*", // frontend origin
    // credentials: false,
    // methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    // allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json()); // parse JSON requests
app.get("/auth/verify", verifyTokenController);
app.use("/api/", userRoutes);
app.use('/image', express.static(path.resolve(__dirname, 'uploads/')));

// Health check
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});
// Database connection
sequelize.authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ DB connection error:", err));
export default app;
