import express from "express";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
} from "../controllers/categoryController.js";

const router = express.Router();

// STATIC routes first
router.get("/stats/count", getCategoryStats);

// Then dynamic routes
router.get("/", getCategories);
router.get("/:id", getCategory);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
