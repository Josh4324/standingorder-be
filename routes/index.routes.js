const express = require('express');
const router = express.Router();
const Auth = require('./auth.routes');
const Transfer = require('./transferMoney.routes');
const Verify = require('./verifyAccount.routes');
const StandOrder = require('./standOrder.routes');
const Audit = require('./audit.routes');
const LoggerService = require('../middleware/logger');
const logger = new LoggerService("api");


router.use(Auth);
router.use(Transfer);
router.use(Verify);
router.use(StandOrder);
router.use(Audit);


router.get('/api', function (req, res, next) {
  logger.info('Request recieved at /api');
  res.status(200).json({ message: 'Standing Order API' });
});

module.exports = router;
