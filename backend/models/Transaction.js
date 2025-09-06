const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  qty: Number,
  type: { type: String, enum: ['in','out'] },
  ts: { type: Date, default: Date.now },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
