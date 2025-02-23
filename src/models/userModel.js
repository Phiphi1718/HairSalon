const pool = require('../db'); // Đảm bảo bạn import đúng kết nối database

const User = {
     // Tạo user mới
  create: async (username, email, hashedPassword, phone) => {
    const result = await pool.query(
      `INSERT INTO users (username, email, password, phone, user_type_id) 
       VALUES ($1, $2, $3, $4, 2) RETURNING *`, // 2 là ID mặc định cho khách hàng
      [username, email, hashedPassword, phone]
    );
    return result.rows[0];
  },
    // 🔍 Tìm user theo email
  findByEmail: async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null; // Trả về user nếu có
  },
  // Hàm tìm user theo ID
  findById: async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null; // Trả về user nếu tìm thấy
  },

  // Hàm cập nhật mật khẩu
  updatePassword: async (id, hashedPassword) => {
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
  }
};

// Export chuẩn
module.exports = User;
