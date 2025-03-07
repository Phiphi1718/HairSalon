const express = require("express");
const router = express.Router();
const barberController = require("../controllers/barberController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const cloudinary = require('../config/cloudinary');

router.get("/barbers", barberController.getAllBarbers);
router.get("/barbers/:id", authMiddleware, isAdmin, barberController.getBarberById);
router.post("/barbers", authMiddleware, isAdmin, upload.single("image"), barberController.createBarber);
router.put("/barbers/:id", authMiddleware, isAdmin, upload.single("image"), barberController.updateBarber);
router.delete("/barbers/:id", authMiddleware, isAdmin, barberController.deleteBarber);

module.exports = router;
