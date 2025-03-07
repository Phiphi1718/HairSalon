const express = require("express");
const router = express.Router();
const barberController = require("../controllers/barberController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

// Route không cần quyền admin
router.get("/barbers", barberController.getAllBarbers);

// Route cần xác thực và quyền admin (authMiddleware trước, isAdmin sau)
router.get("/barbers/:id", authMiddleware, isAdmin, barberController.getBarberById);
router.post("/barbers", authMiddleware, isAdmin, barberController.createBarber);
router.put("/barbers/:id", authMiddleware, isAdmin, barberController.updateBarber);
router.delete("/barbers/:id", authMiddleware, isAdmin, barberController.deleteBarber);

module.exports = router;
