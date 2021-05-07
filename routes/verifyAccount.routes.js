const express = require("express");
const router = express.Router();
const Verify = require("../controllers/verifyAccount.controller");
const verifyToken = require('../middleware/auth').verifyToken;


router.post("/api/verify/internal", verifyToken, Verify.providusInternal);
router.post("/api/verify/external", verifyToken, Verify.externalAccount);
router.post("/api/verify/balance", verifyToken, Verify.getAccountBalance);

module.exports = router;
