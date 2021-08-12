const request = require("../helpers/request");
const sql = require('mssql');
const puppeteer = require('puppeteer');
const hbs = require('handlebars');
const pdf = require('pdf-parse');
const LoggerService = require('../middleware/logger');
const logger = new LoggerService("transfer");
const path = require('path');
const fs = require('fs-extra');
const banks = require("../bank");



const Transfer = {};

hbs.registerHelper('equal', function (lvalue, rvalue, options) {
  if (arguments.length < 3)
    throw new Error('Handlebars Helper equal needs 2 parameters');
  if (lvalue != rvalue) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

hbs.registerHelper('dateTime', function () {
  var currentdate = new Date();
  var datetime =
    'PRINTED ON: ' +
    ('0' + (currentdate.getDate() + 1)).slice(-2) +
    '/' +
    ('0' + (currentdate.getMonth() + 1)).slice(-2) +
    '/' +
    currentdate.getFullYear() +
    ' @ ' +
    currentdate.getHours() +
    ':' +
    currentdate.getMinutes() +
    ':' +
    currentdate.getSeconds();

  return datetime;
});

hbs.registerHelper('formatCurrency', function (amount) {
  return new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2 }).format(
    amount
  );
});

hbs.registerHelper('substring', function (date) {
  return moment(date).format('DD-MM-YYYY');
});


const compile = async function (templateName, data, next) {
  try {
    console.log(data)
    const filePath = path.join(
      process.cwd(),
      'templates',
      `${templateName}.hbs`
    );
    const html = fs.readFileSync(filePath, 'utf-8');
    return hbs.compile(html)(data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

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

Transfer.GenerateReceipt = async (req, res, next) => {
    try {
      const { transId, standOrderId } = req.body;

      await sql.connect(process.env.MSSQL);
      userId = res.decoded.user_id;
      branchId = res.decoded.branch_id;
      const result = await sql.query`SELECT * from stand_order_transaction where transaction_id=${transId}`;
      const result2 = await sql.query`SELECT * from stand_order_detail where stand_order_id = ${standOrderId}`;
      const status = result.recordset[0].status.toUpperCase();
      
      const info = {
        senderAccount: result2.recordset[0].account_number,
        beneficiaryBank: banks[result2.recordset[0].beneficiary_bank],
        traDate: result.recordset[0].date,
        Amount: result.recordset[0].amount,
        senderName: result2.recordset[0].account_name,
        beneficiaryName: result2.recordset[0].beneficiary_account_name,
        beneficiaryAccount: result2.recordset[0].beneficiary_account_number,
        narration: result2.recordset[0].remarks,
        status,
        background: 'templates/providus.svg',
      };
  
      const path = `receipts/${transId}${Date.now()}.pdf`;
      const content = await compile('receipt', info, next);
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(0);
      await page.setContent(content);
      // await page.emulateMediaType('screen');
      await page.pdf({
        path: path,
        format: 'A4',
        printBackground: true,
      });
  
      return res.status(200).json(path);
    } catch (error) {
      console.log(error);
      //next(error);
    }
  };

module.exports = Transfer;
