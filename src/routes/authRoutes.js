const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware, isAdmin, verifyRecaptcha } = require('../middlewares/authMiddleware'); 



const router = express.Router();

router.post('/register',verifyRecaptcha, authController.register);
router.post('/login',verifyRecaptcha, authController.login);
router.post('/forgot-password',verifyRecaptcha, authController.forgotPassword);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/logout', authController.logout);

module.exports = router;
