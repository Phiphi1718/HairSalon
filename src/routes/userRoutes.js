const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary'); // Import Cloudinary
const userController = require('../controllers/userController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Cấu hình Multer để lưu file vào bộ nhớ tạm
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Các routes khác
router.get('/all', authMiddleware, userController.getAllUsers);
router.get('/:username', authMiddleware, userController.getUserByUsername);
router.put('/update/:username', authMiddleware, isAdmin, userController.updateUser);
router.delete('/delete/:username', authMiddleware, isAdmin, userController.deleteUser);

// ✅ Route cập nhật ảnh avatar (Dùng Cloudinary)
router.put('/:username/avatar', authMiddleware, upload.single('avatar'), userController.updateUserAvatar);

module.exports = router;
