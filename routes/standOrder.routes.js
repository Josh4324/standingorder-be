const express = require("express");
const router = express.Router();
const StandOrder = require("../controllers/standOrder.controller");
const verifyToken = require('../middleware/auth').verifyToken;


router.post("/api/standorder", verifyToken, StandOrder.createOrder);
router.get("/api/standorder", verifyToken, StandOrder.getAllStandingOrder);
router.get("/api/standorder/admin", verifyToken, StandOrder.getAdminAllStandingOrder);
router.get("/api/standorder/inputter", verifyToken, StandOrder.getInputerStandingOrder);
router.get("/api/standorder/pending", verifyToken, StandOrder.getPendingStandingOrder);
router.get("/api/standorder/pending/admin", verifyToken, StandOrder.getAdminPendingStandingOrder);
router.get("/api/standorder/pending/inputter", verifyToken, StandOrder.getPendingInputerStandingOrder);
router.get("/api/standorder/approved/inputter", verifyToken, StandOrder.getInputerApprovedStandingOrder);
router.get("/api/standorder/declined/inputter", verifyToken, StandOrder.getInputerDeclinedStandingOrder);
router.get("/api/standorder/cancelled/inputter", verifyToken, StandOrder.getInputerCancelledStandingOrder);
router.get("/api/standorder/deactivated/inputter", verifyToken, StandOrder.getInputerDeactivatedStandingOrder);
router.get("/api/standorder/deactivated", verifyToken, StandOrder.getDeactivatedStandingOrder);
router.get("/api/standorder/approved/admin", verifyToken, StandOrder.getAdminApprovedStandingOrder);
router.get("/api/standorder/approved/approval", verifyToken, StandOrder.getApproverApprovedStandingOrder);
router.get("/api/standorder/approved", verifyToken, StandOrder.getApprovedStandingOrder);
router.get("/api/standorder/cancelled", verifyToken, StandOrder.getCancelledStandingOrder);
router.get("/api/standorder/cancelled/admin", verifyToken, StandOrder.getAdminCancelledStandingOrder);
router.post("/api/standorder/deactivate", verifyToken, StandOrder.deactivateStandingOrder);
router.post("/api/standorder/approve", verifyToken, StandOrder.approveStandingOrder);
router.get("/api/standorder/declined", verifyToken, StandOrder.getDeclinedStandingOrder);
router.get("/api/standorder/declined/admin", verifyToken, StandOrder.getAdminDeclinedStandingOrder);
router.post("/api/standorder/cancel", verifyToken, StandOrder.cancelStandingOrder);
router.get("/api/standorder/stat", verifyToken, StandOrder.getStandingOrderStat);

module.exports = router;
