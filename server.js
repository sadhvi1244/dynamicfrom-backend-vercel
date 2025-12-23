// ❌ DO NOT use dotenv on Vercel (use Dashboard env vars)
// import dotenv from "dotenv";
// dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 mins
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: "Too many requests from this IP, please try again later.",
});

// CORS configuration
const frontendUrl =
  process.env.FRONTEND_URL?.replace(/\/$/, "") || "http://localhost:5173";

app.use(
  cors({
    origin: [frontendUrl],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Logging only in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Apply rate limiting to all /api routes
app.use("/api", limiter);

// API routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    environment: process.env.NODE_ENV,
    frontendUrl,
    timestamp: new Date().toISOString(),
  });
});

// Test CORS endpoint
app.get("/api/test-cors", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CORS is working!",
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use(errorHandler);

// ✅ IMPORTANT FOR VERCEL
// ❌ DO NOT call app.listen()
// ✅ Just export the app
export default app;
