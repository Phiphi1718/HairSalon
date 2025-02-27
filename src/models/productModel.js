const pool = require('../db'); // Kết nối database

const Product = {
  // 🔹 Lấy tất cả sản phẩm
  getAll: async () => {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows;
  },

  // 🔹 Tìm sản phẩm theo TÊN
  getByName: async (name) => {
    const result = await pool.query('SELECT * FROM products WHERE LOWER(name) = LOWER($1)', [name]);
    return result.rows[0] || null;
  },

  // 🔹 Thêm sản phẩm mới
  create: async ({ name, description, price, stock, image_url }) => {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, stock, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, stock, image_url]
    );
    return result.rows[0];
  },

  // 🔹 Cập nhật sản phẩm theo TÊN
  updateByName: async (name, { description, price, stock, image_url }) => {
    const result = await pool.query(
      'UPDATE products SET description = $1, price = $2, stock = $3, image_url = $4 WHERE LOWER(name) = LOWER($5) RETURNING *',
      [description, price, stock, image_url, name]
    );
    return result.rows[0] || null;
  },

  // 🔹 Xóa sản phẩm theo TÊN
  deleteByName: async (name) => {
    const result = await pool.query('DELETE FROM products WHERE LOWER(name) = LOWER($1) RETURNING *', [name]);
    return result.rows[0] || null;
  }
};

module.exports = Product;