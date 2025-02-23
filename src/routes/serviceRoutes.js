const express = require('express');
const { getAllServices, getServiceByName, createService, updateServiceByName, deleteServiceByName } = require('../controllers/serviceController');

const router = express.Router();

router.get('/', getAllServices);
router.get('/:name', getServiceByName);
router.post('/', createService);
router.put('/:name', updateServiceByName);
router.delete('/:name', deleteServiceByName);

module.exports = router;
