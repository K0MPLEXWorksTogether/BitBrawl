const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  sumos: { type: Number, required: true, default: 0 },
  elo: { type: Number, required: true, default: 1200 },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  bio: String,
  organization: String,
  website: String,
  linkedin: String,
  name: String,
  github: String,
  refreshToken: String,
});

const User = mongoose.model("User", userSchema);
module.exports = User;
