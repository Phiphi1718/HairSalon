const express = require("express");
const router = express.Router();
const barberController = require("../controllers/barberController");
const { isAdmin,authMiddleware } = require("../middlewares/authMiddleware");

router.get("/barbers", barberController.getAllBarbers);
router.get("/barbers/:id", isAdmin,authMiddleware, barberController.getBarberById);
router.post("/barbers", isAdmin,authMiddleware, barberController.createBarber);
router.put("/barbers/:id", isAdmin,authMiddleware, barberController.updateBarber);
router.delete("/barbers/:id", isAdmin,authMiddleware, barberController.deleteBarber);

module.exports = router;
