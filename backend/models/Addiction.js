const mongoose = require('mongoose');

const addictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  viceName: {
    type: String,
    required: true,
    enum: ['nicotine', 'chewing_tobacco', 'alcohol', 'cannabis', 'opioids', 'stimulants', 'gambling', 'other'],
  },
  customName: {
    type: String,
    default: '',
  },
  lastRelapseDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dailySpending: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  relapseHistory: [{
    date: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  }],
  motivationalNote: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Addiction', addictionSchema);
