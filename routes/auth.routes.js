const express = require("express");
const router = express.Router();
const Auth = require("../controllers/auth.controller");



router.post("/api/user/auth/login", Auth.Login);
router.post("/api/user/auth/securepass", Auth.SecurePass);

module.exports = router;
