const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// Người dùng bình thường có thể lấy thông tin dịch vụ
router.get('/', authenticate, serviceController.getAllServices);
router.get('/:name', authenticate, serviceController.getServiceByName);
router.post('/', authenticate, serviceController.createService);

// Chỉ admin mới có quyền thêm, cập nhật và xóa dịch vụ
router.put('/:name', authenticate, isAdmin, serviceController.updateServiceByName);
router.delete('/:name', authenticate, isAdmin, serviceController.deleteServiceByName);

module.exports = router;
