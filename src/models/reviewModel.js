const pool = require('../db');

const Review = {
  async create(user_id, barber_id, rating, comment) {
    const result = await pool.query(
      `INSERT INTO reviews (user_id, barber_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *;`,
      [user_id, barber_id, rating, comment]
    );
    return result.rows[0];
  },

  async getAll() {
    const result = await pool.query('SELECT * FROM reviews;');
    return result.rows;
  },

  async getByUsername(username) {
    const result = await pool.query(
      `SELECT r.* FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE u.username = $1;`,
      [username]
    );
    return result.rows;
  },

  async update(id, rating, comment) {
    const result = await pool.query(
      `UPDATE reviews SET rating = $2, comment = $3, updated_at = NOW()
       WHERE id = $1 RETURNING *;`,
      [id, rating, comment]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM reviews WHERE id = $1;', [id]);
    return { message: 'Review deleted' };
  }
};

module.exports = Review;