const axios = require('axios');

const testGetAllUsers = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/users/all');
    console.log('Danh sách người dùng:', response.data);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error.response ? error.response.data : error.message);
  }
};

testGetAllUsers();
