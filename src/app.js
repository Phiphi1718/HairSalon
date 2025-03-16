const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require("path");
const rateLimit = require('express-rate-limit');
const redis = require('redis');
const axios = require('axios');
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

// Khởi tạo Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

// Khởi tạo Socket.io
initSocket(server);

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "https://hair-salon-forntend.vercel.app",
  "https://hair-salon-frontend.vercel.app",
];

// Middleware để xác minh reCAPTCHA
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

    const { success } = response.data;
    if (!success) {
      return res.status(400).json({ message: "CAPTCHA verification failed" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error verifying CAPTCHA" });
  }
};

// Middleware để kiểm tra và chặn IP
const blockIpMiddleware = async (req, res, next) => {
  const ip = req.ip;
  const key = `auth_attempts:${ip}`;

  try {
    const attempts = await redisClient.incr(key);
    if (attempts === 1) {
      await redisClient.expire(key, 3600);
    }

    if (attempts > 20) {
      console.log(`IP ${ip} blocked due to too many attempts`);
      return res.status(403).json({ message: "IP của bạn đã bị chặn do quá nhiều yêu cầu. Vui lòng thử lại sau." });
    }

    next();
  } catch (error) {
    console.error('Redis error:', error);
    next();
  }
};

// Rate limiting cho login và register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({
  origin: function (origin, callback) {
    console.log("CORS Request Origin:", origin);
    if (!origin) {
      console.log("No origin provided, allowing request");
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      console.log(`Origin ${origin} allowed for HTTP`);
      return callback(null, origin);
    } else {
      console.log(`CORS Error: Origin ${origin} not allowed`);
      return callback(new Error(`CORS Error: Origin ${origin} not allowed`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Áp dụng middleware cho route auth
app.use('/api/auth', blockIpMiddleware, authLimiter, verifyRecaptcha);

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

app.options('*', cors());


module.exports = app;
