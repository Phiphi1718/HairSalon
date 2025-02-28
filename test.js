const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const updateAvatar = async () => {
  try {
    const username = 'admin'; // Thay thế bằng username thực tế
    const filePath = 'D:/HairSalon/avatar.png'; // Đường dẫn phải đúng

    // Kiểm tra xem file có tồn tại không
    if (!fs.existsSync(filePath)) {
      console.error('❌ File không tồn tại:', filePath);
      return;
    }

    const formData = new FormData();
    formData.append('avatar', fs.createReadStream(filePath)); // Phải đúng tên field 'avatar'

    const response = await axios.put(`http://localhost:5000/api/users/${username}/avatar`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInVzZXJfdHlwZV9pZCI6MSwiaWF0IjoxNzQwNzQ2NDkxLCJleHAiOjE3NDA3NTAwOTF9.ElGbYJZ-EC1T6-czWCRuMMqB1bt9aVo833nZnhDznDM', // Thay bằng token hợp lệ
      },
    });

    console.log('✅ Cập nhật ảnh thành công:', response.data);
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật ảnh:', error.response ? error.response.data : error.message);
  }
};

updateAvatar();
