import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  filterProducts,
} from "../controllers/productController.js";

const router = express.Router();

// 1. Static / filter routes first
router.get("/search/filter", filterProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/stats/summary", async (req, res) => {
  try {
    const [totalProducts, totalCategories, inStockCount, outOfStockCount] =
      await Promise.all([
        Product.countDocuments(),
        Category.countDocuments(),
        Product.countDocuments({ inStock: true }),
        Product.countDocuments({ inStock: false }),
      ]);

    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          avgPrice: { $avg: "$price" },
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalCategories,
        stockStatus: {
          inStock: inStockCount,
          outOfStock: outOfStockCount,
        },
        priceStats: priceStats[0] || {},
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 2. Dynamic route for single product (after static routes)
router.get("/:id", getProduct);

// 3. General routes
router.get("/", getProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
