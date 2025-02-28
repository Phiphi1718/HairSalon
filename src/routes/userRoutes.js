const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const userController = require('../controllers/userController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Đường dẫn thư mục lưu ảnh
const uploadDir = path.join(__dirname, '..', 'uploads');

// Kiểm tra và tạo thư mục "uploads/" nếu chưa tồn tại
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer để lưu file vào thư mục "uploads/"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Các routes khác
router.get('/all', authMiddleware, userController.getAllUsers);
router.get('/:username', authMiddleware, userController.getUserByUsername);
router.put('/update/:username', authMiddleware, isAdmin, userController.updateUser);
router.delete('/delete/:username', authMiddleware, isAdmin, userController.deleteUser);

// ✅ Route cập nhật ảnh avatar (Tự động tạo thư mục "uploads/")
router.put('/:username/avatar', authMiddleware, upload.single('avatar'), userController.updateUserAvatar);

module.exports = router;
