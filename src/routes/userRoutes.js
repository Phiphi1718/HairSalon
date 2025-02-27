const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/all', authMiddleware, userController.getAllUsers);
router.get('/:username', authMiddleware, userController.getUserByUsername);
router.put('/update/:username', authMiddleware, isAdmin, userController.updateUser);
router.delete('/delete/:username', authMiddleware, isAdmin, userController.deleteUser);

module.exports = router;
