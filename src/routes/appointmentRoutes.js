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

// Put specific routes BEFORE parameterized routes
router.get('/all', authMiddleware, getAllAppointments);  // Chỉ admin được xem
// Then put the parameterized route after
router.get('/:username', authMiddleware, getAppointmentsByUsername);
router.post('/create', authMiddleware, createAppointment);       // Ai cũng có thể đặt lịch hẹn
router.put('/update', authMiddleware, isAdmin, updateAppointment);  // Chỉ admin có thể cập nhật
router.delete('/appointments/:appointment_id',authMiddleware, deleteAppointment);

module.exports = router;
