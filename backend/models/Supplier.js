const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: String,
  contact: String,
  phone: String,
  email: String,
});

module.exports = mongoose.model('Supplier', SupplierSchema);
