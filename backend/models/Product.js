const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  reorder_point: { type: Number, default: 0 }
});

module.exports = mongoose.model('Product', ProductSchema);
