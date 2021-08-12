const requestIp = require("request-ip");
const request = require("../helpers/request");
const generateToken = require("../middleware/auth").generateAccessToken;
const LoggerService = require("../middleware/logger");
const logger = new LoggerService("auth");
const sql = require("mssql");

const Auth = {};

Auth.Login = async (req, res, next) => {
  const { userId, password } = req.body;
  let clientIP;

  try {
    clientIP = await requestIp.getClientIp(req);

    const body = {
      userId,
      password: Buffer.from(password).toString("base64"),
      ip: clientIP,
      linkId: "52",
    };

    const response = await request.SendRequest(
      "POST",
      process.env.AD_URL,
      body,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const { empName, id, emplId, roleaccess } = response.data;
    const branchId = response.data.braCode.code;
    const date = new Date();

    await sql.connect(process.env.MSSQL);

    const user =
      await sql.query`SELECT * from stand_order_users where user_id = ${userId}`;
    const userResult = user.recordset;

    if (userResult.length === 0) {
      const result = await sql.query`INSERT INTO [stand_order_users](
          [user_name]
          ,[user_id]
          ,[employee_id]
          ,[device_ip]
          ,[role]
          ,[branch_id]
          ,[date]) 
      VALUES(
      ${empName}, 
      ${userId}, 
      ${emplId},
      ${clientIP}, 
      ${roleaccess},
      ${branchId}, 
      ${date})`;
    }

    if (roleaccess !== userResult[0].role) {
      await sql.query`UPDATE stand_order_users SET role = ${roleaccess} WHERE user_id = ${userId}`;
    }

    if (branchId !== userResult[0].branch_id){
      await sql.query`UPDATE stand_order_users SET branch_id = ${branchId} WHERE user_id = ${userId}`;
    }

    const data = {
      data: response.data,
    };

    logger.info(
      `Request recieved at /api/user/auth/login | Request Object - ${JSON.stringify(
        { userId, ip: clientIP }
      )} | Response - ${JSON.stringify({"code": 200})}`
    );
    return res.status(200).json(data);
  } catch (error) {
    logger.error(
      `Request recieved at /api/user/auth/login | Request Object - ${JSON.stringify(
        { userId, ip: clientIP }
      )} | Response - ${JSON.stringify({ error })}`
    );
    return res.status(500).json({ error });
  }
};

Auth.SecurePass = async (req, res, next) => {
  try {
    const { username, response } = req.body;

    const requestBody = {
      username,
      response,
      userGroup: "Providus",
      linkId: "52",
    };

    const resp = await request.SendRequest(
      "POST",
      process.env.ENTRUST_URL,
      requestBody
    );


    if (resp.data.isSuccessful === "true") {
      await sql.connect(process.env.MSSQL);
      const user =
        await sql.query`SELECT * from stand_order_users where user_id = ${username}`;
      let token = generateToken(user.recordset[0]);
      let data = {
        token: `JWT ${token}`,
        responseCode: 200,
      };
      logger.info(
        `Request recieved at /api/user/auth/securepass | userId - ${username} | Request Object - ${JSON.stringify(
          requestBody
        )} | Response - ${JSON.stringify({"code": 200})}`
      );
      return res.status(200).json(data);
    } else {
      logger.error(
        `Request recieved at /api/user/auth/securepass | userId - ${username} | Request Object - ${JSON.stringify(
          requestBody
        )} | Response - ${resp.data.errorResponseMessage}`
      );
      return res.status(400).json(resp.data.errorResponseMessage);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = Auth;
