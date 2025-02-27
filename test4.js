const axios = require('axios');

const updateProductByName = async (name) => {
  try {
    const updatedData = {
      description: 'Máy sấy tóc cao cấp, mạnh mẽ hơn',
      price: 399000,
      stock: 8,
      image_url: 'https://example.com/new-image.jpg',
    };

    const response = await axios.put(`http://localhost:5000/api/products/${encodeURIComponent(name)}`, updatedData);
    console.log(`Sản phẩm "${name}" đã được cập nhật:`, response.data);
  } catch (error) {
    console.error(`Lỗi khi cập nhật sản phẩm "${name}":`, error.response?.data || error.message);
  }
};

updateProductByName('Máy sấy tóc'); // Đổi tên nếu cần
