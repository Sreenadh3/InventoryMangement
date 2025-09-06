const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const forecastRoutes = require('./routes/forecast');

const { connectDB } = require('./db');
const authRoutes = require('./auth');
const productsRoutes = require('./routes/products');
const alertsRoutes = require('./routes/alerts');
const { startCron } = require('./cron');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/products', productsRoutes);
app.use('/alerts', alertsRoutes);
app.use('/products', forecastRoutes);
app.get('/', (req,res)=> res.send({ ok: true }));

const PORT = process.env.PORT || 4000;
connectDB().then(()=>{
  app.listen(PORT, ()=> {
    console.log(`Backend running on port ${PORT}`);
    startCron();
  });
});
