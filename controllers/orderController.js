import Order from "../models/Order.js";
import Product from "../models/Product.js";
import asyncHandler from "../middleware/asyncHandler.js";
import APIFeatures from "../utils/apiFeatures.js";

// GET all orders
export const getOrders = asyncHandler(async (req, res) => {
  const features = new APIFeatures(
    Order.find().populate("items.product", "name price image"),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .search(["customer"]);

  const orders = await features.query;
  const total = await Order.countDocuments();

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    data: orders,
  });
});

// GET single order
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "items.product",
    "name price image"
  );

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.status(200).json({ success: true, data: order });
});

// CREATE order
export const createOrder = asyncHandler(async (req, res) => {
  const { customer, items, location } = req.body;

  if (!items || !items.length) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Order must contain at least one item",
      });
  }

  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return res
        .status(404)
        .json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
    }
    if (!product.inStock) {
      return res
        .status(400)
        .json({ success: false, message: `${product.name} is out of stock` });
    }

    const quantity = Math.min(item.quantity || 1, 10);
    totalAmount += product.price * quantity;

    orderItems.push({
      product: product._id,
      quantity,
      price: product.price,
    });
  }

  const order = await Order.create({
    orderNumber: `ORD-${Date.now()}`,
    customer,
    items: orderItems,
    amount: totalAmount,
    status: "pending",
    location: location || null,
  });

  const populatedOrder = await Order.findById(order._id).populate(
    "items.product",
    "name price image"
  );

  res
    .status(201)
    .json({
      success: true,
      message: "Order created successfully",
      data: populatedOrder,
    });
});

// UPDATE order status
export const updateOrder = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "shipped", "delivered", "cancelled"];

  if (!allowed.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid order status" });
  }

  const order = await Order.findById(req.params.id);
  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });

  order.status = status;
  await order.save();

  res
    .status(200)
    .json({ success: true, message: "Order status updated", data: order });
});

// DELETE order (only pending)
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });

  if (order.status !== "pending") {
    return res
      .status(400)
      .json({ success: false, message: "Only pending orders can be deleted" });
  }

  await order.deleteOne();
  res
    .status(200)
    .json({ success: true, message: "Order deleted successfully" });
});

// GET recent orders
export const getRecentOrders = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const orders = await Order.find()
    .populate("items.product", "name price image")
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({ success: true, count: orders.length, data: orders });
});

// GET order statistics
export const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
    { $project: { status: "$_id", count: 1, totalAmount: 1, _id: 0 } },
  ]);

  res.status(200).json({ success: true, data: stats });
});

// GET orders by status
export const getOrdersByStatus = asyncHandler(async (req, res) => {
  const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
  const { status } = req.params;

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  const orders = await Order.find({ status })
    .populate("items.product", "name price image")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: orders.length, data: orders });
});

// GET orders by customer
export const getOrdersByCustomer = asyncHandler(async (req, res) => {
  const { customerName } = req.params;
  const orders = await Order.find({
    customer: { $regex: customerName, $options: "i" },
  })
    .populate("items.product", "name price image")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: orders.length, data: orders });
});
