const request = require("../helpers/request");
const LoggerService = require('../middleware/logger');
const logger = new LoggerService("verification");

const Verify = {};


Verify.providusInternal = async (req, res, next) => {
    try {
        const {
            accountNumber,
          } = req.body;
        
         const response = await request.providusAccountCheck(accountNumber);
         logger.info(`Request recieved at /api/verify/internal | Request - ${JSON.stringify(req.body)} | Response - ${response}`);
         return res.status(200).json({accountName : response});

    } catch (error) {
        `Request recieved at /api/verify/internal | Request - ${JSON.stringify(req.body)} | Response - ${JSON.stringify(error)}`
        return res.status(500).json({error});
    }
};

Verify.externalAccount = async (req, res, next) => {
    try {
        const {
            DBC, 
            AN, 
            SAC
          } = req.body;

        const response = await request.externalAccountCheck(DBC, AN, SAC);
        logger.info(`Request recieved at /api/verify/external | Request - ${JSON.stringify(req.body)} | Response - ${response}`);
        return res.status(200).json({accountName: response[0]});
    } catch (error) {
        logger.error(`Request recieved at /api/verify/external | Request - ${JSON.stringify(req.body)} | Response - ${error}`);
        return res.status(500).json({error});
    }
};

Verify.getAccountBalance = async (req, res, next) => {
    try {
        const {
            AN
          } = req.body;

        const response = await request.getBalance(AN);
        //console.log(response)
        logger.info(`Request recieved at /api/verify/balance | Request - ${JSON.stringify(req.body)} | Response - ${response}`);
        return res.status(200).json({balance: response[0]});
    } catch (error) {
        logger.error(`Request recieved at /api/verify/balance | Request - ${JSON.stringify(req.body)} | Response - ${error}`);
        return res.status(500).json({error});
    }
};




module.exports = Verify;
