const mongoose = require('mongoose');

const usageLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  addictionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Addiction',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  moneySpent: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  notes: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('UsageLog', usageLogSchema);
