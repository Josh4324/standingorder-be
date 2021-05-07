const request = require("../helpers/request");
const sql = require('mssql');
const LoggerService = require('../middleware/logger');
const logger = new LoggerService("transfer");

const Transfer = {};


Transfer.send = async (req, res, next) => {
  try {
    const {
        DBC,  CDA, AN, ON, NRN, REF, AMT, INA
      } = req.body;
    
     const response = await request.transferMoney(DBC,  CDA, AN, ON, NRN, REF, AMT, INA);

     logger.info(`Request recieved at /api/transfer | Request - ${JSON.stringify(req.body)} | Response - ${response}`);
     return res.status(200).json({code: response});
    
  } catch (error) {
    `Request recieved at /api/transfer | Request - ${JSON.stringify(req.body)} | Response - ${JSON.stringify(error)}`
    return res.status(500).json({error});
  }
};


Transfer.getAllTransactions = async (req, res, next) => {
  let userId, branchId
    try {
        await sql.connect(process.env.MSSQL);
        userId = res.decoded.user_id;
        branchId = res.decoded.branch_id;
        const result = await sql.query`SELECT * from stand_order_transaction where branch_id=${branchId} ORDER BY date DESC`;
            logger.info(`GET Request recieved at /api/transactions | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
              status: "Success",
              data: result.recordset
             })}`);
        return res.status(200).json({
           status: "Success",
           data: result.recordset
        });
      } catch (error) {
          console.log(error)
        logger.error(`Request recieved at /api/transactions | userId - ${userId} |  Request Object - NONE | Response - ${JSON.stringify(error)}`)
        return res.status(500).json(error);
      }
  };

  Transfer.getAdminTransactions = async (req, res, next) => {
    let userId;
      try {
          await sql.connect(process.env.MSSQL);
          userId = res.decoded.user_id;
          const result = await sql.query`SELECT * from stand_order_transaction ORDER BY date DESC`;
              logger.info(`GET Request recieved at /api/transactions/admin | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
                status: "Success",
                data: result.recordset
               })}`);
          return res.status(200).json({
             status: "Success",
             data: result.recordset
          });
        } catch (error) {
            console.log(error)
          logger.error(`Request recieved at /api/transactions/admin | userId - ${userId} |  Request Object - NONE | Response - ${JSON.stringify(error)}`)
          return res.status(500).json(error);
        }
    };

Transfer.getInputerTransactions = async (req, res, next) => {
  let userId
    try {
        await sql.connect(process.env.MSSQL);
        userId = res.decoded.user_id;
        const result = await sql.query`SELECT * from stand_order_transaction where inputter_id = ${userId} ORDER BY date DESC`;
            logger.info(`GET Request recieved at /api/transaction/inputter | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
              status: "Success",
              data: result.recordset
             })}`);
        return res.status(200).json({
           status: "Success",
           data: result.recordset
        });
      } catch (error) {
          console.log(error)
        logger.error(`GET Request recieved at /api/transaction/inputter | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify(error)}`)
        return res.status(500).json(error);
      }
  };

module.exports = Transfer;
