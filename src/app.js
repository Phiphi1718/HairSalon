const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require("path");
const { initSocket } = require("./socket");

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const BarberRoutes = require('./routes/barberRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const server = http.createServer(app);

// Khởi tạo Socket.io
initSocket(server);

// Middleware
const allowedOrigins = [
  "http://localhost:3000", // Local development
  "https://hair-salon-forntend.vercel.app", // Frontend production (giữ nguyên tên domain bạn cung cấp)
  "https://hair-salon-frontend.vercel.app", // Thêm biến thể có thể
];

app.use(cors({
  origin: function (origin, callback) {
    console.log("CORS Request Origin:", origin); // Log để debug
    if (!origin) return callback(null, true); // Cho phép request không có origin (như Postman)
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin); // Trả về origin cụ thể để tránh lỗi
    } else {
      console.log(`CORS Error: Origin ${origin} not allowed`);
      return callback(new Error(`CORS Error: Origin ${origin} not allowed`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Thêm OPTIONS để hỗ trợ preflight
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"], // Thêm các header cho preflight
  credentials: true,
  optionsSuccessStatus: 200, // Xử lý thành công preflight request
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

// Route test
app.get('/', (req, res) => {
  res.send('🎉 Backend Haircut API đang chạy!');
});

// Xử lý preflight request cho tất cả route
app.options('*', cors()); // Cho phép preflight cho mọi route

module.exports = app;
