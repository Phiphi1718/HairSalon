const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { sendEmail } = require('../services/emailService');
const pool = require('../db');
require('dotenv').config();

const authController = {
  register: async (req, res) => {
    try {
      const { username, email, password, phone } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'Email không hợp lệ!' });
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email đã được sử dụng!' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create(username, email, hashedPassword, phone);

      res.status(201).json({ message: 'Đăng ký thành công!', user: newUser });
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra!' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền email và mật khẩu!' });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Email không tồn tại!' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu không đúng!' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, user_type_id: user.user_type_id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({ message: 'Đăng nhập thành công!', token });
    } catch (error) {
      console.error('Lỗi khi đăng nhập:', error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra!' });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Email không tồn tại!' });
      }

      // Tạo mật khẩu mới ngẫu nhiên
      const randomPassword = Math.random().toString(36).slice(-8); // VD: "x7f8g9k2"
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Cập nhật mật khẩu trong database
      await User.updatePassword(user.id, hashedPassword);

      // Gửi email mật khẩu mới
      await sendEmail(user.email, 'Mật khẩu mới', `Mật khẩu mới của bạn: ${randomPassword}`);

      res.json({ message: 'Mật khẩu mới đã được gửi đến email của bạn' });
    } catch (error) {
      console.error('Lỗi quên mật khẩu:', error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra!' });
    }
  },

  changePassword: async (req, res) => {
    try {
      const userId = req.user.id; // Lấy ID từ token đã giải mã
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin!' });
      }

      // Tìm user theo ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Người dùng không tồn tại!' });
      }

      // Kiểm tra mật khẩu cũ
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu cũ không chính xác!' });
      }

      // Mã hóa mật khẩu mới
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Cập nhật mật khẩu trong database
      await User.updatePassword(userId, hashedPassword);

      res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra!' });
    }
  }
};

module.exports = authController;
