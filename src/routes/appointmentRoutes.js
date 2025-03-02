const express = require('express');
const {
  getAllAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByUsername
} = require('../controllers/appointmentController');

const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:username', authMiddleware,getAppointmentsByUsername );
router.get('/all', authMiddleware, getAllAppointments);  // Chỉ admin được xem
router.post('/create', authMiddleware, createAppointment);       // Ai cũng có thể đặt lịch hẹn
router.put('/update', authMiddleware, isAdmin, updateAppointment);  // Chỉ admin có thể cập nhật
router.delete('/delete', authMiddleware, deleteAppointment);  // Chỉ admin có thể xóa

module.exports = router;
