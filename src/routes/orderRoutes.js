const express = require('express');
const { 
  createOrder, 
  createReview, 
  getAllOrders, 
  getOrdersByUsername, 
  updateOrder, 
  deleteOrder,
  getReviewsByProduct 
} = require('../controllers/orderController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// 🟢 Tạo đơn hàng mới (Khách hàng)
router.post('/create', authMiddleware, createOrder);

// 🟢 Tạo đánh giá sản phẩm (Khách hàng)
router.post('/reviews/create', authMiddleware, createReview);

// 🟡 Lấy danh sách tất cả đơn hàng (Admin)
router.get('/all', authMiddleware, isAdmin, getAllOrders);

// 🟡 Lấy danh sách đơn hàng của user (Khách hàng)
router.get('/me', authMiddleware, getOrdersByUsername);

// 🟠 Cập nhật trạng thái đơn hàng (Admin)
router.put('/update', authMiddleware, isAdmin, updateOrder);

// 🔴 Xóa đơn hàng (Admin)
router.delete('/delete', authMiddleware, isAdmin, deleteOrder);

// 🟡 Lấy đánh giá theo sản phẩm (Công khai)
router.get('/:product_id', getReviewsByProduct);

module.exports = router;
