const express = require("express");
const router = express.Router();
const Audit = require("../controllers/audit.controller");
const verifyToken = require('../middleware/auth').verifyToken;


router.post("/api/audit", verifyToken, Audit.createAudit);
router.get("/api/audit", verifyToken, Audit.getAllAudit);
router.get("/api/audit/branch", verifyToken, Audit.getAuditByBranch);

module.exports = router;
