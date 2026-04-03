const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// System prompt that makes the AI a placement expert
const SYSTEM_PROMPT = `You are PlacePrep AI, an expert AI placement training assistant for college students preparing for campus placements and job interviews.

Your expertise covers:
1. **Interview Preparation**: Common HR questions, behavioral questions, STAR method answers, how to introduce yourself, strengths/weaknesses, salary negotiation
2. **Technical Topics**: Data Structures & Algorithms, OOP concepts, DBMS/SQL, Operating Systems, Computer Networks, System Design basics
3. **Aptitude & Reasoning**: Quantitative aptitude, logical reasoning, verbal ability tips and shortcuts
4. **Resume Building**: Resume formatting, action verbs, quantifying achievements, ATS-friendly tips
5. **Project Guidance**: Project ideas, how to present projects, GitHub best practices
6. **Company-Specific Prep**: Tips for service companies (TCS, Infosys, Wipro), product companies (Google, Amazon, Microsoft), and startups
7. **Soft Skills**: Communication, teamwork, leadership examples, group discussion tips

Guidelines:
- Give structured, actionable answers with examples
- Use bullet points and bold text for readability (use **bold** markdown syntax)
- Keep responses concise but comprehensive (aim for 150-300 words)
- Include practical tips and real examples when possible
- Be encouraging and supportive
- If asked something unrelated to placements/careers/tech, politely redirect to placement topics
- Use emojis sparingly for engagement (1-2 per response)`;

// Conversation history storage (in-memory, per user)
const conversationHistory = new Map();

// POST /api/chatbot
router.post('/', protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Please provide a message' });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // If no OpenAI key, fall back to knowledge base
    if (!apiKey || apiKey === 'your_key') {
      return fallbackResponse(message, res);
    }

    // Get or create conversation history for this user
    const userId = req.user._id.toString();
    if (!conversationHistory.has(userId)) {
      conversationHistory.set(userId, []);
    }

    const history = conversationHistory.get(userId);

    // Add user message to history
    history.push({ role: 'user', content: message });

    // Keep only last 10 messages to manage token usage
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }

    // Build messages array for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', response.status, errorData);

      // If API fails, fall back to knowledge base
      // Remove the user message we just added since we're falling back
      history.pop();
      return fallbackResponse(message, res);
    }

    const data = await response.json();
    const botMessage = data.choices[0].message.content;

    // Add assistant response to history
    history.push({ role: 'assistant', content: botMessage });

    res.json({
      message: botMessage,
      timestamp: new Date().toISOString(),
      source: 'openai',
    });
  } catch (error) {
    console.error('Chatbot error:', error.message);
    // Fall back to knowledge base on any error
    return fallbackResponse(req.body.message || '', res);
  }
});

// Clear conversation history
router.delete('/history', protect, (req, res) => {
  const userId = req.user._id.toString();
  conversationHistory.delete(userId);
  res.json({ message: 'Conversation history cleared' });
});

// ──── Fallback Knowledge Base ────
const knowledgeBase = [
  {
    keywords: ['tell me about yourself', 'introduce yourself', 'about yourself'],
    response: `**How to answer "Tell me about yourself":**\n\n1. **Start with your current position/education**: "I'm a final year Computer Science student at [University]..."\n2. **Highlight relevant experience**: Mention internships, projects, or skills\n3. **Connect to the role**: Show why you're interested in this opportunity\n4. **Keep it 1-2 minutes**\n\n**Example**: "I'm a Computer Science graduate passionate about full-stack development. I've built several web applications using React and Node.js, including [specific project]. During my internship at [company], I worked on [task]. I'm excited about this role because [reason]."`,
  },
  {
    keywords: ['strength', 'strengths', 'strong point'],
    response: `**How to answer "What are your strengths?":**\n\n1. Choose strengths relevant to the job\n2. Back each with a specific example\n3. Common good answers:\n   - **Problem-solving**: "I enjoy breaking down complex problems..."\n   - **Quick learner**: "I taught myself React in 2 weeks for a project..."\n   - **Team player**: "In my last project, I coordinated between..."\n   - **Attention to detail**: "I caught a critical bug that..."\n\nAlways use the **STAR method** (Situation, Task, Action, Result) to structure your answer.`,
  },
  {
    keywords: ['weakness', 'weaknesses', 'weak point'],
    response: `**How to answer "What are your weaknesses?":**\n\n1. Choose a genuine but non-critical weakness\n2. Show self-awareness and improvement efforts\n3. **Good examples**:\n   - "I sometimes over-analyze problems, but I've learned to set time limits for decision-making"\n   - "I used to struggle with public speaking, so I joined a debate club"\n   - "I tend to take on too much work, but I'm learning to delegate and prioritize"\n\n**Avoid**: "I'm a perfectionist" or "I work too hard" — these sound insincere.`,
  },
  {
    keywords: ['dsa', 'data structure', 'algorithm', 'coding round', 'competitive programming'],
    response: `**DSA Preparation Guide for Placements:**\n\n**Must-Know Topics** (in priority order):\n1. Arrays & Strings\n2. Linked Lists\n3. Stacks & Queues\n4. Trees & BST\n5. Graphs (BFS, DFS)\n6. Dynamic Programming\n7. Sorting & Searching\n8. Hashing\n\n**Resources**:\n- LeetCode (Top 150 Interview Questions)\n- GeeksforGeeks Practice\n- Striver's SDE Sheet\n- NeetCode.io\n\n**Strategy**: Solve 3-5 problems daily. Focus on patterns, not just solutions. Practice explaining your approach out loud.`,
  },
  {
    keywords: ['resume', 'cv', 'resume tips'],
    response: `**Resume Tips for Freshers:**\n\n1. **Keep it 1 page** — Recruiters spend 6-10 seconds per resume\n2. **Include these sections**: Contact, Education, Skills, Projects, Experience, Achievements\n3. **Use action verbs**: Built, Developed, Implemented, Designed, Optimized\n4. **Quantify impact**: "Improved load time by 40%" > "Made website faster"\n5. **Tailor for each role**: Match keywords from job description\n6. **Add links**: GitHub, LinkedIn, Portfolio\n7. **No typos** — Proofread multiple times\n8. **Use a clean template** — Avoid fancy designs for tech roles`,
  },
  {
    keywords: ['hr round', 'hr interview', 'hr questions'],
    response: `**Common HR Round Questions:**\n\n1. **"Why do you want to join our company?"** → Research the company values, products, culture\n2. **"Where do you see yourself in 5 years?"** → Show ambition aligned with company growth\n3. **"Why should we hire you?"** → Match your skills to their needs\n4. **"What's your expected salary?"** → Research market rates, give a range\n5. **"Do you have any questions?"** → Always ask! e.g., "What does success look like in this role?"\n\n**Pro Tips**:\n- Be honest and enthusiastic\n- Research the company thoroughly\n- Prepare 2-3 questions to ask them`,
  },
  {
    keywords: ['aptitude', 'quantitative', 'verbal', 'logical reasoning'],
    response: `**Aptitude Preparation Guide:**\n\n**Quantitative**:\n- Percentages, Profit & Loss\n- Time & Work, Speed & Distance\n- Permutations & Combinations\n- Probability\n\n**Logical Reasoning**:\n- Blood Relations\n- Seating Arrangement\n- Syllogisms\n- Data Interpretation\n\n**Verbal**:\n- Reading Comprehension\n- Fill in the Blanks\n- Error Spotting\n- Para Jumbles\n\n**Resources**: IndiaBix, PrepInsta, RS Aggarwal\n**Tip**: Practice timed mock tests regularly to improve speed and accuracy.`,
  },
  {
    keywords: ['project', 'projects', 'project ideas', 'what project'],
    response: `**Recommended Projects for Placements:**\n\n**Web Development**:\n- E-commerce platform (React + Node.js)\n- Real-time chat app (Socket.io)\n- Social media dashboard\n\n**Machine Learning**:\n- Sentiment Analysis tool\n- Image classifier\n- Recommendation system\n\n**Tips for Presenting Projects**:\n1. Explain the **problem** it solves\n2. Describe **your contribution**\n3. Mention **technologies used**\n4. Highlight **challenges overcome**\n5. Show **live demo** or GitHub link\n\nMake sure you can explain every line of code in your projects!`,
  },
  {
    keywords: ['salary', 'package', 'negotiate', 'ctc'],
    response: `**Salary Negotiation Tips for Freshers:**\n\n1. **Research market rates** on Glassdoor, AmbitionBox, LinkedIn\n2. **Know your worth** — factor in your skills, projects, internships\n3. **Consider total CTC** — base pay, bonuses, stock options, benefits\n4. **Average fresher salaries** (India, 2024):\n   - Service companies: ₹3-6 LPA\n   - Product companies: ₹6-15 LPA\n   - FAANG/Top companies: ₹15-45 LPA\n5. **Don't reveal your current/expected first** — let them make an offer\n6. **It's okay to negotiate** — companies expect it!`,
  },
  {
    keywords: ['oops', 'object oriented', 'oop', 'class', 'inheritance', 'polymorphism'],
    response: `**OOP Concepts for Interviews:**\n\n**4 Pillars of OOP**:\n1. **Encapsulation**: Bundling data + methods, access modifiers\n2. **Inheritance**: Child class inherits parent class properties\n3. **Polymorphism**: Same interface, different implementations\n   - Compile-time (method overloading)\n   - Runtime (method overriding)\n4. **Abstraction**: Hiding complexity, showing only essentials\n\n**Common Questions**:\n- Difference between abstract class and interface?\n- What is diamond problem?\n- Explain SOLID principles\n- Real-world examples of each pillar\n\nPractice implementing these in your preferred language!`,
  },
  {
    keywords: ['sql', 'database', 'dbms', 'normalization', 'query'],
    response: `**DBMS Interview Prep:**\n\n**Key Topics**:\n1. **SQL Basics**: SELECT, JOIN, GROUP BY, HAVING, subqueries\n2. **Normalization**: 1NF, 2NF, 3NF, BCNF\n3. **Keys**: Primary, Foreign, Candidate, Super\n4. **Joins**: INNER, LEFT, RIGHT, FULL OUTER, CROSS\n5. **ACID Properties**: Atomicity, Consistency, Isolation, Durability\n6. **Indexing**: B-Tree, Hash indexing\n\n**Practice Questions**:\n- Find second highest salary\n- Find duplicate records\n- Self-join scenarios\n- Write complex joins\n\nPractice on LeetCode SQL questions or HackerRank SQL track.`,
  },
];

const defaultResponse = `I'm your AI Placement Assistant! I can help you with:\n\n📝 **Interview Preparation**: Tell me about yourself, strengths/weaknesses, HR questions\n💻 **Technical Topics**: DSA, OOP, DBMS, SQL\n📄 **Resume Tips**: How to build an effective resume\n🎯 **Aptitude**: Quantitative, verbal, logical reasoning tips\n🚀 **Projects**: Ideas and how to present them\n💰 **Salary**: Package expectations and negotiation\n\nTry asking me something like:\n- "How to answer tell me about yourself?"\n- "Give me DSA preparation tips"\n- "What projects should I build?"\n- "Help me prepare for HR round"`;

function fallbackResponse(message, res) {
  const lower = (message || '').toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    let matchScore = 0;
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        matchScore += keyword.length;
      }
    }
    if (matchScore > bestScore) {
      bestScore = matchScore;
      bestMatch = entry;
    }
  }

  const response = bestMatch ? bestMatch.response : defaultResponse;

  res.json({
    message: response,
    timestamp: new Date().toISOString(),
    source: 'fallback',
  });
}

module.exports = router;
