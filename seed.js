const mongoose = require('mongoose');
require('dotenv').config();
const Quiz = require('./models/Quiz');
const User = require('./models/User');

const sampleQuestions = [
  {
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 1,
    category: 'technical',
    difficulty: 'easy',
  },
  {
    question: 'Which data structure uses FIFO?',
    options: ['Stack', 'Queue', 'Tree', 'Graph'],
    correctAnswer: 1,
    category: 'technical',
    difficulty: 'easy',
  },
  {
    question: 'What does SQL stand for?',
    options: ['Structured Query Language', 'Simple Question Language', 'Structured Question Language', 'Sequential Query Language'],
    correctAnswer: 0,
    category: 'technical',
    difficulty: 'easy',
  },
  {
    question: 'Which sorting algorithm has the best average-case time complexity?',
    options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
    correctAnswer: 2,
    category: 'technical',
    difficulty: 'medium',
  },
  {
    question: 'What is polymorphism in OOP?',
    options: ['Data hiding', 'Multiple forms of a function', 'Inheriting from parent', 'Creating objects'],
    correctAnswer: 1,
    category: 'technical',
    difficulty: 'medium',
  },
  {
    question: 'If a train travels 360 km in 4 hours, what is its speed?',
    options: ['80 km/h', '90 km/h', '85 km/h', '95 km/h'],
    correctAnswer: 1,
    category: 'aptitude',
    difficulty: 'easy',
  },
  {
    question: 'What is 15% of 200?',
    options: ['25', '30', '35', '20'],
    correctAnswer: 1,
    category: 'aptitude',
    difficulty: 'easy',
  },
  {
    question: 'A man buys an article for ₹500 and sells it for ₹600. What is the profit percentage?',
    options: ['10%', '15%', '20%', '25%'],
    correctAnswer: 2,
    category: 'aptitude',
    difficulty: 'easy',
  },
  {
    question: 'If A can do a work in 10 days and B can do it in 15 days, how many days will they take together?',
    options: ['5 days', '6 days', '7 days', '8 days'],
    correctAnswer: 1,
    category: 'aptitude',
    difficulty: 'medium',
  },
  {
    question: 'Find the next number in the series: 2, 6, 12, 20, ?',
    options: ['28', '30', '32', '24'],
    correctAnswer: 1,
    category: 'reasoning',
    difficulty: 'medium',
  },
  {
    question: 'Which keyword is used to prevent method overriding in Java?',
    options: ['static', 'final', 'abstract', 'const'],
    correctAnswer: 1,
    category: 'programming',
    difficulty: 'medium',
  },
  {
    question: 'What is the output of: console.log(typeof null) in JavaScript?',
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    correctAnswer: 2,
    category: 'programming',
    difficulty: 'medium',
  },
  {
    question: 'Choose the correct synonym: "Benevolent"',
    options: ['Cruel', 'Kind', 'Angry', 'Lazy'],
    correctAnswer: 1,
    category: 'verbal',
    difficulty: 'easy',
  },
  {
    question: 'Which of the following is a valid HTTP status code for "Not Found"?',
    options: ['200', '301', '404', '500'],
    correctAnswer: 2,
    category: 'technical',
    difficulty: 'easy',
  },
  {
    question: 'What is the worst-case time complexity of quicksort?',
    options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
    correctAnswer: 2,
    category: 'technical',
    difficulty: 'hard',
  },
  {
    question: 'In a race, A beats B by 20 meters and B beats C by 30 meters. By how much does A beat C in a 100m race?',
    options: ['44 meters', '50 meters', '46 meters', '48 meters'],
    correctAnswer: 0,
    category: 'aptitude',
    difficulty: 'hard',
  },
  {
    question: 'What is a deadlock in operating systems?',
    options: ['Fast process execution', 'Circular wait for resources', 'Memory overflow', 'CPU scheduling'],
    correctAnswer: 1,
    category: 'technical',
    difficulty: 'medium',
  },
  {
    question: 'Which design pattern ensures only one instance of a class?',
    options: ['Factory', 'Observer', 'Singleton', 'Strategy'],
    correctAnswer: 2,
    category: 'programming',
    difficulty: 'medium',
  },
  {
    question: 'What does REST stand for?',
    options: ['Representational State Transfer', 'Remote Execution Service Technology', 'Reliable State Transition', 'Resource Estimation System'],
    correctAnswer: 0,
    category: 'technical',
    difficulty: 'easy',
  },
  {
    question: 'Complete the analogy: Bird : Nest :: Bee : ?',
    options: ['Honey', 'Flower', 'Hive', 'Sting'],
    correctAnswer: 2,
    category: 'reasoning',
    difficulty: 'easy',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Quiz.deleteMany({});
    console.log('Cleared quiz collection');

    // Insert sample questions
    await Quiz.insertMany(sampleQuestions);
    console.log(`Inserted ${sampleQuestions.length} sample questions`);

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@placement.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@placement.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('Created admin user: admin@placement.com / admin123');
    }

    console.log('Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
