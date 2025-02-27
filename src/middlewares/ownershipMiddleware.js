const pool = require("../db");

const authorizeOwnership = async (req, res, next) => {
    const { id } = req.params;
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

    if (!user.rows.length) return res.status(404).json({ message: "Không tìm thấy dữ liệu" });

    if (user.rows[0].id !== req.user.id && req.user.user_type_id !== 1) {
        return res.status(403).json({ message: "Bạn không có quyền truy cập tài nguyên này!" });
    }

    req.object = user.rows[0];
    next();
};

module.exports = { authorizeOwnership };
