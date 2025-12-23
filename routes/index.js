import express from "express";
const router = express.Router();

// Import route files
import userRoutes from "./users.js";
import categoryRoutes from "./categories.js";
import productRoutes from "./products.js";
import orderRoutes from "./orders.js";

// Route files
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);

export default router;
