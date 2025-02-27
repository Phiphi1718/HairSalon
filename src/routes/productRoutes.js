const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// Người dùng bình thường chỉ có thể lấy sản phẩm theo tên
router.get('/:name', authenticate, productController.getProductByName);
router.get('/', authenticate, productController.getAllProducts);

// Chỉ admin mới có quyền làm các thao tác sau
router.post('/', authenticate, isAdmin, productController.createProduct);
router.put('/:name', authenticate, isAdmin, productController.updateProductByName);
router.delete('/:name', authenticate, isAdmin, productController.deleteProductByName);

module.exports = router;
