const mongoose = require("mongoose");

const { Schema } = mongoose;

const SubscriptionSchema = new Schema({
  email: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
});

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

module.exports = Subscription;
