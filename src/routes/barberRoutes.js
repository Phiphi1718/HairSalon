const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barberController');

router.get('/barbers', barberController.getAllBarbers);
router.get('/barbers/:id', barberController.getBarberById);
router.post('/barbers', barberController.createBarber);
router.put('/barbers/:id', barberController.updateBarber);
router.delete('/barbers/:id', barberController.deleteBarber);

module.exports = router;