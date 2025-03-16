const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { sendEmail } = require('../services/emailService');
const pool = require('../db');
require('dotenv').config();

const authController = {
  register: async (req, res) => {
    try {
      const { username, email, password, phone, captchaToken } = req.body;

      // Kiểm tra CAPTCHA (đã được xác minh bởi middleware verifyRecaptcha)
      if (!captchaToken) {
        return res.status(400).json({ message: "CAPTCHA token is required" });
      }

      // Kiểm tra xem email đã tồn tại chưa
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email đã được sử dụng!" });
      }

      // Hash mật khẩu
      const hashedPassword = await bcrypt.hash(password, 12); // Tăng cost factor lên 12

      // Tạo user mới
      const newUser = await User.create(username, email, hashedPassword, phone);
      res.status(201).json({ message: "Đăng ký thành công!", user: newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password, captchaToken } = req.body;
      console.log('Request body:', req.body);

      // Kiểm tra CAPTCHA (đã được xác minh bởi middleware verifyRecaptcha)
      if (!captchaToken) {
        return res.status(400).json({ message: "CAPTCHA token is required" });
      }

      const user = await User.findByUsername(username);
      console.log('User found:', user);

      if (!user) return res.status(400).json({ message: "Tài khoản không tồn tại!" });

      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch);

      if (!isMatch) return res.status(401).json({ message: "Mật khẩu không chính xác!" });

      const token = jwt.sign(
        { id: user.id, username: user.username, user_type_id: user.user_type_id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // Giảm thời gian sống xuống 1 giờ
      );
      console.log('Token created:', token);

      res.json({ message: "Đăng nhập thành công!", token });
    } catch (error) {
      console.error('Login error:', error.stack);
      res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
  },

  logout: async (req, res) => {
    try {
      res.json({ message: "Đăng xuất thành công!", clearToken: true });
    } catch (error) {
      console.error('Logout error:', error.stack);
      res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Email không tồn tại!' });
      }

      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      await User.updatePassword(user.id, hashedPassword);
      await sendEmail(user.email, 'Mật khẩu mới', `Mật khẩu mới của bạn: ${randomPassword}`);

      res.json({ message: 'Mật khẩu mới đã được gửi đến email của bạn' });
    } catch (error) {
      console.error('Lỗi quên mật khẩu:', error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra!' });
    }
  },

  changePassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin!' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Người dùng không tồn tại!' });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu cũ không chính xác!' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await User.updatePassword(userId, hashedPassword);

      res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra!' });
    }
  },
};

module.exports = authController;
