const express = require('express');
const multer = require('multer');
const userController = require('../controllers/userController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Cấu hình Multer để upload ảnh vào thư mục "uploads/"
const upload = multer({ dest: 'uploads/' });

// Các routes khác
router.get('/all', authMiddleware, userController.getAllUsers);
router.get('/:username', authMiddleware, userController.getUserByUsername);
router.put('/update/:username', authMiddleware, isAdmin, userController.updateUser);
router.delete('/delete/:username', authMiddleware, isAdmin, userController.deleteUser);

// ✅ Route cập nhật ảnh avatar vào image_url
router.put('/update-avatar/:username', authMiddleware, upload.single('avatar'), userController.updateUserAvatar);

module.exports = router;
