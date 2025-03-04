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
      
      // Kiểm tra xem email đã tồn tại chưa
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email đã được sử dụng!" });
      }

      // Hash mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo user mới
      const newUser = await User.create(username, email, hashedPassword, phone);
      res.status(201).json({ message: "Đăng ký thành công!", user: newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // Đăng nhập
 login: async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Request body:', req.body); // Log dữ liệu gửi từ frontend

        const user = await User.findByUsername(username);
        console.log('User found:', user); // Log kết quả tìm user

        if (!user) return res.status(400).json({ message: "Tài khoản không tồn tại!" });

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch); // Log kết quả so sánh password

        if (!isMatch) return res.status(401).json({ message: "Mật khẩu không chính xác!" });

        const token = jwt.sign(
            { id: user.id, username: user.username, user_type_id: user.user_type_id },
            process.env.JWT_SECRET,
            { expiresIn: "1m" }
        );
        console.log('Token created:', token); // Log token

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );
        console.log('Refresh token created:', refreshToken); // Log refresh token

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ message: "Đăng nhập thành công!", token });
    } catch (error) {
        console.error('Login error:', error.stack); // In stack trace đầy đủ
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
},
    // Làm mới token khi hết hạn
    refreshToken: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) return res.status(403).json({ message: "Không có Refresh Token!" });

            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) return res.status(403).json({ message: "Refresh Token không hợp lệ!" });

                // Tạo token mới
                const token = jwt.sign(
                    { id: decoded.id },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );

                res.json({ token });
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server!" });
        }
    },

    // Đăng xuất (Xóa refresh token)
    logout: async (req, res) => {
        res.clearCookie("refreshToken");
        res.json({ message: "Đăng xuất thành công!" });
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
