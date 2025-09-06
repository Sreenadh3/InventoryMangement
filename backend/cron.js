const cron = require('node-cron');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Notification = require('./models/Notification');

async function checkAlerts() {
  try {
    // Low stock
    const lowStock = await Product.find({ $expr: { $lte: ["$stock","$reorder_point"] } });
    for (const p of lowStock) {
      await Notification.updateOne(
        { type:'LOW_STOCK', product_id: p._id, seen:false },
        { $setOnInsert: { type:'LOW_STOCK', product_id: p._id, created_at:new Date(), seen:false } },
        { upsert:true }
      );
    }

    // Overdue orders
    const now = new Date();
    const overdue = await Order.find({ status:'pending', eta: { $lt: now } });
    for (const o of overdue) {
      o.status = 'overdue';
      await o.save();
      await Notification.updateOne(
        { type:'OVERDUE_ORDER', order_id:o._id, seen:false },
        { $setOnInsert: { type:'OVERDUE_ORDER', order_id:o._id, created_at:new Date(), seen:false } },
        { upsert:true }
      );
    }
  } catch (err) {
    console.error('Cron error:', err);
  }
}

function startCron() {
  cron.schedule('*/5 * * * *', checkAlerts); // every 5 minutes
  checkAlerts(); // run once on startup
}

module.exports = { startCron };
