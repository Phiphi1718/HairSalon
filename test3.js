const axios = require('axios');

const createProduct = async () => {
  try {
    const newProduct = {
      name: 'Máy sấy tóc',
      description: 'Máy sấy tóc chuyên nghiệp',
      price: 299000,
      stock: 10,
      image_url: 'C:\Users\Nitro 5\OneDrive\Hình ảnh\photo_2021-11-25_09-31-52_52c6f13fcc06433db2362281059d1c09.webp',
    };

    const response = await axios.post('http://localhost:5000/api/products', newProduct);
    console.log('Sản phẩm mới đã thêm:', response.data);
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm:', error.response?.data || error.message);
  }
};

createProduct();
