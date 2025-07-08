const bcrypt = require("bcrypt");

exports.generatePasswordHash = async (password) => {
  return await bcrypt.hash(password, parseInt(process.env.SALT));
};

exports.verifyPasswordHash = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
