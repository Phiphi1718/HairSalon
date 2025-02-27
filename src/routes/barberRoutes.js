const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barberController');
const { isAdmin } = require('../middlewares/authMiddleware');

router.get('/barbers',barberController.getAllBarbers);
router.get('/barbers/:id',isAdmin, barberController.getBarberById);
router.post('/barbers', isAdmin,barberController.createBarber);
router.put('/barbers/:id',isAdmin, barberController.updateBarber);
router.delete('/barbers/:id',isAdmin, barberController.deleteBarber);

module.exports = router;