const jwt = require("jsonwebtoken");
const ApiError = require("../utils/apiError");
const extractToken = (req) => {
  const bearerHeader = req.headers["authorization"];
  if (!bearerHeader) return false;

  const token = bearerHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return decoded;
  } catch (error) {
    return false;
  }
};

const verifyToken = (req, res, next) => {
  const user = extractToken(req);
  if (!user)
    throw new ApiError(401, [
      {
        msg: "Unauthorized",
      },
    ]);

  req.user = user;
  next();
};

module.exports = { verifyToken };
