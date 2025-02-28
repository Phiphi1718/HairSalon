const pool = require('../db');

const userController = {
  // Lấy tất cả người dùng
  getAllUsers: async (req, res) => {
    try {
      const result = await pool.query('SELECT username, email, phone, image_url, created_at FROM users');
      res.json(result.rows);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Lấy người dùng theo username
  getUserByUsername: async (req, res) => {
    try {
      const { username } = req.params;
      const result = await pool.query('SELECT username, email, phone, image_url, created_at FROM users WHERE username = $1', [username]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Lỗi khi lấy người dùng:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  updateUserAvatar: async (req, res) => {
    try {
      const { username } = req.params;

      // Kiểm tra xem người dùng có tải file lên không
      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng chọn một ảnh để upload!' });
      }

      // Lưu đường dẫn file vào database (cột image_url)
      const imageUrl = `/uploads/${req.file.filename}`;

      const result = await pool.query(
        'UPDATE users SET image_url = $1 WHERE username = $2 RETURNING *',
        [imageUrl, username]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
      }

      res.json({ message: 'Cập nhật avatar thành công!', user: result.rows[0] });
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật avatar:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Cập nhật thông tin người dùng theo username
  updateUser: async (req, res) => {
    try {
      const { username } = req.params;
      const { newUsername, email, phone, image_url } = req.body;

      const result = await pool.query(
        'UPDATE users SET username = $1, email = $2, phone = $3, image_url = $4 WHERE username = $5 RETURNING *',
        [newUsername, email, phone, image_url, username]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
      }

      res.json({ message: 'Cập nhật thành công!', user: result.rows[0] });
    } catch (error) {
      console.error('Lỗi khi cập nhật người dùng:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Xóa người dùng theo username
  deleteUser: async (req, res) => {
    try {
      const { username } = req.params;
      const result = await pool.query('DELETE FROM users WHERE username = $1 RETURNING *', [username]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
      }

      res.json({ message: 'Xóa người dùng thành công!', user: result.rows[0] });
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },
};

module.exports = userController;