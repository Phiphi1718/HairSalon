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

async getAllWithUser() {
    const query = `
      SELECT 
        r.id, 
        r.user_id, 
        r.barber_id, 
        r.rating, 
        r.comment, 
        r.created_at,
        u.username,
        COALESCE(u.image_url, '/default-avatar.png') AS image_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
},

 async getByUsernameWithUser(username) {
    const query = `
      SELECT 
        r.id, 
        r.user_id, 
        r.barber_id, 
        r.rating, 
        r.comment, 
        r.created_at,
        u.username,
        COALESCE(u.image_url, '/default-avatar.png') AS image_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE u.username = $1
      ORDER BY r.created_at DESC
    `;
    const { rows } = await pool.query(query, [username]);
    return rows;
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