const mongoose = require("mongoose");

const { Schema } = mongoose;

const TokenSchema = new Schema({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiry: { type: Date, required: true },
});

const Token = mongoose.model("Token", TokenSchema);

module.exports = Token;
