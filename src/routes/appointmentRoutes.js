const express = require('express');
const {
  getAllAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');

const router = express.Router();

router.get('/', getAllAppointments);        // Lấy tất cả lịch hẹn
router.post('/', createAppointment);        // Thêm lịch hẹn mới
router.put('/', updateAppointment);   // Route cập nhật lịch hẹn
router.delete('/', deleteAppointment); // Route xóa lịch hẹn

module.exports = router;
