import Category from "../models/Category.js";
import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/Product.js";
import APIFeatures from "../utils/apiFeatures.js";

// Get all categories
export const getCategories = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Category.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .search(["name", "description"]);

  const categories = await features.query;
  const total = await Category.countDocuments();

  res.status(200).json({
    success: true,
    count: categories.length,
    total,
    data: categories,
  });
});

// Get single category
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: `Category not found with id of ${req.params.id}`,
    });
  }

  res.status(200).json({ success: true, data: category });
});

// Create category
export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

// Update category
export const updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: `Category not found with id of ${req.params.id}`,
    });
  }

  // Check if name is being changed and if it already exists
  if (req.body.name && req.body.name !== category.name) {
    const existingCategory = await Category.findOne({ name: req.body.name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

// Delete category
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: `Category not found with id of ${req.params.id}`,
    });
  }

  const productCount = await Product.countDocuments({
    category: req.params.id,
  });
  if (productCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete category. It has ${productCount} product(s) associated.`,
    });
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

// Get category statistics
export const getCategoryStats = asyncHandler(async (req, res) => {
  const totalCategories = await Category.countDocuments();
  const activeCategories = await Category.countDocuments({ isActive: true });
  const inactiveCategories = totalCategories - activeCategories;

  res.status(200).json({
    success: true,
    data: {
      totalCategories,
      activeCategories,
      inactiveCategories,
    },
  });
});
