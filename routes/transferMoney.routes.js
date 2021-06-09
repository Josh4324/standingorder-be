const express = require("express");
const router = express.Router();
const Transfer = require("../controllers/transferMoney.controller");
const validation = require("../middleware/validation");
const verifyToken = require('../middleware/auth').verifyToken;

router.post("/api/transfer", validation.transferValidationRules(), validation.validate, Transfer.send);
router.get("/api/transactions/admin",verifyToken, Transfer.getAdminTransactions);
router.get("/api/transactions",verifyToken, Transfer.getAllTransactions);
router.post("/api/receipt",verifyToken, Transfer.GenerateReceipt);
router.get("/api/transactions/inputter",verifyToken, Transfer.getInputerTransactions);

module.exports = router;
