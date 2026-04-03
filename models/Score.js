const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  timeTaken: {
    type: Number, // in seconds
    required: true,
  },
  category: {
    type: String,
    default: 'mixed',
  },
}, { timestamps: true });

module.exports = mongoose.model('Score', scoreSchema);
