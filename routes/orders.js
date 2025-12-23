import express from "express";
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStats,
  getRecentOrders,
  getOrdersByStatus,
  getOrdersByCustomer,
} from "../controllers/orderController.js";

const router = express.Router();

// --- SPECIFIC ROUTES ---
router.get("/status/:status", getOrdersByStatus);
router.get("/customer/:customerName", getOrdersByCustomer);
router.get("/recent/:limit", getRecentOrders);
router.get("/stats/summary", getOrderStats);

// --- GENERIC ROUTES ---
router.get("/", getOrders);
router.get("/:id", getOrder);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;
