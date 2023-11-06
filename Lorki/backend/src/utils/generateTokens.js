const jwt = require("jsonwebtoken");

const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "2d",
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

module.exports = {
  generateTokens,
};
