const express = require('express');
const cors = require('cors');
const path = require("path");
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const { initSocket } = require("./socket");

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const BarberRoutes = require('./routes/barberRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "https://hair-salon-forntend.vercel.app",
  "https://hair-salon-frontend.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, origin);
    return callback(new Error(`CORS Error: Origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api', BarberRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.send('🎉 Backend Haircut API đang chạy!');
});

module.exports = app;
