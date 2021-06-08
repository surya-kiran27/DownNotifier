const mongoose = require("mongoose");

const { Schema } = mongoose;

const EventSchema = new Schema({
  originTime: { type: String, required: true },
  createdAt: { type: Date, default: new Date() },
  status: { type: String, required: true },
});

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
