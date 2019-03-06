const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

const eventSchema = new Schema({
  eventID: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  startDate: {
    type: String,
    required: true,
    trim: true
  },
  endDate: {
    type: String,
    required: true,
    trim: true
  },
  unusedColors: [String],
  people: {}
});

let eventModel = mongoose.model("events", eventSchema);

module.exports = { eventModel, eventSchema };