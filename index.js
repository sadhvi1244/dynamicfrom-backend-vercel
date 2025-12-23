import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

const app = express();

// Connect to MongoDB
connectDB().catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: "Too many requests from this IP, please try again later.",
});

// CORS configuration
const frontendUrl =
  process.env.FRONTEND_URL?.replace(/\/$/, "") || "http://localhost:5173";

app.use(
  cors({
    origin: [frontendUrl, "http://localhost:5173"],
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

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ===== ROUTES START HERE - ORDER MATTERS! =====

// 1. Root route FIRST (before everything)
app.get("/", (req, res) => {
  console.log("Root route hit!");
  res.status(200).json({
    success: true,
    message: "API is running",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
      testCors: "/api/test-cors",
    },
    timestamp: new Date().toISOString(),
  });
});

// 2. Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    environment: process.env.NODE_ENV || "production",
    frontendUrl,
    timestamp: new Date().toISOString(),
  });
});

// 3. Test CORS (specific route before /api)
app.get("/api/test-cors", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CORS is working!",
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

// 4. Rate limiting for /api routes
app.use("/api", limiter);

// 5. API routes (after specific routes)
app.use("/api", routes);

// 6. 404 handler (second to last)
app.use((req, res) => {
  console.log("404 hit for:", req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// 7. Error handler (absolute last)
app.use(errorHandler);

// Export for Vercel
export default app;
