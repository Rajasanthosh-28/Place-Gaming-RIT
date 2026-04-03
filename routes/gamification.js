const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/gamification/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find({ role: 'user' })
      .select('-password -email')
      .sort({ totalScore: -1, xp: -1 })
      .limit(10);
    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/gamification/reward
router.post('/reward', protect, async (req, res) => {
  try {
    const { action, value = 1 } = req.body;
    const user = await User.findById(req.user._id);

    if (action === 'daily_login') {
      user.streak += 1;
      if (user.streak > user.highestStreak) user.highestStreak = user.streak;
      user.coins += 50;
      user.xp += 20;
    } else if (action === 'complete_mission') {
      user.missionsCompleted += 1;
      user.xp += 100;
      user.coins += 100;
      user.totalScore += 50;
    } else if (action === 'apply_job') {
      user.jobsApplied += 1;
      user.xp += 50;
      user.coins += 10;
      user.totalScore += 25;
    }

    // Level up logic
    const reqXp = user.level * 1000;
    if (user.xp >= reqXp) {
      user.level += 1;
      user.xp -= reqXp;
      // rank title logic
      if(user.level >= 5) user.rankTitle = 'Pro';
      if(user.level >= 10) user.rankTitle = 'Expert';
      if(user.level >= 20) user.rankTitle = 'Legend';
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
