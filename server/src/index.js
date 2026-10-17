import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb } from "./config/db.js";
import apiRoutes from "./routes/apiRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Middleware
app.use(
  cors({
    origin: CLIENT_URL === "*" ? "*" : [CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Node server with Turso database connection is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes matching schema.md (Product, User, Order)
app.use("/api", apiRoutes);

// Retain legacy itemRoutes for compatibility
app.use("/api", itemRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error occurred",
  });
});

// Initialize database schema and start server
async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Products API: http://localhost:${PORT}/api/products`);
    console.log(`📡 Users API: http://localhost:${PORT}/api/users`);
    console.log(`📡 Orders API: http://localhost:${PORT}/api/orders`);
  });
}

startServer();
