const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Score = require('../models/Score');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// GET /api/quiz — get random questions
router.get('/', protect, async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    const filter = category && category !== 'mixed' ? { category } : {};
    const questions = await Quiz.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(limit) } },
      { $project: { correctAnswer: 0 } },
    ]);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/quiz/all — admin: get all questions with answers
router.get('/all', protect, admin, async (req, res) => {
  try {
    const questions = await Quiz.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/quiz — admin: add question
router.post('/', protect, admin, async (req, res) => {
  try {
    const { question, options, correctAnswer, category, difficulty } = req.body;
    const quiz = await Quiz.create({ question, options, correctAnswer, category, difficulty });
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/quiz/:id — admin: delete question
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/quiz/submit — submit quiz answers
router.post('/submit', protect, async (req, res) => {
  try {
    const { answers, timeTaken, category } = req.body;
    // answers = [{ questionId, selectedAnswer }]

    let correctCount = 0;
    for (const ans of answers) {
      const quiz = await Quiz.findById(ans.questionId);
      if (quiz && quiz.correctAnswer === ans.selectedAnswer) {
        correctCount++;
      }
    }

    const totalQuestions = answers.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    const score = await Score.create({
      user: req.user._id,
      score: correctCount,
      totalQuestions,
      percentage,
      timeTaken,
      category: category || 'mixed',
    });

    // Update user stats + gamification rewards
    const user = await User.findById(req.user._id);
    user.quizzesTaken = (user.quizzesTaken || 0) + 1;
    if (percentage > (user.bestScore || 0)) {
      user.bestScore = percentage;
    }

    // XP & coin rewards based on performance
    const xpEarned = correctCount * 25 + (percentage >= 80 ? 100 : 0);
    const coinsEarned = correctCount * 10;
    user.xp = (user.xp || 0) + xpEarned;
    user.coins = (user.coins || 0) + coinsEarned;
    user.totalScore = (user.totalScore || 0) + correctCount * 10;
    user.energy = Math.max(0, (user.energy || 100) - 10);

    // Level up logic
    const reqXp = user.level * 1000;
    if (user.xp >= reqXp) {
      user.level += 1;
      user.xp -= reqXp;
      if (user.level >= 5) user.rankTitle = 'Pro';
      if (user.level >= 10) user.rankTitle = 'Expert';
      if (user.level >= 20) user.rankTitle = 'Legend';
    }

    // Badge rewards
    if (percentage === 100 && !user.badges.includes('Perfect Score')) {
      user.badges.push('Perfect Score');
    }
    if (user.quizzesTaken >= 5 && !user.badges.includes('Quiz Warrior')) {
      user.badges.push('Quiz Warrior');
    }
    if (user.quizzesTaken >= 10 && !user.badges.includes('Knowledge Master')) {
      user.badges.push('Knowledge Master');
    }

    await user.save();

    res.json({
      score: correctCount,
      totalQuestions,
      percentage,
      timeTaken,
      xpEarned,
      coinsEarned,
      level: user.level,
      newBadges: user.badges,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/quiz/leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const scores = await Score.find()
      .sort({ percentage: -1, timeTaken: 1 })
      .limit(20)
      .populate('user', 'name email');
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
