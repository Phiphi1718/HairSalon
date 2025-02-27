const express = require('express');
const { createOrder, getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/create', authMiddleware, createOrder); // Khách hàng đặt hàng
router.get('/', authMiddleware, getAllOrders); // Chỉ admin có thể lấy danh sách đơn hàng
router.put('/update', authMiddleware, updateOrder); // Chỉ admin cập nhật đơn hàng
router.delete('/delete', authMiddleware, deleteOrder); // Chỉ admin xóa đơn hàng

module.exports = router;
