const express = require('express');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const { authenticate } = require('../middleware/auth');
const { permit } = require('../middleware/rbac');

const router = express.Router();

// List products with optional filters
router.get('/', authenticate, async (req,res)=>{
  const { search, category, stockStatus } = req.query;
  let query = {};
  if (search) query.name = { $regex: search, $options: 'i' };
  if (category) query.category = category;
  if (stockStatus === 'low') query.$expr = { $lte: ['$stock','$reorder_point'] };
  if (stockStatus === 'out') query.stock = 0;
  const products = await Product.find(query).limit(200);
  res.json(products);
});

// Create
router.post('/', authenticate, permit('ADMIN','MANAGER'), async (req,res)=>{
  const { name, category, stock=0, reorder_point=0 } = req.body;
  const p = new Product({ name, category, stock, reorder_point });
  await p.save();
  res.json(p);
});

// Stock in
router.post('/:id/stock-in', authenticate, async (req,res)=>{
  const { qty } = req.body;
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'not found' });
  p.stock += qty;
  await p.save();
  await Transaction.create({ product_id: p._id, qty, type:'in', user_id: req.user.id });
  res.json(p);
});

// Stock out
router.post('/:id/stock-out', authenticate, async (req,res)=>{
  const { qty } = req.body;
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'not found' });
  if (p.stock < qty) return res.status(400).json({ error: 'insufficient stock' });
  p.stock -= qty;
  await p.save();
  await Transaction.create({ product_id: p._id, qty, type:'out', user_id: req.user.id });
  res.json(p);
});

module.exports = router;
