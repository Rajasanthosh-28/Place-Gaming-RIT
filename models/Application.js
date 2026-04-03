const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['applied', 'under_review', 'interview', 'rejected', 'hired'], default: 'applied' },
  appliedAt: { type: Date, default: Date.now },
  xpEarned: { type: Boolean, default: false }, // To track if gamification rewards were given
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
