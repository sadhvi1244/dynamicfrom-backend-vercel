import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    icon: {
      type: String,
      trim: true,
      default: "",
    },
    tags: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });

const Category = mongoose.model("Category", categorySchema);
export default Category;
