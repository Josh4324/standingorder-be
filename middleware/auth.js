const jwt = require("jsonwebtoken");

const AuthMiddleware = {};

AuthMiddleware.generateAccessToken = function generateAccessToken(userLoad) {
  return jwt.sign(userLoad, process.env.SECRET_OR_KEY);
};

AuthMiddleware.verifyToken = function verifyToken(req, res, next) {
  let bearer = req.headers["authorization"];

  let token = bearer ? bearer.split(" ")[1] : null;

  if (!token) return res.status(401).json({ error: "Access Denied" });

  function verifyCallBack(error, decode) {
    if (error) return res.status(401).json({ error: "Access Denied" });

    res.decoded = decode;

    return next();
  }

  return jwt.verify(token, process.env.SECRET_OR_KEY, verifyCallBack);
};

module.exports = AuthMiddleware;
