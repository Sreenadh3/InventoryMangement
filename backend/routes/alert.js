const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /alerts/low-stock
router.get('/low-stock', authenticate, async (req,res)=>{
  const products = await Product.find({ $expr: { $lte: ["$stock","$reorder_point"] } });
  res.json(products);
});

// GET /alerts/overdue-orders
router.get('/overdue-orders', authenticate, async (req,res)=>{
  const now = new Date();
  const overdue = await Order.find({ status:'pending', eta: { $lt: now } });
  res.json(overdue);
});

// GET /alerts/notifications (optional, show unread)
router.get('/notifications', authenticate, async (req,res)=>{
  const notes = await Notification.find({ seen:false }).sort({ created_at:-1 });
  res.json(notes);
});

module.exports = router;
