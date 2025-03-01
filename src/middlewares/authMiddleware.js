const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");

    console.log("Received Authorization Header:", authHeader); // Debug

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Không có token hoặc sai định dạng!" });
    }

    const token = authHeader.split(" ")[1]; // Lấy token thực
    console.log("Extracted Token:", token); // Debug

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // Debug token data

        // Kiểm tra nếu token đã hết hạn
        const currentTime = Math.floor(Date.now() / 1000); // Chuyển sang giây
        if (decoded.exp < currentTime) {
            return res.status(401).json({ message: "Token đã hết hạn!" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error("JWT Verify Error:", error.message);
        res.status(401).json({ message: "Token không hợp lệ!" });
    }
};

const isAdmin = (req, res, next) => {
    if (!req.user || req.user.user_type_id !== 1) {
        return res.status(403).json({ message: "Bạn không có quyền admin!" });
    }
    next();
};

const authenticate = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Bạn cần đăng nhập!" });
    }
    next();
};

module.exports = { authMiddleware, isAdmin, authenticate };