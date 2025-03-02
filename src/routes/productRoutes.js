const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

// 🔹 Chỉ khách hàng mới có thể lấy sản phẩm
router.get('/', authMiddleware, productController.getAllProducts);
router.get('/:name', authMiddleware, productController.getProductByName);

// 🔹 Chỉ admin mới có thể thao tác CRUD
router.post('/', authMiddleware, isAdmin, productController.createProduct);
router.put('/:name', authMiddleware, isAdmin, productController.updateProductByName);
router.delete('/:name', authMiddleware, isAdmin, productController.deleteProductByName);

module.exports = router;
