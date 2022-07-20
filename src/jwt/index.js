const JWT = require("jsonwebtoken");

const jwtUtils = {
  getJWTToken: (user) => {
    return JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_SECRET_EXPIRE,
    });
  },
};

module.exports = jwtUtils;
