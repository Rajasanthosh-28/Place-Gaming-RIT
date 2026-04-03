const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();
const { connectDB, isInMemory } = require('./config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

connectDB().then(() => console.log(isInMemory() ? '⚡ IN-MEMORY mode' : '🗄️ MongoDB mode'));

const app = express();
app.use(cors());
app.use(express.json());

// Resume uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Multer config for resume
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `resume_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF/DOC files allowed'));
  }
});

// =============================================
// IN-MEMORY DATA STORE (works without MongoDB)
// =============================================
const memoryDB = {
  users: [
    { _id: '1', name: 'Admin', email: 'admin@placement.com', password: '$2a$10$GGzd0YdvqR8UHbeW7RPkh.i6aszMsQFs12ehtilinh9jQjliMX2zW', role: 'admin', level: 10, xp: 500, coins: 2000, streak: 30, highestStreak: 30, totalScore: 25000, rankTitle: 'Expert', badges: ['Admin','Pioneer'], missionsCompleted: 50, jobsApplied: 20, interviewsUnlocked: 5, energy: 100, avatarTheme: 'default', quizzesTaken: 25, bestScore: 100, completedMissions: [], skills: ['Management','Full Stack'], resume: null, resumeUploadDate: null },
    { _id: '2', name: 'Alex Johnson', email: 'alex@example.com', password: '$2a$10$GGzd0YdvqR8UHbeW7RPkh.i6aszMsQFs12ehtilinh9jQjliMX2zW', role: 'user', level: 24, xp: 500, coins: 5000, streak: 45, highestStreak: 45, totalScore: 15450, rankTitle: 'Legend', badges: ['Perfect Score','Quiz Warrior','Code Master'], missionsCompleted: 80, jobsApplied: 15, interviewsUnlocked: 8, energy: 95, avatarTheme: 'neon', quizzesTaken: 50, bestScore: 100, completedMissions: [], skills: ['React','Node.js','Python'], resume: null, resumeUploadDate: null },
    { _id: '3', name: 'Sarah Miller', email: 'sarah@example.com', password: '$2a$10$GGzd0YdvqR8UHbeW7RPkh.i6aszMsQFs12ehtilinh9jQjliMX2zW', role: 'user', level: 22, xp: 400, coins: 4200, streak: 33, highestStreak: 40, totalScore: 14200, rankTitle: 'Pro', badges: ['Quiz Warrior','Speed Demon'], missionsCompleted: 60, jobsApplied: 12, interviewsUnlocked: 5, energy: 80, avatarTheme: 'default', quizzesTaken: 35, bestScore: 95, completedMissions: [], skills: ['Python','ML','SQL'], resume: null, resumeUploadDate: null },
    { _id: '4', name: 'David Kim', email: 'david@example.com', password: '$2a$10$GGzd0YdvqR8UHbeW7RPkh.i6aszMsQFs12ehtilinh9jQjliMX2zW', role: 'user', level: 21, xp: 300, coins: 3800, streak: 20, highestStreak: 28, totalScore: 13800, rankTitle: 'Pro', badges: ['Quiz Warrior'], missionsCompleted: 55, jobsApplied: 10, interviewsUnlocked: 4, energy: 90, avatarTheme: 'default', quizzesTaken: 30, bestScore: 90, completedMissions: [], skills: ['Java','Spring','AWS'], resume: null, resumeUploadDate: null },
  ],
  jobs: [
    { _id: 'j1', title: 'Frontend Developer', company: 'Google', location: 'Remote', salary: '20 LPA', skillsRequired: ['React','CSS','JavaScript'], xpReward: 150, coinsReward: 50, description: 'Build world-class user interfaces for Google products. Work with a team of designers and engineers to create pixel-perfect responsive web applications.', minLevel: 1, eligibility: 'B.Tech CS/IT, 60%+ aggregate', deadline: '2026-04-30', applicants: [] },
    { _id: 'j2', title: 'Data Scientist', company: 'Amazon', location: 'Bangalore', salary: '25 LPA', skillsRequired: ['Python','ML','SQL'], xpReward: 200, coinsReward: 100, description: 'Analyze massive datasets to drive business decisions. Build ML models for recommendation systems and demand forecasting.', minLevel: 3, eligibility: 'B.Tech/M.Tech, 65%+ aggregate', deadline: '2026-05-15', applicants: [] },
    { _id: 'j3', title: 'Backend Engineer', company: 'Microsoft', location: 'Hybrid', salary: '22 LPA', skillsRequired: ['Node.js','MongoDB','REST APIs'], xpReward: 180, coinsReward: 80, description: 'Design and build scalable microservices. Work on Azure cloud infrastructure and distributed systems.', minLevel: 2, eligibility: 'B.Tech CS/IT', deadline: '2026-04-20', applicants: [] },
    { _id: 'j4', title: 'Full Stack Developer', company: 'Meta', location: 'Remote', salary: '28 LPA', skillsRequired: ['React','Node.js','GraphQL'], xpReward: 250, coinsReward: 120, description: 'Build end-to-end features for social media platforms used by billions. Work across the entire stack.', minLevel: 5, eligibility: 'B.Tech/M.Tech, 70%+ aggregate', deadline: '2026-05-01', applicants: [] },
    { _id: 'j5', title: 'DevOps Engineer', company: 'Netflix', location: 'On-site', salary: '30 LPA', skillsRequired: ['Docker','Kubernetes','AWS'], xpReward: 300, coinsReward: 150, description: 'Build and maintain CI/CD pipelines. Automate cloud infrastructure for the worlds largest streaming platform.', minLevel: 8, eligibility: 'B.Tech CS/IT, 65%+ aggregate', deadline: '2026-06-01', applicants: [] },
    { _id: 'j6', title: 'AI/ML Engineer', company: 'OpenAI', location: 'Remote', salary: '35 LPA', skillsRequired: ['PyTorch','LLMs','Python'], xpReward: 400, coinsReward: 200, description: 'Research and develop large language models. Push the boundaries of artificial intelligence.', minLevel: 10, eligibility: 'M.Tech/PhD preferred', deadline: '2026-06-30', applicants: [] },
  ],
  quizzes: [
    { _id: 'q1', question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 1, category: 'technical', difficulty: 'easy' },
    { _id: 'q2', question: 'Which data structure uses FIFO?', options: ['Stack', 'Queue', 'Tree', 'Graph'], correctAnswer: 1, category: 'technical', difficulty: 'easy' },
    { _id: 'q3', question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Question Language', 'Structured Question Language', 'Sequential Query Language'], correctAnswer: 0, category: 'technical', difficulty: 'easy' },
    { _id: 'q4', question: 'Which sorting has best avg complexity?', options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'], correctAnswer: 2, category: 'technical', difficulty: 'medium' },
    { _id: 'q5', question: 'Speed of train 360km in 4h?', options: ['80 km/h', '90 km/h', '85 km/h', '95 km/h'], correctAnswer: 1, category: 'aptitude', difficulty: 'easy' },
    { _id: 'q6', question: 'What is 15% of 200?', options: ['25', '30', '35', '20'], correctAnswer: 1, category: 'aptitude', difficulty: 'easy' },
    { _id: 'q7', question: 'Buy 500 sell 600. Profit%?', options: ['10%', '15%', '20%', '25%'], correctAnswer: 2, category: 'aptitude', difficulty: 'easy' },
    { _id: 'q8', question: 'Polymorphism in OOP?', options: ['Data hiding','Multiple forms','Inheriting','Creating objects'], correctAnswer: 1, category: 'programming', difficulty: 'medium' },
    { _id: 'q9', question: 'Prevent overriding in Java?', options: ['static', 'final', 'abstract', 'const'], correctAnswer: 1, category: 'programming', difficulty: 'medium' },
    { _id: 'q10', question: 'console.log(typeof null)?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], correctAnswer: 2, category: 'programming', difficulty: 'medium' },
    { _id: 'q11', question: 'Next: 2,6,12,20,?', options: ['28', '30', '32', '24'], correctAnswer: 1, category: 'aptitude', difficulty: 'medium' },
    { _id: 'q12', question: 'Deadlock in OS?', options: ['Fast execution','Circular wait','Memory overflow','CPU scheduling'], correctAnswer: 1, category: 'technical', difficulty: 'medium' },
  ],
  // CODING CHALLENGES
  codingChallenges: [
    { _id: 'c1', title: 'Reverse a String', description: 'Write a function that reverses a given string.', difficulty: 'easy', xpReward: 100, coinsReward: 30, testCases: [{ input: '"hello"', expected: '"olleh"' }, { input: '"world"', expected: '"dlrow"' }, { input: '"abcd"', expected: '"dcba"' }], hint: 'Try using split, reverse, join', starterCode: 'function reverseString(str) {\n  // Your code here\n}' },
    { _id: 'c2', title: 'FizzBuzz', description: 'Return "Fizz" for multiples of 3, "Buzz" for 5, "FizzBuzz" for both, else the number.', difficulty: 'easy', xpReward: 120, coinsReward: 40, testCases: [{ input: '3', expected: '"Fizz"' }, { input: '5', expected: '"Buzz"' }, { input: '15', expected: '"FizzBuzz"' }, { input: '7', expected: '7' }], hint: 'Use modulo operator %', starterCode: 'function fizzBuzz(n) {\n  // Your code here\n}' },
    { _id: 'c3', title: 'Palindrome Check', description: 'Check if a string is a palindrome (reads same forwards and backwards).', difficulty: 'easy', xpReward: 100, coinsReward: 30, testCases: [{ input: '"racecar"', expected: 'true' }, { input: '"hello"', expected: 'false' }, { input: '"madam"', expected: 'true' }], hint: 'Compare original with reversed', starterCode: 'function isPalindrome(str) {\n  // Your code here\n}' },
    { _id: 'c4', title: 'Two Sum', description: 'Find two numbers in array that add up to target. Return their indices.', difficulty: 'medium', xpReward: 200, coinsReward: 80, testCases: [{ input: '[2,7,11,15], target=9', expected: '[0,1]' }, { input: '[3,2,4], target=6', expected: '[1,2]' }], hint: 'Use a hashmap for O(n) solution', starterCode: 'function twoSum(nums, target) {\n  // Your code here\n}' },
    { _id: 'c5', title: 'Fibonacci Sequence', description: 'Return the nth Fibonacci number (0-indexed: 0,1,1,2,3,5,8...).', difficulty: 'medium', xpReward: 180, coinsReward: 60, testCases: [{ input: '0', expected: '0' }, { input: '1', expected: '1' }, { input: '6', expected: '8' }, { input: '10', expected: '55' }], hint: 'Use iterative approach for efficiency', starterCode: 'function fibonacci(n) {\n  // Your code here\n}' },
    { _id: 'c6', title: 'Find Maximum Subarray Sum', description: 'Find the contiguous subarray with the largest sum (Kadane algorithm).', difficulty: 'hard', xpReward: 350, coinsReward: 150, testCases: [{ input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' }, { input: '[1]', expected: '1' }], hint: "Track current sum and max sum, reset current if it goes negative", starterCode: 'function maxSubArray(nums) {\n  // Your code here\n}' },
  ],
  // SPEED CHALLENGE QUESTIONS (short, quick-answer)
  speedQuestions: [
    { _id: 's1', question: '5 + 3 × 2 = ?', options: ['16', '11', '13', '10'], correctAnswer: 1 },
    { _id: 's2', question: 'Capital of Japan?', options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'], correctAnswer: 2 },
    { _id: 's3', question: 'Largest planet?', options: ['Mars', 'Jupiter', 'Saturn', 'Neptune'], correctAnswer: 1 },
    { _id: 's4', question: 'HTTP stands for?', options: ['HyperText Transfer Protocol', 'High Tech Protocol', 'HyperText Transmission Path', 'Home Tool Transfer Protocol'], correctAnswer: 0 },
    { _id: 's5', question: 'Binary of 10?', options: ['1010', '1100', '1001', '1110'], correctAnswer: 0 },
    { _id: 's6', question: '√144 = ?', options: ['14', '12', '11', '13'], correctAnswer: 1 },
    { _id: 's7', question: 'CSS stands for?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Colorful Style Sheets'], correctAnswer: 1 },
    { _id: 's8', question: 'Boiling point of water?', options: ['90°C', '100°C', '110°C', '80°C'], correctAnswer: 1 },
    { _id: 's9', question: '2^10 = ?', options: ['512', '1024', '2048', '256'], correctAnswer: 1 },
    { _id: 's10', question: 'Who created Linux?', options: ['Bill Gates', 'Steve Jobs', 'Linus Torvalds', 'Dennis Ritchie'], correctAnswer: 2 },
    { _id: 's11', question: 'React is made by?', options: ['Google', 'Facebook', 'Twitter', 'Amazon'], correctAnswer: 1 },
    { _id: 's12', question: 'What is 7! ?', options: ['720', '5040', '40320', '120'], correctAnswer: 1 },
    { _id: 's13', question: 'RAM is volatile?', options: ['True', 'False', 'Sometimes', 'Never'], correctAnswer: 0 },
    { _id: 's14', question: 'Git command to save changes?', options: ['git push', 'git save', 'git commit', 'git store'], correctAnswer: 2 },
    { _id: 's15', question: 'Fastest sorting algorithm?', options: ['Bubble', 'Quick Sort', 'Insertion', 'Selection'], correctAnswer: 1 },
  ],
  // PUZZLE DATA
  puzzles: [
    { _id: 'p1', type: 'pattern', question: 'What comes next: 1, 1, 2, 3, 5, 8, ?', options: ['10', '13', '11', '12'], correctAnswer: 1, xpReward: 80, difficulty: 'easy' },
    { _id: 'p2', type: 'pattern', question: 'Complete: A1, B2, C3, D4, ?', options: ['E5', 'F5', 'E6', 'D5'], correctAnswer: 0, xpReward: 60, difficulty: 'easy' },
    { _id: 'p3', type: 'logic', question: 'If all cats are animals and some animals are dogs, which is TRUE?', options: ['All cats are dogs', 'Some cats may be dogs', 'No cats are dogs', 'All dogs are cats'], correctAnswer: 2, xpReward: 100, difficulty: 'medium' },
    { _id: 'p4', type: 'pattern', question: '2, 6, 18, 54, ?', options: ['108', '162', '148', '172'], correctAnswer: 1, xpReward: 80, difficulty: 'easy' },
    { _id: 'p5', type: 'logic', question: 'A is taller than B. B is taller than C. Who is shortest?', options: ['A', 'B', 'C', 'Cannot determine'], correctAnswer: 2, xpReward: 70, difficulty: 'easy' },
    { _id: 'p6', type: 'logic', question: 'If APPLE = 50 and BANANA = 42, what is CHERRY?', options: ['58', '63', '72', '54'], correctAnswer: 2, xpReward: 150, difficulty: 'hard' },
    { _id: 'p7', type: 'pattern', question: 'Mirror image of b is?', options: ['d', 'p', 'q', 'b'], correctAnswer: 0, xpReward: 50, difficulty: 'easy' },
    { _id: 'p8', type: 'logic', question: 'How many squares on a chess board?', options: ['64', '204', '196', '128'], correctAnswer: 1, xpReward: 200, difficulty: 'hard' },
  ],
  // MISSIONS
  missions: [
    { _id: 'm1', title: 'Complete Your Profile', description: 'Upload a profile picture and fill in your details', xpReward: 50, coinsReward: 100, type: 'profile' },
    { _id: 'm2', title: 'Take Your First Quiz', description: 'Complete any quiz challenge', xpReward: 75, coinsReward: 50, type: 'quiz' },
    { _id: 'm3', title: 'Apply For a Job', description: 'Submit an application to any job listing', xpReward: 100, coinsReward: 75, type: 'job' },
    { _id: 'm4', title: 'Solve a Coding Challenge', description: 'Complete any coding challenge', xpReward: 150, coinsReward: 100, type: 'coding' },
    { _id: 'm5', title: 'Reach Level 3', description: 'Accumulate enough XP to reach Level 3', xpReward: 200, coinsReward: 150, type: 'level' },
    { _id: 'm6', title: 'Win a Speed Challenge', description: 'Score 70%+ in a speed challenge round', xpReward: 125, coinsReward: 80, type: 'speed' },
    { _id: 'm7', title: 'Earn 5 Badges', description: 'Collect at least 5 different badges', xpReward: 300, coinsReward: 200, type: 'badges' },
    { _id: 'm8', title: 'Solve 3 Puzzles', description: 'Complete 3 logic or pattern puzzles', xpReward: 100, coinsReward: 60, type: 'puzzle' },
  ],
  scores: [],
  applications: [],
  nextUserId: 100,
  nextAppId: 1000,
};

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Helper to level up
const levelUp = (user) => {
  const reqXp = user.level * 1000;
  if (user.xp >= reqXp) {
    user.level += 1; user.xp -= reqXp;
    if (user.level >= 5) user.rankTitle = 'Pro';
    if (user.level >= 10) user.rankTitle = 'Expert';
    if (user.level >= 20) user.rankTitle = 'Legend';
    if (!user.badges.includes('Level ' + user.level)) user.badges.push('Level ' + user.level);
  }
};

const memProtect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer')) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    req.user = memoryDB.users.find(u => u._id === decoded.id);
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch { return res.status(401).json({ message: 'Token failed' }); }
};

// =====================
// AUTH ROUTES
// =====================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password min 6 chars' });
    if (memoryDB.users.find(u => u.email === email)) return res.status(400).json({ message: 'User already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const newUser = { _id: String(memoryDB.nextUserId++), name, email, password: hashed, role: 'user', level: 1, xp: 0, coins: 100, streak: 0, highestStreak: 0, totalScore: 0, rankTitle: 'Rookie', badges: ['Newcomer'], missionsCompleted: 0, jobsApplied: 0, interviewsUnlocked: 0, energy: 100, avatarTheme: 'default', quizzesTaken: 0, bestScore: 0, completedMissions: [], skills: [], resume: null, resumeUploadDate: null };
    memoryDB.users.push(newUser);
    const { password: _, ...safe } = newUser;
    res.status(201).json({ ...safe, token: generateToken(newUser._id) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = memoryDB.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (!(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid email or password' });
    const { password: _, ...safe } = user;
    res.json({ ...safe, token: generateToken(user._id) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/auth/me', memProtect, (req, res) => {
  const { password, ...safe } = req.user;
  res.json(safe);
});

// =====================
// JOB ROUTES (Full CRUD)
// =====================
// GET all jobs
app.get('/api/jobs', (req, res) => {
  const jobs = memoryDB.jobs.map(j => ({ ...j, applicantCount: (j.applicants || []).length }));
  res.json(jobs);
});

// GET single job
app.get('/api/jobs/:id', (req, res) => {
  const job = memoryDB.jobs.find(j => j._id === req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json({ ...job, applicantCount: (job.applicants || []).length });
});

// POST create job (admin)
app.post('/api/jobs', memProtect, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const { title, company, location, salary, description, skillsRequired, eligibility, deadline } = req.body;
  if (!title || !company) return res.status(400).json({ message: 'Title and company are required' });
  const job = { _id: 'j' + Date.now(), title, company, location: location || 'Remote', salary: salary || 'Competitive', description: description || '', skillsRequired: skillsRequired || [], eligibility: eligibility || '', deadline: deadline || '', xpReward: 150, coinsReward: 50, minLevel: 1, applicants: [] };
  memoryDB.jobs.push(job);
  res.status(201).json(job);
});

// PUT update job (admin)
app.put('/api/jobs/:id', memProtect, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const idx = memoryDB.jobs.findIndex(j => j._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Job not found' });
  memoryDB.jobs[idx] = { ...memoryDB.jobs[idx], ...req.body };
  res.json(memoryDB.jobs[idx]);
});

// DELETE job (admin)
app.delete('/api/jobs/:id', memProtect, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const idx = memoryDB.jobs.findIndex(j => j._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Job not found' });
  memoryDB.jobs.splice(idx, 1);
  // Remove related applications
  memoryDB.applications = memoryDB.applications.filter(a => a.jobId !== req.params.id);
  res.json({ message: 'Job deleted' });
});

// =====================
// APPLICATION ROUTES
// =====================
// Apply for a job (auto-attach resume)
app.post('/api/apply/:jobId', memProtect, (req, res) => {
  const job = memoryDB.jobs.find(j => j._id === req.params.jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (req.user.level < (job.minLevel || 1)) return res.status(403).json({ message: `Reach Level ${job.minLevel} to unlock this job!` });
  // Check if already applied
  const existing = memoryDB.applications.find(a => a.userId === req.user._id && a.jobId === req.params.jobId);
  if (existing) return res.status(400).json({ message: 'Already applied to this job' });

  const app = {
    _id: 'app' + memoryDB.nextAppId++,
    userId: req.user._id,
    userName: req.user.name,
    userEmail: req.user.email,
    jobId: job._id,
    jobTitle: job.title,
    company: job.company,
    resume: req.user.resume || null,
    status: 'Applied',
    appliedDate: new Date().toISOString(),
  };
  memoryDB.applications.push(app);
  if (!job.applicants) job.applicants = [];
  job.applicants.push(req.user._id);

  // Gamification reward
  req.user.jobsApplied += 1;
  req.user.xp += job.xpReward || 50;
  req.user.coins += job.coinsReward || 10;
  req.user.totalScore += 25;
  levelUp(req.user);
  if (!req.user.badges.includes('Job Hunter') && req.user.jobsApplied >= 3) req.user.badges.push('Job Hunter');
  if (!req.user.badges.includes('Career Pro') && req.user.jobsApplied >= 10) req.user.badges.push('Career Pro');

  const { password, ...safe } = req.user;
  res.json({ message: 'Applied successfully!', application: app, user: safe });
});

// Get applications for logged-in user
app.get('/api/applications/user', memProtect, (req, res) => {
  const apps = memoryDB.applications.filter(a => a.userId === req.user._id);
  res.json(apps);
});

// Get all applications (admin)
app.get('/api/applications/admin', memProtect, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  res.json(memoryDB.applications);
});

// Update application status (admin)
app.put('/api/applications/:id/status', memProtect, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const app = memoryDB.applications.find(a => a._id === req.params.id);
  if (!app) return res.status(404).json({ message: 'Application not found' });
  const { status } = req.body;
  if (!['Applied', 'Shortlisted', 'Rejected', 'Hired'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  app.status = status;
  // Award XP when shortlisted or hired
  const user = memoryDB.users.find(u => u._id === app.userId);
  if (user && status === 'Shortlisted') { user.interviewsUnlocked += 1; user.xp += 100; user.coins += 50; levelUp(user); }
  if (user && status === 'Hired') { user.xp += 500; user.coins += 300; user.totalScore += 200; if (!user.badges.includes('Hired!')) user.badges.push('Hired!'); levelUp(user); }
  res.json(app);
});

// =====================
// RESUME ROUTES
// =====================
// Upload resume
app.post('/api/upload-resume', memProtect, upload.single('resume'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const resumeUrl = `/uploads/${req.file.filename}`;
  req.user.resume = resumeUrl;
  req.user.resumeUploadDate = new Date().toISOString();
  const { password, ...safe } = req.user;
  res.json({ message: 'Resume uploaded successfully', resumeUrl, user: safe });
});

// Get resume for a user
app.get('/api/resume/:userId', memProtect, (req, res) => {
  const user = memoryDB.users.find(u => u._id === req.params.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (!user.resume) return res.status(404).json({ message: 'No resume uploaded' });
  res.json({ resume: user.resume, uploadDate: user.resumeUploadDate });
});

// Update user skills
app.put('/api/auth/skills', memProtect, (req, res) => {
  const { skills } = req.body;
  if (!Array.isArray(skills)) return res.status(400).json({ message: 'Skills must be an array' });
  req.user.skills = skills;
  const { password, ...safe } = req.user;
  res.json(safe);
});

// =====================
// GAMIFICATION
// =====================
app.get('/api/gamification/leaderboard', (req, res) => {
  const sorted = [...memoryDB.users].filter(u => u.role !== 'admin').sort((a, b) => b.totalScore - a.totalScore).slice(0, 10).map(({ password, ...r }) => r);
  res.json(sorted);
});

app.post('/api/gamification/reward', memProtect, (req, res) => {
  const { action } = req.body;
  const u = req.user;
  if (action === 'daily_login') { u.streak += 1; if (u.streak > u.highestStreak) u.highestStreak = u.streak; u.coins += 50; u.xp += 20; }
  else if (action === 'complete_mission') { u.missionsCompleted += 1; u.xp += 100; u.coins += 100; u.totalScore += 50; }
  else if (action === 'apply_job') { u.jobsApplied += 1; u.xp += 50; u.coins += 10; u.totalScore += 25; }
  levelUp(u);
  const { password, ...safe } = u;
  res.json(safe);
});

// =====================
// QUIZ GAME
// =====================
app.get('/api/quiz', memProtect, (req, res) => {
  const { category, limit = 5 } = req.query;
  let qs = [...memoryDB.quizzes];
  if (category && category !== 'mixed') qs = qs.filter(q => q.category === category);
  for (let i = qs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [qs[i], qs[j]] = [qs[j], qs[i]]; }
  res.json(qs.slice(0, parseInt(limit)).map(({ correctAnswer, ...q }) => q));
});

app.post('/api/quiz/submit', memProtect, (req, res) => {
  const { answers, timeTaken, category } = req.body;
  const u = req.user;
  let correct = 0;
  for (const a of answers) { const q = memoryDB.quizzes.find(x => x._id === a.questionId); if (q && q.correctAnswer === a.selectedAnswer) correct++; }
  const pct = Math.round((correct / answers.length) * 100);
  u.quizzesTaken += 1; if (pct > u.bestScore) u.bestScore = pct;
  const xpE = correct * 25 + (pct >= 80 ? 100 : 0), coinsE = correct * 10;
  u.xp += xpE; u.coins += coinsE; u.totalScore += correct * 10; u.energy = Math.max(0, u.energy - 10);
  levelUp(u);
  if (pct === 100 && !u.badges.includes('Perfect Score')) u.badges.push('Perfect Score');
  if (u.quizzesTaken >= 5 && !u.badges.includes('Quiz Warrior')) u.badges.push('Quiz Warrior');
  res.json({ score: correct, totalQuestions: answers.length, percentage: pct, timeTaken, xpEarned: xpE, coinsEarned: coinsE, level: u.level, newBadges: u.badges });
});

// =====================
// CODING CHALLENGE GAME
// =====================
app.get('/api/coding', memProtect, (req, res) => {
  res.json(memoryDB.codingChallenges.map(({ testCases, ...c }) => ({ ...c, testCount: testCases.length })));
});

app.get('/api/coding/:id', memProtect, (req, res) => {
  const ch = memoryDB.codingChallenges.find(c => c._id === req.params.id);
  if (!ch) return res.status(404).json({ message: 'Challenge not found' });
  res.json(ch);
});

app.post('/api/coding/:id/submit', memProtect, (req, res) => {
  const ch = memoryDB.codingChallenges.find(c => c._id === req.params.id);
  if (!ch) return res.status(404).json({ message: 'Challenge not found' });
  const { code } = req.body;
  // Simple evaluation: check if code contains key patterns
  let passed = 0;
  try {
    // We evaluate the code safely in a limited way
    const fn = new Function('return ' + code)();
    for (const tc of ch.testCases) {
      try {
        const input = JSON.parse('[' + tc.input + ']');
        const result = fn(...input);
        const expected = JSON.parse(tc.expected);
        if (JSON.stringify(result) === JSON.stringify(expected)) passed++;
      } catch { /* test failed */ }
    }
  } catch { /* code error */ }
  const total = ch.testCases.length;
  const pct = Math.round((passed / total) * 100);
  const xpE = passed > 0 ? Math.round(ch.xpReward * (passed / total)) : 0;
  const coinsE = passed > 0 ? Math.round(ch.coinsReward * (passed / total)) : 0;
  const u = req.user;
  u.xp += xpE; u.coins += coinsE; u.totalScore += passed * 15;
  levelUp(u);
  if (pct === 100 && !u.badges.includes('Code Master')) u.badges.push('Code Master');
  res.json({ passed, total, percentage: pct, xpEarned: xpE, coinsEarned: coinsE, level: u.level });
});

// =====================
// SPEED CHALLENGE GAME
// =====================
app.get('/api/speed', memProtect, (req, res) => {
  let qs = [...memoryDB.speedQuestions];
  for (let i = qs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [qs[i], qs[j]] = [qs[j], qs[i]]; }
  res.json(qs.slice(0, 10).map(({ correctAnswer, ...q }) => q));
});

app.post('/api/speed/submit', memProtect, (req, res) => {
  const { answers, totalTime } = req.body;
  const u = req.user;
  let correct = 0;
  for (const a of answers) { const q = memoryDB.speedQuestions.find(x => x._id === a.questionId); if (q && q.correctAnswer === a.selectedAnswer) correct++; }
  const pct = Math.round((correct / answers.length) * 100);
  const timeBonus = totalTime < 30 ? 100 : totalTime < 60 ? 50 : 0;
  const xpE = correct * 20 + timeBonus, coinsE = correct * 8 + (timeBonus / 2);
  u.xp += xpE; u.coins += coinsE; u.totalScore += correct * 8;
  levelUp(u);
  if (pct >= 80 && !u.badges.includes('Speed Demon')) u.badges.push('Speed Demon');
  if (totalTime < 20 && pct >= 70 && !u.badges.includes('Lightning Fast')) u.badges.push('Lightning Fast');
  res.json({ correct, total: answers.length, percentage: pct, totalTime, xpEarned: xpE, coinsEarned: Math.round(coinsE), timeBonus, level: u.level, newBadges: u.badges });
});

// =====================
// PUZZLE GAME
// =====================
app.get('/api/puzzles', memProtect, (req, res) => {
  res.json(memoryDB.puzzles.map(({ correctAnswer, ...p }) => p));
});

app.post('/api/puzzles/submit', memProtect, (req, res) => {
  const { puzzleId, answer } = req.body;
  const p = memoryDB.puzzles.find(x => x._id === puzzleId);
  if (!p) return res.status(404).json({ message: 'Puzzle not found' });
  const correct = p.correctAnswer === answer;
  const u = req.user;
  if (correct) { u.xp += p.xpReward; u.coins += 20; u.totalScore += 15; levelUp(u); }
  if (!u.badges.includes('Puzzle Solver') && correct) u.badges.push('Puzzle Solver');
  res.json({ correct, correctAnswer: p.correctAnswer, xpEarned: correct ? p.xpReward : 0, level: u.level });
});

// =====================
// MISSIONS
// =====================
app.get('/api/missions', memProtect, (req, res) => {
  const completed = req.user.completedMissions || [];
  res.json(memoryDB.missions.map(m => ({ ...m, completed: completed.includes(m._id) })));
});

app.post('/api/missions/:id/complete', memProtect, (req, res) => {
  const m = memoryDB.missions.find(x => x._id === req.params.id);
  if (!m) return res.status(404).json({ message: 'Mission not found' });
  const u = req.user;
  if (!u.completedMissions) u.completedMissions = [];
  if (u.completedMissions.includes(m._id)) return res.status(400).json({ message: 'Already completed' });
  u.completedMissions.push(m._id);
  u.missionsCompleted += 1;
  u.xp += m.xpReward; u.coins += m.coinsReward; u.totalScore += 20;
  levelUp(u);
  if (u.missionsCompleted >= 5 && !u.badges.includes('Mission Master')) u.badges.push('Mission Master');
  const { password, ...safe } = u;
  res.json({ message: 'Mission completed!', user: safe });
});

// =====================
// ADMIN DASHBOARD
// =====================
app.get('/api/admin/stats', memProtect, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  res.json({
    totalUsers: memoryDB.users.filter(u => u.role === 'user').length,
    totalJobs: memoryDB.jobs.length,
    totalQuizzes: memoryDB.quizzes.length,
    totalChallenges: memoryDB.codingChallenges.length,
    topPlayer: memoryDB.users.filter(u => u.role === 'user').sort((a, b) => b.totalScore - a.totalScore)[0]?.name || 'N/A',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'in-memory', games: ['quiz','coding','speed','puzzle','missions'], timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
