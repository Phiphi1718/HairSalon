const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts); // Lấy tất cả sản phẩm
router.get('/:name', productController.getProductByName); // Lấy sản phẩm theo TÊN
router.post('/', productController.createProduct); // Thêm sản phẩm mới
router.put('/:name', productController.updateProductByName); // Cập nhật sản phẩm theo TÊN
router.delete('/:name', productController.deleteProductByName); // Xóa sản phẩm theo TÊN

module.exports = router;
