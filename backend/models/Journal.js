const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxLength: 100,
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxLength: 5000,
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'neutral', 'bad', 'terrible'],
    default: 'neutral',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isPrivate: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Journal', journalSchema);
