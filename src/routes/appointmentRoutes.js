const express = require('express');
const {
  getAllAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');

const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/all', authMiddleware, getAllAppointments);  // Chỉ admin được xem
router.post('/create', authMiddleware, createAppointment);       // Ai cũng có thể đặt lịch hẹn
router.put('/update', authMiddleware, isAdmin, updateAppointment);  // Chỉ admin có thể cập nhật
router.delete('/delete', authMiddleware, isAdmin, deleteAppointment);  // Chỉ admin có thể xóa

module.exports = router;
