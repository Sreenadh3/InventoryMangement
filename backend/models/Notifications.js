const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: String,  // 'LOW_STOCK' | 'OVERDUE_ORDER'
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  created_at: { type: Date, default: Date.now },
  seen: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notification', NotificationSchema);
