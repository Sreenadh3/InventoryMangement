const express = require('express');
const axios = require('axios');
require('dotenv').config();

const { authenticate } = require('../middleware/auth');

const router = express.Router();
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';

router.get('/:id/forecast', authenticate, async (req, res) => {
  const { id } = req.params;
  const { horizon = 7 } = req.query;

  try {
    const response = await axios.get(`${ML_URL}/forecast`, {
      params: { product_id: id, horizon }
    });
    res.json(response.data);
  } catch (err) {
    console.error('ML proxy error:', err.message);
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    res.status(500).json({ error: 'ML service unavailable' });
  }
});

module.exports = router;
