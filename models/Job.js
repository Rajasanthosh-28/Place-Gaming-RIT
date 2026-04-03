const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, default: 'Remote' },
  salary: { type: String },
  requirements: [{ type: String }],
  // Gamification properties
  xpReward: { type: Number, default: 50 },
  coinsReward: { type: Number, default: 10 },
  minLevelRequired: { type: Number, default: 1 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
