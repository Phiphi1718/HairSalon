const pool = require('../db'); // Đảm bảo bạn import đúng kết nối database

const User = {
  // 🔹 Tạo user mới
create: async (username, email, hashedPassword, phone) => {
    const result = await pool.query(
      `INSERT INTO users (username, email, password, phone, user_type_id) 
       VALUES ($1, $2, $3, $4, 2) RETURNING *`, // Không insert `id`
      [username, email, hashedPassword, phone]
    );
    return result.rows[0];
  },

  // 🔍 Tìm user theo username
  findByUsername: async (username) => {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null; // Trả về user nếu có
  },

  // 🔍 Tìm user theo email
  findByEmail: async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null; // Trả về user nếu có
  },

  // 🔍 Tìm user theo ID
  findById: async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null; // Trả về user nếu tìm thấy
  },

  // 🔑 Cập nhật mật khẩu
  updatePassword: async (id, hashedPassword) => {
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
  },

  getAllUsers: async () => {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
  },

  // Lấy người dùng theo username
   getUserByUsername : async (req, res) => {
    try {
      const { username } = req.params;
      const requestUser = req.user.username; // Username của user từ token
      const isAdmin = req.user.user_type_id === 1;
  
      // Nếu không phải admin, chỉ cho phép lấy thông tin của chính mình
      if (!isAdmin && username !== requestUser) {
        return res.status(403).json({ message: "Bạn không có quyền truy cập thông tin người dùng này!" });
      }
  
      const user = await User.findByUsername(username);
      if (!user) return res.status(404).json({ message: "Người dùng không tồn tại!" });
  
      // Chỉ admin mới có thể thấy đầy đủ thông tin
      const userData = {
        username: user.username,
        phone: user.phone,
        created_at: user.created_at,
        ...(isAdmin && { email: user.email }) // Chỉ thêm email nếu là admin
      };
  
      res.status(200).json(userData);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },
  

  // Cập nhật thông tin người dùng
  updateUser: async (id, { username, email, phone }) => {
    const result = await pool.query(
      `UPDATE users 
       SET username = $1, email = $2, phone = $3
       WHERE id = $4 
       RETURNING *`,
      [username, email, phone, id]
    );
    return result.rows[0];
  },

  // Xóa người dùng theo ID
  deleteUser: async (id) => {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  }
};


module.exports = User;