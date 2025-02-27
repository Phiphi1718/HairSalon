const axios = require('axios');

const deleteProductByName = async (name) => {
  try {
    const response = await axios.delete(`http://localhost:5000/api/products/${encodeURIComponent(name)}`);
    console.log(`Sản phẩm "${name}" đã bị xóa:`, response.data);
  } catch (error) {
    console.error(`Lỗi khi xóa sản phẩm "${name}":`, error.response?.data || error.message);
  }
};

deleteProductByName('Máy sấy tóc'); // Đổi tên nếu cần
