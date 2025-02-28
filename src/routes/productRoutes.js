const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// 🔹 Chỉ khách hàng mới có thể lấy sản phẩm
router.get('/', authenticate, productController.getAllProducts);
router.get('/:name', authenticate, productController.getProductByName);

// 🔹 Chỉ admin mới có thể thao tác CRUD
router.post('/', authenticate, isAdmin, productController.createProduct);
router.put('/:name', authenticate, isAdmin, productController.updateProductByName);
router.delete('/:name', authenticate, isAdmin, productController.deleteProductByName);

module.exports = router;
