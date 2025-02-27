const axios = require('axios');

const newBarber = {
  full_name: 'Nguyễn Văn A',
  date_of_birth: '1990-05-10',
  experience_years: 5,
  phone: '0123456789',
  address: '123 Đường ABC, TP. HCM'
};

const createBarber = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/barbers', newBarber);
    console.log('✅ Thêm thợ cắt tóc thành công:', response.data);
  } catch (error) {
    console.error('❌ Lỗi khi thêm thợ:', error.response?.data || error.message);
  }
};

createBarber();
