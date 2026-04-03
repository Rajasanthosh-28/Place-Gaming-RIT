const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { protect } = require('../middleware/auth');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ──── Skill Categories ────
const skillCategories = {
  'Programming Languages': ['javascript', 'python', 'java', 'c++', 'c#', 'typescript', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl'],
  'Frontend': ['react', 'angular', 'vue', 'svelte', 'next.js', 'nextjs', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'jquery', 'redux', 'webpack', 'vite'],
  'Backend': ['node', 'express', 'django', 'flask', 'spring', 'fastapi', 'rails', 'laravel', '.net', 'graphql', 'rest api', 'microservices'],
  'Database': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase', 'dynamodb', 'cassandra', 'oracle', 'sqlite', 'neo4j'],
  'DevOps & Cloud': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'ci/cd', 'terraform', 'ansible', 'nginx', 'linux', 'git', 'github'],
  'Data Science & AI': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'nlp', 'computer vision', 'data analysis', 'tableau', 'power bi'],
  'Soft Skills': ['leadership', 'teamwork', 'communication', 'problem-solving', 'critical thinking', 'time management', 'adaptability', 'collaboration', 'mentoring'],
};

// ──── Rule-Based Resume Analysis ────
function analyzeResume(text) {
  const lower = text.toLowerCase();
  const feedback = [];
  const strengths = [];
  const score = { total: 0, max: 100 };

  // Contact info
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasLinkedIn = /linkedin\.com/i.test(text);
  const hasGitHub = /github\.com/i.test(text);
  const hasPortfolio = /portfolio|personal\s*website|\.dev|\.io|\.me/i.test(text);

  if (hasEmail) { score.total += 5; strengths.push('Email address found'); }
  else feedback.push({ category: 'Contact', suggestion: 'Add your email address', priority: 'high' });

  if (hasPhone) { score.total += 5; strengths.push('Phone number found'); }
  else feedback.push({ category: 'Contact', suggestion: 'Add your phone number', priority: 'high' });

  if (hasLinkedIn) { score.total += 5; strengths.push('LinkedIn profile linked'); }
  else feedback.push({ category: 'Contact', suggestion: 'Add your LinkedIn profile URL', priority: 'medium' });

  if (hasGitHub) { score.total += 5; strengths.push('GitHub profile linked'); }
  else feedback.push({ category: 'Contact', suggestion: 'Add your GitHub profile link to showcase projects', priority: 'medium' });

  if (hasPortfolio) { score.total += 2; strengths.push('Portfolio/website linked'); }

  // Sections
  const sections = {
    education: /education|academic|university|college|degree|bachelor|master/i,
    experience: /experience|work|internship|employment|job/i,
    skills: /skills|technologies|tools|proficiencies|tech\s*stack/i,
    projects: /projects|portfolio|personal\s*projects/i,
    certifications: /certifications?|certificates?|courses?/i,
    achievements: /achievements?|awards?|honors?|accomplishments?/i,
  };

  const foundSections = [];
  const missingSections = [];
  for (const [section, regex] of Object.entries(sections)) {
    const name = section.charAt(0).toUpperCase() + section.slice(1);
    if (regex.test(text)) {
      score.total += 8;
      foundSections.push(name);
      strengths.push(`${name} section present`);
    } else {
      missingSections.push(name);
      feedback.push({ category: 'Structure', suggestion: `Add a "${name}" section`, priority: section === 'education' || section === 'skills' ? 'high' : 'medium' });
    }
  }

  // Skills extraction by category
  const extractedSkills = {};
  let totalSkillCount = 0;
  for (const [category, skills] of Object.entries(skillCategories)) {
    const found = skills.filter(s => lower.includes(s));
    if (found.length > 0) {
      extractedSkills[category] = found;
      totalSkillCount += found.length;
    }
  }

  if (totalSkillCount >= 8) {
    score.total += 15;
    strengths.push(`Excellent skills coverage (${totalSkillCount} skills across ${Object.keys(extractedSkills).length} categories)`);
  } else if (totalSkillCount >= 4) {
    score.total += 8;
    feedback.push({ category: 'Skills', suggestion: `Good skill set (${totalSkillCount} found). Consider adding more relevant technologies.`, priority: 'medium' });
  } else {
    feedback.push({ category: 'Skills', suggestion: 'Add more technical skills and programming languages', priority: 'high' });
  }

  // Action verbs
  const actionVerbs = ['developed', 'built', 'created', 'designed', 'implemented', 'led', 'managed', 'optimized', 'improved', 'achieved', 'launched', 'deployed', 'architected', 'collaborated', 'mentored', 'analyzed', 'automated', 'configured', 'debugged', 'maintained', 'resolved', 'spearheaded', 'streamlined', 'engineered'];
  const foundVerbs = actionVerbs.filter(v => lower.includes(v));
  if (foundVerbs.length >= 5) {
    score.total += 10;
    strengths.push('Excellent use of action verbs');
  } else if (foundVerbs.length >= 2) {
    score.total += 5;
    feedback.push({ category: 'Language', suggestion: 'Use more action verbs (e.g., developed, implemented, optimized, engineered) to describe your experiences', priority: 'medium' });
  } else {
    feedback.push({ category: 'Language', suggestion: 'Use action verbs to start bullet points (e.g., "Developed a REST API..." instead of "Was responsible for...")', priority: 'high' });
  }

  // Length check
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 250 && wordCount <= 800) {
    score.total += 5;
    strengths.push(`Good resume length (${wordCount} words)`);
  } else if (wordCount < 250) {
    feedback.push({ category: 'Content', suggestion: `Resume seems too short (${wordCount} words). Aim for 300-700 words with detailed project descriptions.`, priority: 'high' });
  } else {
    feedback.push({ category: 'Content', suggestion: `Resume might be too long (${wordCount} words). Keep it concise — 1 page is ideal for freshers.`, priority: 'medium' });
  }

  // Quantifiable metrics
  const metricsMatches = text.match(/\d+%|\d+\+|\d+ users|\d+ projects|\d+x|\d+ team|\d+ clients/gi) || [];
  if (metricsMatches.length >= 3) {
    score.total += 8;
    strengths.push(`Strong use of quantifiable metrics (${metricsMatches.length} found)`);
  } else if (metricsMatches.length >= 1) {
    score.total += 4;
    feedback.push({ category: 'Impact', suggestion: 'Add more quantifiable metrics (e.g., "Improved performance by 30%", "Served 1000+ users", "Led a team of 5")', priority: 'medium' });
  } else {
    feedback.push({ category: 'Impact', suggestion: 'Add quantifiable metrics to demonstrate impact. Numbers catch recruiter attention.', priority: 'high' });
  }

  // ATS-friendly check
  const hasSpecialFormatting = /[│┃▶►→●○◆◇★☆]/.test(text);
  if (!hasSpecialFormatting) {
    score.total += 3;
    strengths.push('ATS-friendly formatting detected');
  } else {
    feedback.push({ category: 'Formatting', suggestion: 'Avoid special characters and symbols that may not parse well in ATS (Applicant Tracking Systems)', priority: 'low' });
  }

  // Sort feedback by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  feedback.sort((a, b) => (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1));

  return {
    score: Math.min(score.total, 100),
    strengths,
    improvements: feedback,
    wordCount,
    extractedSkills,
    totalSkillCount,
    foundSections,
    missingSections,
    actionVerbsFound: foundVerbs,
    metricsFound: metricsMatches,
    contactInfo: { hasEmail, hasPhone, hasLinkedIn, hasGitHub, hasPortfolio },
  };
}

// ──── OpenAI AI Analysis ────
async function getAIAnalysis(text, ruleBasedResults) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_key') return null;

  const prompt = `You are an expert resume reviewer specializing in campus placements and tech hiring. Analyze this resume and provide specific, actionable feedback.

RESUME TEXT:
"""
${text.substring(0, 3000)}
"""

RULE-BASED ANALYSIS ALREADY FOUND:
- Score: ${ruleBasedResults.score}/100
- Skills found: ${ruleBasedResults.totalSkillCount}
- Sections present: ${ruleBasedResults.foundSections.join(', ')}
- Missing sections: ${ruleBasedResults.missingSections.join(', ')}

Provide your analysis in the following JSON format (no markdown, just pure JSON):
{
  "overallImpression": "2-3 sentence summary of the resume's overall quality and first impression",
  "targetRoles": ["list", "of", "3-4 suitable job roles based on skills"],
  "detailedFeedback": [
    {
      "area": "Section/Area name",
      "status": "good|needs_improvement|missing",
      "feedback": "Specific actionable feedback",
      "example": "Optional: rewritten example or suggestion"
    }
  ],
  "keyStrengths": ["strength 1", "strength 2", "strength 3"],
  "criticalImprovements": ["most important improvement 1", "improvement 2", "improvement 3"],
  "atsScore": "estimated ATS compatibility score out of 10",
  "readabilityNote": "Brief note on formatting and readability",
  "interviewReadiness": "Brief assessment of how interview-ready the candidate appears"
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert resume reviewer. Always respond with valid JSON only, no markdown formatting.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('AI analysis error:', error.message);
    return null;
  }
}

// POST /api/resume/analyze
router.post('/analyze', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    if (!pdfData.text || pdfData.text.trim().length < 50) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Could not extract enough text from the PDF. Make sure it is not a scanned image.' });
    }

    // Run rule-based analysis
    const analysis = analyzeResume(pdfData.text);

    // Run AI analysis in parallel (non-blocking)
    const aiAnalysis = await getAIAnalysis(pdfData.text, analysis);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      fileName: req.file.originalname,
      pages: pdfData.numpages,
      ...analysis,
      aiAnalysis,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
