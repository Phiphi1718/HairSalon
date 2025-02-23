const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Kiểm tra xem có token không
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không có token, quyền truy cập bị từ chối!' });
  }

  // Tách token từ header (loại bỏ chữ "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Lưu thông tin user vào request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ!' });
  }
};

module.exports = authMiddleware;
