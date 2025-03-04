const Product = require('../models/productModel');

const productController = {
  // 🔹 Lấy tất cả sản phẩm (Chỉ khách hàng)
getAllProducts: async (req, res) => {
    try {
      const products = await Product.getAll();
      res.status(200).json(products);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // 🔹 Lấy sản phẩm theo tên (Mọi người đều truy cập được)
  getProductByName: async (req, res) => {
    try {
      const { name } = req.params;
      const product = await Product.getByName(name);
      if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

      res.status(200).json(product);
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // 🔹 Thêm sản phẩm (Chỉ admin)
  createProduct: async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Bạn không có quyền thêm sản phẩm' });
      }

      const { name, description, price, stock, image_url } = req.body;
      if (!name || !price || !stock) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
      }

      const newProduct = await Product.create({ name, description, price, stock, image_url });
      res.status(201).json({ message: 'Thêm sản phẩm thành công', product: newProduct });
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // 🔹 Cập nhật sản phẩm theo tên (Chỉ admin)
  updateProductByName: async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật sản phẩm' });
      }

      const { name } = req.params;
      const { description, price, stock, image_url } = req.body;

      const updatedProduct = await Product.updateByName(name, { description, price, stock, image_url });
      if (!updatedProduct) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

      res.status(200).json({ message: 'Cập nhật sản phẩm thành công', product: updatedProduct });
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // 🔹 Xóa sản phẩm theo tên (Chỉ admin)
  deleteProductByName: async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Bạn không có quyền xóa sản phẩm' });
      }

      const { name } = req.params;
      const deletedProduct = await Product.deleteByName(name);
      if (!deletedProduct) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

      res.status(200).json({ message: 'Xóa sản phẩm thành công' });
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = productController;
