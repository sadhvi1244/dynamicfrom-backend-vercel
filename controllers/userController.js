import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";

// Get all users
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ name: 1 });
  const total = await User.countDocuments();

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    data: users,
  });
});

// Get single user
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `User not found with id ${req.params.id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Create user
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;

  // Check for existing email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Email already exists",
    });
  }

  const user = await User.create({ name, email, role });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
});

// Update user
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `User not found with id ${req.params.id}`,
    });
  }

  // Prevent duplicate email
  if (req.body.email && req.body.email !== user.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `User not found with id ${req.params.id}`,
    });
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
