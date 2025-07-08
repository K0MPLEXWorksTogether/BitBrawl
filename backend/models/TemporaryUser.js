const mongoose = require("mongoose");

const temporaryUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  uuid: { type: String, required: true },
});

const temporaryUser = mongoose.model("temporaryUser", temporaryUserSchema);
module.exports = temporaryUser;
