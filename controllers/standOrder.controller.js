const request = require("../helpers/request");
const sql = require('mssql');
const LoggerService = require('../middleware/logger');
const logger = new LoggerService("standOrder");
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

const StandOrder = {};



StandOrder.createOrder = async (req, res, next) => {
  let userId = req.body.userId
  let branchId = res.decoded.branch_id
  try {
    const { accountNumber, accountName,beneficiary_bank,beneficiary_account_number,beneficiary_account_name, frequency, start_date, end_date, amount, remarks } = req.body;
    const stand_order_id = uuidv4();
    let next_run_date = start_date;
    let deleteStatus = "false";
    let new_date = new Date();
    let status = "pending";

    await sql.connect(process.env.MSSQL);
    const result = await sql.query`INSERT INTO [stand_order_detail](
        [stand_order_id]
           ,[account_name]
           ,[account_number]
           ,[beneficiary_bank]
           ,[beneficiary_account_number]
           ,[beneficiary_account_name]
           ,[frequency]
           ,[start_date]
           ,[end_date]
           ,[amount]
           ,[next_run_date]
           ,[remarks]
           ,[delete_status]
           ,[inputter_id]
           ,[status]
           ,[branch_id]
           ,[date]) 
        VALUES(
        ${stand_order_id}, 
        ${accountName}, 
        ${accountNumber},
        ${beneficiary_bank}, 
        ${beneficiary_account_number}, 
        ${beneficiary_account_name}, 
        ${frequency}, 
        ${start_date}, 
        ${end_date}, 
        ${amount}, 
        ${next_run_date}, 
        ${remarks},
        ${deleteStatus},
        ${userId},
        ${status},
        ${branchId},
        ${new_date})`;
        logger.info(`POST Request recieved at /api/standorder | userId - ${userId} | Request Object - ${JSON.stringify(req.body)} | Response - ${JSON.stringify({
            status: "Success",
            message: "Stand Order created successfully"
         })}`);
    return res.status(200).json({
       status: "Success",
       message: "Stand Order created successfully"
    });
  } catch (error) {
    console.log(error)
    logger.error(`POST Request recieved at /api/standorder | userId - ${userId} | Request Object - ${JSON.stringify(req.body)} | Response - ${JSON.stringify(error)}`)
    return res.status(500).json({error});
  }
};

StandOrder.getStandingOrderStat = async (req, res, next) => {
  let userId,branchId
  try {
    console.log(res.decoded)
    userId = res.decoded.user_id;
    branchId = res.decoded.branch_id;
    await sql.connect(process.env.MSSQL);
    const inputterStandingOrder = await sql.query`SELECT * from stand_order_detail where inputter_id = ${userId} ORDER BY date DESC`;
    const inputterPendingStandingOrder = await sql.query`SELECT * from stand_order_detail where inputter_id = ${userId} and status='pending' ORDER BY date DESC`;
    const inputterApprovedStandingOrder = await sql.query`SELECT * from stand_order_detail where inputter_id = ${userId} and status='approved' ORDER BY date DESC`;
    const inputterDeclinedStandingOrder = await sql.query`SELECT * from stand_order_detail where inputter_id = ${userId} and status='declined' ORDER BY date DESC`;

    const StandingOrder = await sql.query`SELECT * from stand_order_detail where branch_id=${branchId} ORDER BY date DESC`;
    const PendingStandingOrder = await sql.query`SELECT * from stand_order_detail where branch_id=${branchId} and status='pending' ORDER BY date DESC`;
    const ApprovedStandingOrder = await sql.query`SELECT * from stand_order_detail where branch_id=${branchId} and status='approved' ORDER BY date DESC`;
    const DeclinedStandingOrder = await sql.query`SELECT * from stand_order_detail where branch_id=${branchId} and status='declined' ORDER BY date DESC`;

    const adminStandingOrder = await sql.query`SELECT * from stand_order_detail ORDER BY date DESC`;
    const adminPendingStandingOrder = await sql.query`SELECT * from stand_order_detail where status='pending' ORDER BY date DESC`;
    const adminApprovedStandingOrder = await sql.query`SELECT * from stand_order_detail where status='approved' ORDER BY date DESC`;
    const adminDeclinedStandingOrder = await sql.query`SELECT * from stand_order_detail where status='declined' ORDER BY date DESC`;
    
    const stat = {
      standingOrder: inputterStandingOrder.recordset.length,
      pending: inputterPendingStandingOrder.recordset.length,
      approved: inputterApprovedStandingOrder.recordset.length,
      declined: inputterDeclinedStandingOrder.recordset.length,

      allStandingOrder: StandingOrder.recordset.length,
      allPending: PendingStandingOrder.recordset.length,
      allApproved: ApprovedStandingOrder.recordset.length,
      allDeclined: DeclinedStandingOrder.recordset.length,

      adminStandingOrder: adminStandingOrder.recordset.length,
      adminPending: adminPendingStandingOrder.recordset.length,
      adminApproved: adminApprovedStandingOrder.recordset.length,
      adminDeclined: adminDeclinedStandingOrder.recordset.length

    }
        logger.info(`GET Request recieved at /api/standorder/stat | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: stat
         })}`);
    return res.status(200).json({
       status: "Success",
       data: stat
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/stat | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.getAdminAllStandingOrder = async (req, res, next) => {
  let userId,branchId
    try {
      userId = res.decoded.user_id;
      branchId = res.decoded.branch_id
      await sql.connect(process.env.MSSQL);
      const result = await sql.query`SELECT * from stand_order_detail ORDER BY date DESC`;
          logger.info(`GET Request recieved at /api/standorder/admin | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
            status: "Success",
            data: result.recordset
           })}`);
      return res.status(200).json({
         status: "Success",
         data: result.recordset
      });
    } catch (error) {
      logger.error(`GET Request recieved at /api/standorder/admin | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
      return res.status(500).json(error);
    }
};

StandOrder.getAllStandingOrder = async (req, res, next) => {
  let userId,branchId
    try {
      userId = res.decoded.user_id;
      branchId = res.decoded.branch_id
      await sql.connect(process.env.MSSQL);
      const result = await sql.query`SELECT * from stand_order_detail where branch_id=${branchId} ORDER BY date DESC`;
          logger.info(`GET Request recieved at /api/standorder | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
            status: "Success",
            data: result.recordset
           })}`);
      return res.status(200).json({
         status: "Success",
         data: result.recordset
      });
    } catch (error) {
      logger.error(`GET Request recieved at /api/standorder | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
      return res.status(500).json(error);
    }
};

StandOrder.getInputerStandingOrder = async (req, res, next) => {
  let userId
  try {
    await sql.connect(process.env.MSSQL);
    userId = res.decoded.user_id;
    const result = await sql.query`SELECT * from stand_order_detail where inputter_id = ${userId} ORDER BY date DESC`;
        logger.info(`GET Request recieved at /api/standorder/inputter | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: result.recordset
         })}`);
    return res.status(200).json({
       status: "Success",
       data: result.recordset
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/inputter | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.getPendingInputerStandingOrder = async (req, res, next) => {
  let userId
  try {
    await sql.connect(process.env.MSSQL);
    userId = res.decoded.user_id;
    const result = await sql.query`SELECT * from stand_order_detail where inputter_id = ${userId} and status='pending' ORDER BY date DESC`;
        logger.info(`GET Request recieved at /api/standorder/pending/inputter | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: result.recordset
         })}`);
    return res.status(200).json({
       status: "Success",
       data: result.recordset
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/pending/inputter | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.getApproverApprovedStandingOrder = async (req, res, next) => {
  let userId
  try {
    await sql.connect(process.env.MSSQL);
    userId = res.decoded.user_id;
    const result = await sql.query`SELECT * from stand_order_detail where approval_id = ${userId} and status='approved' ORDER BY date DESC`;
        logger.info(`GET Request recieved at /api/standorder/approved/approval | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: result.recordset
         })}`);
    return res.status(200).json({
       status: "Success",
       data: result.recordset
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/approved/approval | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.getAdminApprovedStandingOrder = async (req, res, next) => {
  let userId
  try {
    await sql.connect(process.env.MSSQL);
    userId = res.decoded.user_id;
    const result = await sql.query`SELECT * from stand_order_detail where status='approved' ORDER BY date DESC`;
        logger.info(`GET Request recieved at /api/standorder/approved/admin | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: result.recordset
         })}`);
    return res.status(200).json({
       status: "Success",
       data: result.recordset
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/approved/admin | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.getInputerApprovedStandingOrder = async (req, res, next) => {
  let userId
  try {
    await sql.connect(process.env.MSSQL);
    userId = res.decoded.user_id;
    const result = await sql.query`SELECT * from stand_order_detail where inputter_id = ${userId} and status='approved' ORDER BY date DESC`;
        logger.info(`GET Request recieved at /api/standorder/approved/inputter | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: result.recordset
         })}`);
    return res.status(200).json({
       status: "Success",
       data: result.recordset
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/approved/inputter | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.getInputerCancelledStandingOrder = async (req, res, next) => {
  let userId
  try {
    await sql.connect(process.env.MSSQL);
    userId = res.decoded.user_id;
    const result = await sql.query`SELECT * from stand_order_detail where inputter_id = ${userId} and status='cancelled' ORDER BY date DESC`;
        logger.info(`GET Request recieved at /api/standorder/cancelled/inputter | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: result.recordset
         })}`);
    return res.status(200).json({
       status: "Success",
       data: result.recordset
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/cancelled/inputter | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.getInputerDeclinedStandingOrder = async (req, res, next) => {
  let userId
  try {
    await sql.connect(process.env.MSSQL);
    userId = res.decoded.user_id;
    const result = await sql.query`SELECT * from stand_order_detail where inputter_id = ${userId} and status='declined' ORDER BY date DESC`;
        logger.info(`GET Request recieved at /api/standorder/declined/inputter | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: result.recordset
         })}`);
    return res.status(200).json({
       status: "Success",
       data: result.recordset
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/declined/inputter | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.getDeclinedStandingOrder = async (req, res, next) => {
  let userId,branchId
  try {
    await sql.connect(process.env.MSSQL);
    userId = res.decoded.user_id;
    branchId = res.decoded.branch_id;
    const result = await sql.query`SELECT * from stand_order_detail where status='declined' and branch_id=${branchId} ORDER BY date DESC`;
        logger.info(`GET Request recieved at /api/standorder/declined | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: result.recordset
         })}`);
    return res.status(200).json({
       status: "Success",
       data: result.recordset
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/declined | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.getAdminDeclinedStandingOrder = async (req, res, next) => {
  let userId,branchId
  try {
    await sql.connect(process.env.MSSQL);
    userId = res.decoded.user_id;
    branchId = res.decoded.branch_id;
    const result = await sql.query`SELECT * from stand_order_detail where status='declined' ORDER BY date DESC`;
        logger.info(`GET Request recieved at /api/standorder/declined/admin | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: result.recordset
         })}`);
    return res.status(200).json({
       status: "Success",
       data: result.recordset
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/declined/admin | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.getInputerDeactivatedStandingOrder = async (req, res, next) => {
  let userId
  try {
    await sql.connect(process.env.MSSQL);
    userId = res.decoded.user_id;
    const result = await sql.query`SELECT * from stand_order_detail where inputter_id = ${userId} and status='deactivated' ORDER BY date DESC`;
        logger.info(`GET Request recieved at /api/standorder/decativated/inputter | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: result.recordset
         })}`);
    return res.status(200).json({
       status: "Success",
       data: result.recordset
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/deactivated/inputter | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.getDeactivatedStandingOrder = async (req, res, next) => {
  let userId,branchId
  try {
    await sql.connect(process.env.MSSQL);
    userId = res.decoded.user_id;
    branchId = res.decoded.branch_id;
    const result = await sql.query`SELECT * from stand_order_detail where status='deactivated' and branch_id=${branchId} ORDER BY date DESC`;
        logger.info(`GET Request recieved at /api/standorder/decativated | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: result.recordset
         })}`);
    return res.status(200).json({
       status: "Success",
       data: result.recordset
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/deactivated | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.getPendingStandingOrder = async (req, res, next) => {
  let userId,branchId
  try {
    await sql.connect(process.env.MSSQL);
    userId = res.decoded.user_id;
    branchId = res.decoded.branch_id
    const result = await sql.query`SELECT * from stand_order_detail where status='pending' and branch_id = ${branchId} ORDER BY date DESC`;
        logger.info(`GET Request recieved at /api/standorder/pending | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: result.recordset
         })}`);
    return res.status(200).json({
       status: "Success",
       data: result.recordset
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/pending | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.getAdminPendingStandingOrder = async (req, res, next) => {
  let userId,branchId
  try {
    await sql.connect(process.env.MSSQL);
    userId = res.decoded.user_id;
    const result = await sql.query`SELECT * from stand_order_detail where status='pending' ORDER BY date DESC`;
        logger.info(`GET Request recieved at /api/standorder/pending/admin | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: result.recordset
         })}`);
    return res.status(200).json({
       status: "Success",
       data: result.recordset
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/pending/admin | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.getCancelledStandingOrder = async (req, res, next) => {
  let userId,branchId
  try {
    await sql.connect(process.env.MSSQL);
    userId = res.decoded.user_id;
    branchId = res.decoded.branch_id
    const result = await sql.query`SELECT * from stand_order_detail where status='cancelled' and branch_id = ${branchId} ORDER BY date DESC`;
        logger.info(`GET Request recieved at /api/standorder/cancelled | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: result.recordset
         })}`);
    return res.status(200).json({
       status: "Success",
       data: result.recordset
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/cancelled | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.getAdminCancelledStandingOrder = async (req, res, next) => {
  let userId,branchId
  try {
    await sql.connect(process.env.MSSQL);
    userId = res.decoded.user_id;
    branchId = res.decoded.branch_id
    const result = await sql.query`SELECT * from stand_order_detail where status='cancelled' ORDER BY date DESC`;
        logger.info(`GET Request recieved at /api/standorder/cancelled/admin | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: result.recordset
         })}`);
    return res.status(200).json({
       status: "Success",
       data: result.recordset
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/cancelled/admin | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.getApprovedStandingOrder = async (req, res, next) => {
  let userId,branchId
  try {
    await sql.connect(process.env.MSSQL);
    userId = res.decoded.user_id;
    branchId = res.decoded.branch_id
    const result = await sql.query`SELECT * from stand_order_detail where status='approved' and branch_id=${branchId} ORDER BY date DESC`;
        logger.info(`GET Request recieved at /api/standorder/approved | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({
          status: "Success",
          data: result.recordset
         })}`);
    return res.status(200).json({
       status: "Success",
       data: result.recordset
    });
  } catch (error) {
    logger.error(`GET Request recieved at /api/standorder/approved | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};

StandOrder.deactivateStandingOrder = async (req, res, next) => {
  let userId
    try {
    const {stand_order_id} = req.body
    userId = res.decoded.user_id;
      await sql.connect(process.env.MSSQL);
      let deleteStatus = 'true'
      
      const result = await sql.query`UPDATE stand_order_detail SET delete_status = ${deleteStatus}, status='deactivated' WHERE stand_order_id = ${stand_order_id}`;
          logger.info(`POST Request recieved at /api/standorder/deactivate | userId - ${userId} | Request Object - ${JSON.stringify(req.body)} | Response - ${JSON.stringify({
            status: "Success",
            message: "Stand order deactivated successfully"
           })}`);
      return res.status(200).json({
        status: "Success",
        message: "Stand order deactivated successfully"
      });
    } catch (error) {
      logger.error(`POST Request recieved at /api/standorder/deactivate | userId - ${userId} | Request Object - ${JSON.stringify(req.body)} | Response - ${JSON.stringify({error})}`)
      return res.status(500).json(error);
    }
};

StandOrder.cancelStandingOrder = async (req, res, next) => {
  let userId
    try {
    const {stand_order_id} = req.body
    userId = res.decoded.user_id;
      await sql.connect(process.env.MSSQL);
      
      const result = await sql.query`UPDATE stand_order_detail SET status='cancelled' WHERE stand_order_id = ${stand_order_id}`;
          logger.info(`POST Request recieved at /api/standorder/cancel | userId - ${userId} | Request Object - ${JSON.stringify(req.body)} | Response - ${JSON.stringify({
            status: "Success",
            message: "Stand order cancelled successfully"
           })}`);
      return res.status(200).json({
        status: "Success",
        message: "Stand order cancelled successfully"
      });
    } catch (error) {
      logger.error(`POST Request recieved at /api/standorder/cancel | userId - ${userId} | Request Object - ${JSON.stringify(req.body)} | Response - ${JSON.stringify({error})}`)
      return res.status(500).json(error);
    }
};

StandOrder.approveStandingOrder = async (req, res, next) => {
  let userId;
  try {
  const {stand_order_id, status} = req.body
  userId = res.decoded.user_id;
  console.log(userId);
    await sql.connect(process.env.MSSQL);
    let deleteStatus = 'true'
    console.log(deleteStatus);
    const result = await sql.query`UPDATE stand_order_detail SET status = ${status}, approval_id=${userId}  WHERE stand_order_id = ${stand_order_id}`;
        logger.info(`POST Request recieved at /api/standorder/approve | userId - ${userId}  | Request Object - ${JSON.stringify(req.body)} | Response - ${JSON.stringify({
          status: "Success",
          message: "Stand order approved successfully"
         })}`);
    return res.status(200).json({
      status: "Success",
      message: "Stand order approved successfully"
    });
  } catch (error) {
    logger.error(`POST Request recieved at /api/standorder/approve | userId - ${userId}  | Request Object - ${JSON.stringify(req.body)} | Response - ${JSON.stringify({error})}`)
    return res.status(500).json(error);
  }
};




module.exports = StandOrder;
