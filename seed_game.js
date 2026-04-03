const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Job = require('./models/Job');

const sampleJobs = [
    { title: 'Frontend Developer', company: 'Google', location: 'Remote', salary: '20LPA', requirements: ['React', 'CSS', 'Vite'], xpReward: 150, coinsReward: 50 },
    { title: 'Data Scientist', company: 'Amazon', location: 'On-site', salary: '25LPA', requirements: ['Python', 'ML', 'SQL'], xpReward: 200, coinsReward: 100 },
    { title: 'Backend Engineer', company: 'Microsoft', location: 'Hybrid', salary: '22LPA', requirements: ['Node', 'SQL', 'MongoDB'], xpReward: 180, coinsReward: 80 }
];

const sampleUsers = [
    { name: 'Alex Johnson', email: 'alex@example.com', password: 'password123', level: 24, totalScore: 15450, rankTitle: 'Legend', xp: 500 },
    { name: 'Sarah Miller', email: 'sarah@example.com', password: 'password123', level: 22, totalScore: 14200, rankTitle: 'Pro', xp: 400 },
    { name: 'David Kim', email: 'david@example.com', password: 'password123', level: 21, totalScore: 13800, rankTitle: 'Pro', xp: 300 }
];

async function seedGame() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete existing ones
        await Job.deleteMany({});
        await User.deleteMany({ email: { $nin: ['admin@placement.com'] } });
        console.log('Cleared jobs and demo users');

        // Insert new
        await Job.insertMany(sampleJobs);
        console.log(`Inserted ${sampleJobs.length} sample Jobs`);

        for(let u of sampleUsers) {
            await User.create(u); // Using create to hash password
        }
        console.log(`Inserted ${sampleUsers.length} elite players for leaderboard`);

        console.log('Game Data Seeding Complete!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seedGame();
