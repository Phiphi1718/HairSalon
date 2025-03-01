const pool = require('../db');

const userController = {
  // Lấy tất cả người dùng
  getAllUsers: async (req, res) => {
    try {
      const result = await pool.query('SELECT username, email, phone, address, image_url, created_at FROM users');
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
      const result = await pool.query('SELECT username, email, phone, address, image_url, created_at FROM users WHERE username = $1', [username]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Lỗi khi lấy người dùng:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Cập nhật ảnh đại diện của người dùng
  updateUserAvatar: async (req, res) => {
    try {
      const { username } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: 'Không có ảnh được tải lên!' });
      }

      const imageUrl = `/uploads/${req.file.filename}`;

      const result = await pool.query(
        'UPDATE users SET image_url = $1 WHERE username = $2 RETURNING *',
        [imageUrl, username]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
      }

      res.json({ 
        message: 'Cập nhật ảnh thành công!', 
        image_url: `http://localhost:5000${imageUrl}`, // Trả về đường dẫn đầy đủ
        user: result.rows[0] 
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật ảnh:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Cập nhật thông tin người dùng
  updateUser: async (req, res) => {
    try {
      const { username } = req.params;
      const { newUsername, email, phone, address, image_url } = req.body;

      // Kiểm tra xem người dùng có tồn tại không
      const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
      }

      // Chỉ cập nhật các trường có giá trị
      const updates = [];
      const values = [];
      let queryIndex = 1;

      if (newUsername) {
        updates.push(`username = $${queryIndex}`);
        values.push(newUsername);
        queryIndex++;
      }
      if (email) {
        updates.push(`email = $${queryIndex}`);
        values.push(email);
        queryIndex++;
      }
      if (phone) {
        updates.push(`phone = $${queryIndex}`);
        values.push(phone);
        queryIndex++;
      }
      if (address) {
        updates.push(`address = $${queryIndex}`);
        values.push(address);
        queryIndex++;
      }
      if (image_url) {
        updates.push(`image_url = $${queryIndex}`);
        values.push(image_url);
        queryIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: 'Không có thông tin cần cập nhật!' });
      }

      values.push(username);

      const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE username = $${queryIndex} RETURNING *`;

      const result = await pool.query(updateQuery, values);

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