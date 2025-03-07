const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const barberRoutes = require('./routes/barberRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require('./routes/reviewRoutes');
const path = require("path");


const app = express();

app.use(cors()); 
app.use(express.json());   // Parse JSON body

// Routes
app.use('/api/auth', authRoutes);  // Route cho auth (register, login)
app.use('/api/products', productRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api', barberRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);  // Định tuyến API đơn hàng
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));




// Route test
app.get('/', (req, res) => {
  res.send('🎉 Backend Haircut API đang chạy!');
});

module.exports = app;
