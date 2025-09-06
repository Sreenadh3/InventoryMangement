const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  qty: Number,
  eta: Date,
  status: { type: String, enum: ['pending','shipped','delivered','overdue'], default: 'pending' }
});

module.exports = mongoose.model('Order', OrderSchema);
