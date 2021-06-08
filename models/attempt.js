const mongoose = require("mongoose");

const { Schema } = mongoose;

const AttemptSchema = new Schema({
  email: { type: String, required: true, unique: true },
  attempts: { type: Number, default: 0 },
});

const Subscription = mongoose.model("Attempt", AttemptSchema);

module.exports = Subscription;
