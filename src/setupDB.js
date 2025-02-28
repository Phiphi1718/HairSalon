const pool = require('./db');

const createTables = async () => {
  await pool.query(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);
  `);
  console.log("✅ Đã thêm cột 'image_url' vào bảng 'users' (nếu chưa tồn tại)!");
  
};

// Chạy lệnh tạo bảng
createTables();
