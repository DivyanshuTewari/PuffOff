const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
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
  urgeMeter: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  triggers: {
    type: String,
    default: '',
    maxLength: 500,
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'neutral', 'bad', 'terrible'],
    default: 'neutral',
  },
  notes: {
    type: String,
    default: '',
    maxLength: 1000,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('CheckIn', checkInSchema);
