const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');

router.post('/', createOrder);    // Thêm đơn hàng
router.get('/', getAllOrders);    // Lấy danh sách đơn hàng
router.put('/', updateOrder);     // Cập nhật đơn hàng
router.delete('/', deleteOrder);  // Xóa đơn hàng

module.exports = router;
