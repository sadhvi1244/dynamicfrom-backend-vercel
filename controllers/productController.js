import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";
import asyncHandler from "../middleware/asyncHandler.js";

/* =========================
   GET ALL PRODUCTS
========================= */
export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .populate("category", "name description")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

/* =========================
   GET SINGLE PRODUCT
========================= */
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name description"
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

/* =========================
   CREATE PRODUCT
========================= */
export const createProduct = asyncHandler(async (req, res) => {
  const categoryExists = await Category.findById(req.body.category);
  if (!categoryExists) {
    return res.status(400).json({
      success: false,
      message: "Invalid category",
    });
  }

  const product = await Product.create(req.body);

  const populatedProduct = await Product.findById(product._id).populate(
    "category",
    "name description"
  );

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: populatedProduct,
  });
});

/* =========================
   UPDATE PRODUCT
========================= */
export const updateProduct = asyncHandler(async (req, res) => {
  if (req.body.category) {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("category", "name description");

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

/* =========================
   DELETE PRODUCT
========================= */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const orderCount = await Order.countDocuments({
    "items.product": req.params.id,
  });

  if (orderCount > 0) {
    return res.status(400).json({
      success: false,
      message: "Product exists in orders and cannot be deleted",
    });
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

/* =========================
   PRODUCTS BY CATEGORY
========================= */
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  const products = await Product.find({
    category: req.params.categoryId,
  }).populate("category", "name description");

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

/* =========================
   FILTER PRODUCTS  ✅ REQUIRED
========================= */
export const filterProducts = asyncHandler(async (req, res) => {
  const { minPrice, maxPrice, category, rating, inStock } = req.query;
  const query = {};

  // ✅ Price filter, prevent negative minPrice
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined)
      query.price.$gte = Math.max(0, Number(minPrice));
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  if (category) query.category = category;
  if (rating) query.rating = { $gte: Number(rating) };
  if (inStock !== undefined) query.inStock = inStock === "true";

  const products = await Product.find(query)
    .populate("category", "name description")
    .sort({ price: 1 });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});
