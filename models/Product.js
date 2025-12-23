import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    material: { type: String, required: true, trim: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, maxlength: 2000 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, default: 1 },
    image: { type: String, trim: true, default: "" },
    inStock: { type: Boolean, default: true },
    releaseDate: { type: Date },
    materials: [materialSchema],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual populate
productSchema.virtual("categoryDetails", {
  ref: "Category",
  localField: "category",
  foreignField: "_id",
  justOne: true,
});

const Product = mongoose.model("Product", productSchema);

export default Product;
