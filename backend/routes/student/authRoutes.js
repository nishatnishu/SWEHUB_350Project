const express = require("express");
const router = express.Router();
// FIXED: Path to authController inside student folder
const { register, login, checkEmail } = require("../../controllers/student/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/check-email/:email", checkEmail);

module.exports = router;