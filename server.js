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

// ✅ FIX: Disable Helmet's contentSecurityPolicy for Vercel
app.use(
  helmet({
    contentSecurityPolicy: false,
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

// ✅ FIX: Change from middleware to direct route handler
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
      testCors: "/api/test-cors",
      users: "/api/users",
      categories: "/api/categories",
      products: "/api/products",
      orders: "/api/orders",
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    environment: process.env.NODE_ENV || "production",
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

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: "Too many requests from this IP, please try again later.",
});

// Apply rate limiting and routes
app.use("/api", limiter, routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Error handler
app.use(errorHandler);

// Export for Vercel
export default app;
