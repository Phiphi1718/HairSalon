const pool = require('../db');

// Lấy danh sách tất cả thợ cắt tóc
exports.getAllBarbers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM barbers');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách thợ cắt tóc', error });
  }
};

// Lấy thông tin thợ cắt tóc theo ID
exports.getBarberById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM barbers WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thợ cắt tóc' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin thợ cắt tóc', error });
  }
};

// Thêm thợ cắt tóc mới
exports.createBarber = async (req, res) => {
  const { full_name, date_of_birth, experience_years, phone, address } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO barbers (full_name, date_of_birth, experience_years, phone, address) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [full_name, date_of_birth, experience_years, phone, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm thợ cắt tóc', error });
  }
};

// Cập nhật thông tin thợ cắt tóc
exports.updateBarber = async (req, res) => {
  const { id } = req.params;
  const { full_name, date_of_birth, experience_years, phone, address } = req.body;
  try {
    const result = await pool.query(
      `UPDATE barbers SET full_name = $1, date_of_birth = $2, experience_years = $3, phone = $4, address = $5 
       WHERE id = $6 RETURNING *`,
      [full_name, date_of_birth, experience_years, phone, address, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thợ cắt tóc' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật thợ cắt tóc', error });
  }
};

// Xóa thợ cắt tóc
exports.deleteBarber = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM barbers WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thợ cắt tóc' });
    }
    res.json({ message: 'Đã xóa thợ cắt tóc thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa thợ cắt tóc', error });
  }
};