const request = require("../helpers/request");
const sql = require('mssql');
const LoggerService = require('../middleware/logger');
const logger = new LoggerService("audit");
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

const Audit = {};



Audit.createAudit = async (type, route, action, status, request, response) => {
  let userId = req.body.userId
  let branchId = res.decoded.branch_id
  try {
    const audit_id = uuidv4();
    let new_date = new Date();

    await sql.connect(process.env.MSSQL);
    const result = await sql.query`INSERT INTO [stand_order_audit](
            [audit_id]
           ,[type]
           ,[route]
           ,[action]
           ,[status]
           ,[userId]
           ,[request]
           ,[response]
           ,[branch_id]
           ,[date]) 
        VALUES(
        ${audit_id}, 
        ${type}, 
        ${route},
        ${action}, 
        ${status}, 
        ${userId}, 
        ${request}, 
        ${response}, 
        ${branch_id}, 
        ${new_date})`;
    return res.status(200).json({
       status: "Success",
       message: "Stand Order audit created successfully"
    });
  } catch (error) {
    console.log(error)
    logger.error(`POST Request recieved at /api/audit | userId - ${userId} `)
    return res.status(500).json({error});
  }
};

Audit.getAllAudit = async (req, res, next) => {
  let userId,branchId
    try {
      userId = res.decoded.user_id;
      branchId = res.decoded.branch_id
      await sql.connect(process.env.MSSQL);
      const result = await sql.query`SELECT * from stand_order_audit ORDER BY date DESC`;
      return res.status(200).json({
         status: "Success",
         data: result.recordset
      });
    } catch (error) {
      logger.error(`GET Request recieved at /api/audit | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
      return res.status(500).json(error);
    }
};

Audit.getAuditByBranch = async (req, res, next) => {
  let userId,branchId
    try {
      userId = res.decoded.user_id;
      branchId = res.decoded.branch_id
      await sql.connect(process.env.MSSQL);
      const result = await sql.query`SELECT * from stand_order_audit where branch_id=${branchId} ORDER BY date DESC`;
      
      return res.status(200).json({
         status: "Success",
         data: result.recordset
      });
    } catch (error) {
      logger.error(`GET Request recieved at /api/audit | userId - ${userId} | Request Object - NONE | Response - ${JSON.stringify({error})}`)
      return res.status(500).json(error);
    }
};





module.exports = Audit;
