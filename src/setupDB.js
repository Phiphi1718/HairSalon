const pool = require("./db");

const createTables = async () => {
  try {
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS address TEXT;
    `);
    console.log("✅ Đã thêm cột 'address' vào bảng 'users' (nếu chưa tồn tại)!");
  } catch (error) {
    console.error("❌ Lỗi khi thêm cột:", error);
  } finally {
    pool.end(); // Đóng kết nối sau khi chạy xong
  }
};

// Chạy lệnh tạo bảng
createTables();
