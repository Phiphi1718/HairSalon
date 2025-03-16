const express = require('express');
const cors = require('cors');
const http = require('http');
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
const server = http.createServer(app);

// ✅ Kiểm tra Redis có tồn tại không trước khi import
let redisClient;
try {
  const redis = require('redis');
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  redisClient.on('error', (err) => console.log('🚨 Redis Error:', err));

  (async () => {
    try {
      await redisClient.connect();
      console.log('✅ Redis connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect Redis:', error);
    }
  })();
} catch (error) {
  console.warn('⚠️ Redis module not found. Running without Redis caching.');
}

// ✅ Khởi tạo Socket.io
initSocket(server);

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "https://hair-salon-forntend.vercel.app",
  "https://hair-salon-frontend.vercel.app",
];

// ✅ Kiểm tra và xác minh reCAPTCHA
const verifyRecaptcha = async (req, res, next) => {
  const { captchaToken } = req.body;
  if (!captchaToken) {
    return res.status(400).json({ message: "CAPTCHA token is required" });
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken,
        },
      }
    );

    if (!response.data.success) {
      return res.status(400).json({ message: "CAPTCHA verification failed" });
    }
    next();
  } catch (error) {
    console.error("❌ reCAPTCHA Error:", error);
    return res.status(500).json({ message: "Error verifying CAPTCHA" });
  }
};

// ✅ Middleware chặn IP khi spam
const blockIpMiddleware = async (req, res, next) => {
  if (!redisClient) return next(); // Nếu không có Redis, bỏ qua

  const ip = req.ip;
  const key = `auth_attempts:${ip}`;

  try {
    const attempts = await redisClient.incr(key);
    if (attempts === 1) {
      await redisClient.expire(key, 3600);
    }

    if (attempts > 20) {
      console.log(`🚨 IP ${ip} bị chặn do quá nhiều request`);
      return res.status(403).json({ message: "IP của bạn đã bị chặn do quá nhiều yêu cầu. Vui lòng thử lại sau." });
    }

    next();
  } catch (error) {
    console.error('❌ Redis error:', error);
    next();
  }
};

// ✅ Rate limit login và register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút.",
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ CORS Middleware
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

// ✅ Sử dụng middleware cho route auth
app.use('/api/auth', blockIpMiddleware, authLimiter, verifyRecaptcha);

// ✅ Import Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api', BarberRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);

// ✅ Route test
app.get('/', (req, res) => {
  res.send('🎉 Backend Haircut API đang chạy!');
});

app.options('*', cors());

// ✅ Xử lý lỗi PORT bị chiếm dụng
const getAvailablePort = async (port, maxAttempts = 5) => {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      server.listen(port, '0.0.0.0', () => {
        console.log(`✅ Server running on port ${port}`);
      });
      return;
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${port} bị chiếm dụng. Thử cổng mới...`);
        port += 1;
        attempts++;
      } else {
        throw error;
      }
    }
  }
  console.error('❌ Không thể tìm được cổng khả dụng.');
  process.exit(1);
};

// ✅ Lấy PORT từ biến môi trường hoặc random
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
getAvailablePort(PORT);

module.exports = app;
