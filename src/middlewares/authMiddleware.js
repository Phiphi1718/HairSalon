const jwt = require('jsonwebtoken');
const pool = require('../db');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Không có token, truy cập bị từ chối!' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token không hợp lệ!' });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.username) {
            return res.status(403).json({ message: 'Không xác định được người dùng!' });
        }

        const { username } = req.user;
        const result = await pool.query('SELECT user_type_id FROM users WHERE username = $1', [username]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Người dùng không tồn tại!' });
        }

        const userTypeId = result.rows[0].user_type_id;

        if (userTypeId !== 1) {
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này!' });
        }

        next();
    } catch (error) {
        console.error('Lỗi khi kiểm tra quyền admin:', error);
        res.status(500).json({ message: 'Lỗi server khi kiểm tra quyền' });
    }
};

module.exports = { authMiddleware, isAdmin };
