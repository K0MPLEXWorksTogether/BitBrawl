const jwt = require("jsonwebtoken");

// TODO: The Same Token Is Being Generated For Refresh As Well As Access Tokens
exports.generateToken = (payload, refreshToken = false) => {
  if (refreshToken) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
