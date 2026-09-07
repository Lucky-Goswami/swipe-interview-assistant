// src/components/ai/GeminiAI.js
// Enhanced Google Gemini AI Integration with GENEROUS Scoring

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyCw8Ev0vGtvzxCbzGxrhUUASaVSfxvaDj4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// ⭐ ENHANCED: Deep Resume Parsing
export const parseResumeDeep = (resumeText) => {
  const skills = [];
  const projects = [];
  const languages = [];
  const frameworks = [];
  
  const langKeywords = ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'TypeScript', 'PHP', 'Swift', 'Kotlin'];
  langKeywords.forEach(lang => {
    if (resumeText.toLowerCase().includes(lang.toLowerCase())) {
      languages.push(lang);
    }
  });
  
  const techKeywords = ['React', 'Node.js', 'Angular', 'Vue', 'Express', 'Django', 'Flask', 'Spring', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP'];
  techKeywords.forEach(tech => {
    if (resumeText.toLowerCase().includes(tech.toLowerCase())) {
      frameworks.push(tech);
    }
  });
  
  const projectIndicators = ['project', 'built', 'developed', 'created', 'designed', 'implemented'];
  const lines = resumeText.split('\n');
  lines.forEach(line => {
    projectIndicators.forEach(indicator => {
      if (line.toLowerCase().includes(indicator)) {
        projects.push(line.trim());
      }
    });
  });
  
  const skillKeywords = ['API', 'REST', 'GraphQL', 'microservices', 'algorithm', 'data structure', 'testing', 'CI/CD', 'agile', 'git'];
  skillKeywords.forEach(skill => {
    if (resumeText.toLowerCase().includes(skill.toLowerCase())) {
      skills.push(skill);
    }
  });
  
  return {
    languages: languages.slice(0, 5),
    frameworks: frameworks.slice(0, 5),
    projects: projects.slice(0, 3),
    skills: skills.slice(0, 5),
    hasProjects: projects.length > 0,
    hasTechStack: languages.length > 0 || frameworks.length > 0
  };
};

// ⭐ NEW: Check if text looks like gibberish/random typing
const isGibberish = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  
  // Check for excessive consonant clusters (sign of gibberish)
  const consonantClusters = text.match(/[bcdfghjklmnpqrstvwxyz]{5,}/gi);
  if (consonantClusters && consonantClusters.length > 2) {
    return true;
  }
  
  // Check for repeating character patterns
  const repeatingPatterns = text.match(/(.)\1{4,}/g);
  if (repeatingPatterns && repeatingPatterns.length > 0) {
    return true;
  }
  
  // Check for keyboard smashing patterns
  const keyboardPatterns = /asdf|qwer|zxcv|hjkl|uiop|bnm|jfkd|ksjb|djbf/gi;
  const patternMatches = text.match(keyboardPatterns);
  if (patternMatches && patternMatches.length > 2) {
    return true;
  }
  
  // Check for random letter sequences (no vowels in long words)
  let noVowelCount = 0;
  words.forEach(word => {
    if (word.length > 6 && !/[aeiou]/i.test(word)) {
      noVowelCount++;
    }
  });
  if (noVowelCount > 3) {
    return true;
  }
  
  return false;
};

// ⭐ NEW: Check for common English words (meaningful content)
const hasRealWords = (text) => {
  const commonWords = [
    'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did',
    'a', 'an', 'and', 'or', 'but', 'if', 'then',
    'this', 'that', 'these', 'those',
    'function', 'code', 'data', 'algorithm', 'time', 'space',
    'react', 'javascript', 'python', 'node', 'database',
    'use', 'using', 'used', 'can', 'will', 'would', 'should'
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  const realWordCount = words.filter(word => commonWords.includes(word)).length;
  
  // Need at least 3 common English words in the answer
  return realWordCount >= 3;
};

// ⭐ ULTRA STRICT: Validate Answer Quality BEFORE AI Call
export const validateAnswer = (answer) => {
  if (!answer || !answer.trim()) {
    return { valid: false, reason: 'Answer is empty' };
  }
  
  const trimmed = answer.trim();
  const words = trimmed.split(/\s+/);
  const uniqueChars = new Set(trimmed.replace(/\s/g, ''));
  
  // Check minimum length
  if (trimmed.length < 15) {
    return { valid: false, reason: 'Answer too short (minimum 15 characters)' };
  }
  
  // Check minimum word count
  if (words.length < 5) {
    return { valid: false, reason: 'Answer too short (minimum 5 words)' };
  }
  
  // Check for meaningless input (repeated characters)
  if (uniqueChars.size < 5) {
    return { valid: false, reason: 'Answer contains too many repeated characters' };
  }
  
  // Check for only punctuation
  const alphanumeric = trimmed.replace(/[^a-zA-Z0-9]/g, '');
  if (alphanumeric.length < 10) {
    return { valid: false, reason: 'Answer must contain meaningful text, not just punctuation' };
  }
  
  // ⭐ NEW: Check for gibberish/keyboard smashing
  if (isGibberish(trimmed)) {
    return { valid: false, reason: 'Answer appears to be random gibberish or keyboard smashing' };
  }
  
  // ⭐ NEW: Check for real English words
  if (!hasRealWords(trimmed)) {
    return { valid: false, reason: 'Answer must contain recognizable English words' };
  }
  
  // Check for spam patterns (same word repeated)
  const wordCounts = {};
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanWord.length > 0) {
      wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
    }
  });
  
  const maxRepeat = Math.max(...Object.values(wordCounts));
  if (maxRepeat > words.length * 0.4 && words.length > 5) {
    return { valid: false, reason: 'Answer contains too many repeated words' };
  }
  
  // ⭐ NEW: Check for excessive dots/periods
  const dotCount = (trimmed.match(/\./g) || []).length;
  if (dotCount > trimmed.length * 0.3) {
    return { valid: false, reason: 'Answer contains excessive punctuation marks' };
  }
  
  return { valid: true };
};

// ⭐ ENHANCED: Generate Deep, Personalized Questions
export const generateInterviewQuestions = async (resumeText, jobRole = 'Full Stack Developer') => {
  try {
    const resumeData = parseResumeDeep(resumeText);
    
    const prompt = `You are an expert technical interviewer for a ${jobRole} position.

RESUME ANALYSIS:
- Programming Languages: ${resumeData.languages.join(', ') || 'Not specified'}
- Frameworks/Tech: ${resumeData.frameworks.join(', ') || 'Not specified'}
- Key Skills: ${resumeData.skills.join(', ') || 'Not specified'}
- Projects Found: ${resumeData.hasProjects ? 'Yes' : 'No'}

CRITICAL REQUIREMENTS:
1. Generate exactly 6 TECHNICAL questions (NOT generic behavioral questions)
2. Questions MUST be specific to the candidate's tech stack shown above
3. Questions MUST follow this difficulty progression:
   - Questions 1-2: Easy (20 seconds each) - Quick concept checks
   - Questions 3-4: Medium (60 seconds each) - Deeper technical understanding
   - Questions 5-6: Hard (120 seconds each) - Complex problem-solving or coding

4. Question types MUST include:
   - If they list projects: Ask about architecture, challenges, specific implementations
   - If they list languages: Ask to write code snippets or explain syntax
   - If they list frameworks: Ask about internal workings, best practices
   - Include at least 1-2 coding/algorithm questions

5. BAD Examples (TOO GENERIC - DO NOT USE):
   ❌ "Tell me about yourself"
   ❌ "What are your strengths?"
   ❌ "Describe a challenging project"
   
6. GOOD Examples (SPECIFIC TO RESUME):
   ✅ "Explain how React's virtual DOM diffing algorithm works in your [project name]"
   ✅ "Write a function in ${resumeData.languages[0] || 'JavaScript'} to reverse a linked list"
   ✅ "How did you handle state management in your ${resumeData.frameworks[0] || 'React'} application?"
   ✅ "Explain the N+1 query problem and how you'd solve it with ${resumeData.frameworks.includes('MongoDB') ? 'MongoDB' : 'SQL'}"

Resume Content:
${resumeText}

Return ONLY valid JSON in this EXACT format:
[
  {
    "id": 1,
    "question": "specific technical question here",
    "difficulty": "Easy",
    "time": 20,
    "expectedKeywords": ["keyword1", "keyword2"]
  },
  {
    "id": 2,
    "question": "specific technical question here",
    "difficulty": "Easy",
    "time": 20,
    "expectedKeywords": ["keyword1", "keyword2"]
  },
  {
    "id": 3,
    "question": "specific technical question here",
    "difficulty": "Medium",
    "time": 60,
    "expectedKeywords": ["keyword1", "keyword2"]
  },
  {
    "id": 4,
    "question": "specific technical question here",
    "difficulty": "Medium",
    "time": 60,
    "expectedKeywords": ["keyword1", "keyword2"]
  },
  {
    "id": 5,
    "question": "specific technical question here",
    "difficulty": "Hard",
    "time": 120,
    "expectedKeywords": ["keyword1", "keyword2"]
  },
  {
    "id": 6,
    "question": "specific technical question here",
    "difficulty": "Hard",
    "time": 120,
    "expectedKeywords": ["keyword1", "keyword2"]
  }
]`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 3072,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse questions from AI response');
    }

    const questions = JSON.parse(jsonMatch[0]);
    
    if (questions.length !== 6) {
      throw new Error('Did not receive exactly 6 questions');
    }

    return questions;

  } catch (error) {
    console.error('Gemini AI Error:', error);
    return getContextualDefaultQuestions(resumeText);
  }
};

// ⭐ ENHANCED: GENEROUS AI Answer Scoring with Realistic Feedback
export const scoreAnswerWithAI = async (question, answer, difficulty) => {
  // If answer is empty or too short, give minimal score
  if (!answer || answer.trim().length < 10) {
    return {
      score: 0,
      feedback: 'No meaningful answer provided. Please try to answer the question in detail.'
    };
  }

  const maxScore = difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 20 : 30;
  
  // Enhanced scoring prompt for better accuracy
  const scoringPrompt = `You are an expert technical interviewer evaluating a candidate's answer.

QUESTION: "${question}"
DIFFICULTY: ${difficulty}
CANDIDATE'S ANSWER: "${answer}"
MAX SCORE: ${maxScore} points

SCORING CRITERIA:
1. **Content Relevance (40%)**: Does the answer directly address the question?
2. **Technical Accuracy (30%)**: Is the information technically correct?
3. **Clarity & Structure (20%)**: Is the answer well-organized and easy to understand?
4. **Depth & Examples (10%)**: Does the candidate provide examples or go into sufficient detail?

SCORING SCALE FOR ${difficulty} DIFFICULTY:
- 0-${Math.floor(maxScore * 0.3)}: Poor/Incomplete answer
- ${Math.floor(maxScore * 0.3) + 1}-${Math.floor(maxScore * 0.5)}: Below average, missing key points
- ${Math.floor(maxScore * 0.5) + 1}-${Math.floor(maxScore * 0.7)}: Average, covers basics
- ${Math.floor(maxScore * 0.7) + 1}-${Math.floor(maxScore * 0.85)}: Good, solid understanding
- ${Math.floor(maxScore * 0.85) + 1}-${maxScore}: Excellent, comprehensive answer

IMPORTANT SCORING GUIDELINES:
- Be GENEROUS with points for answers that show understanding
- Award partial credit for partially correct answers
- If the candidate attempts to answer, they should get at least 30-40% of points
- Only give 0 points if there's truly no relevant content
- Consider that spoken answers may be less polished than written ones

Provide your evaluation in this EXACT JSON format:
{
  "score": [number between 0 and ${maxScore}],
  "feedback": "[2-3 sentences of constructive feedback]",
  "strengths": "[What the candidate did well]",
  "improvements": "[What could be better]"
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: scoringPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent scoring
          maxOutputTokens: 500,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return scoreAnswerRuleBased(question, answer, difficulty);
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Ensure score is within valid range
    result.score = Math.min(Math.max(0, result.score), maxScore);
    
    // Create comprehensive feedback
    const fullFeedback = `${result.feedback} ${result.strengths ? 'Strengths: ' + result.strengths : ''} ${result.improvements ? 'Areas to improve: ' + result.improvements : ''}`;
    
    return {
      score: result.score,
      feedback: fullFeedback
    };
    
  } catch (error) {
    console.error('Scoring error:', error);
    return scoreAnswerRuleBased(question, answer, difficulty);
  }
};

// ⭐ ENHANCED: Rule-based scoring (more predictable, no API needed)
export function scoreAnswerRuleBased(question, answer, difficulty) {
  if (!answer || answer.trim().length < 10) {
    return {
      score: 0,
      feedback: 'No meaningful answer provided.'
    };
  }

  const maxScore = difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 20 : 30;
  
  // Calculate score based on multiple factors
  const wordCount = answer.split(/\s+/).filter(w => w.length > 0).length;
  const sentenceCount = answer.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  
  // Extract key terms from question
  const questionWords = question.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3 && !['what', 'when', 'where', 'which', 'would', 'could', 'should', 'about', 'your', 'yourself'].includes(w));
  
  // Check for relevant keywords
  const answerLower = answer.toLowerCase();
  const relevantKeywords = questionWords.filter(word => answerLower.includes(word)).length;
  const keywordScore = Math.min(relevantKeywords / Math.max(questionWords.length, 1), 1);
  
  // Length score (with diminishing returns)
  let lengthScore;
  if (wordCount < 20) {
    lengthScore = wordCount / 20 * 0.4; // Up to 40% for very short
  } else if (wordCount < 50) {
    lengthScore = 0.4 + ((wordCount - 20) / 30) * 0.3; // 40-70%
  } else if (wordCount < 100) {
    lengthScore = 0.7 + ((wordCount - 50) / 50) * 0.2; // 70-90%
  } else {
    lengthScore = 0.9; // Cap at 90%
  }
  
  // Structure score (sentence count)
  const structureScore = Math.min(sentenceCount / 5, 1) * 0.3;
  
  // Technical terms bonus (contains specific technical words)
  const technicalTerms = ['experience', 'project', 'developed', 'implemented', 'designed', 'managed', 'achieved', 'improved', 'responsible', 'team', 'skills', 'technology', 'system', 'application', 'problem', 'solution'];
  const technicalScore = technicalTerms.filter(term => answerLower.includes(term)).length;
  const technicalBonus = Math.min(technicalScore / 5, 0.2); // Up to 20% bonus
  
  // Calculate final score
  const rawScore = (keywordScore * 0.4 + lengthScore * 0.4 + structureScore * 0.2 + technicalBonus);
  const finalScore = Math.round(rawScore * maxScore);
  
  // Generate feedback
  let feedback = '';
  const scorePercentage = (finalScore / maxScore) * 100;
  
  if (scorePercentage >= 80) {
    feedback = 'Excellent answer! You addressed the question thoroughly with good detail and structure.';
  } else if (scorePercentage >= 60) {
    feedback = 'Good answer. You covered the main points, but could add more specific examples or details.';
  } else if (scorePercentage >= 40) {
    feedback = 'Adequate answer. Try to be more specific and provide concrete examples from your experience.';
  } else if (scorePercentage >= 20) {
    feedback = 'Basic answer. Your response needs more detail and should directly address all parts of the question.';
  } else {
    feedback = 'Incomplete answer. Please provide more substantial information and specific examples.';
  }
  
  return {
    score: finalScore,
    feedback: feedback + ` (${wordCount} words, ${sentenceCount} sentences)`
  };
}

// ⭐ ENHANCED: Contextual Default Questions Based on Resume
const getContextualDefaultQuestions = (resumeText) => {
  const resumeData = parseResumeDeep(resumeText);
  const primaryLang = resumeData.languages[0] || 'JavaScript';
  const primaryFramework = resumeData.frameworks[0] || 'React';
  
  return [
    {
      id: 1,
      question: `What is the difference between '==' and '===' in ${primaryLang}?`,
      difficulty: "Easy",
      time: 20,
      expectedKeywords: ["type", "coercion", "strict", "equality"]
    },
    {
      id: 2,
      question: `Explain what a closure is in ${primaryLang} with a simple example.`,
      difficulty: "Easy",
      time: 20,
      expectedKeywords: ["function", "scope", "variable", "lexical"]
    },
    {
      id: 3,
      question: `How does the virtual DOM work in ${primaryFramework}? Why is it beneficial?`,
      difficulty: "Medium",
      time: 60,
      expectedKeywords: ["reconciliation", "diffing", "performance", "rendering"]
    },
    {
      id: 4,
      question: `Explain the difference between SQL and NoSQL databases. When would you use each?`,
      difficulty: "Medium",
      time: 60,
      expectedKeywords: ["relational", "schema", "scalability", "ACID"]
    },
    {
      id: 5,
      question: `Write a function in ${primaryLang} to find the first non-repeating character in a string. Explain your approach and time complexity.`,
      difficulty: "Hard",
      time: 120,
      expectedKeywords: ["hash", "map", "O(n)", "algorithm"]
    },
    {
      id: 6,
      question: `Design a REST API for a simple blog system with users, posts, and comments. Explain your endpoint structure and why you chose it.`,
      difficulty: "Hard",
      time: 120,
      expectedKeywords: ["REST", "endpoint", "HTTP", "CRUD", "resource"]
    }
  ];
};

// ⭐ ADDED: Realistic Questions Function
export const generateRealisticInterviewQuestions = async (resumeText, jobRole = 'Full Stack Developer') => {
  try {
    const resumeData = parseResumeDeep(resumeText);
    
    const prompt = `You are a professional technical interviewer for a ${jobRole} position.

RESUME ANALYSIS:
- Programming Languages: ${resumeData.languages.join(', ') || 'Not specified'}
- Frameworks/Tech: ${resumeData.frameworks.join(', ') || 'Not specified'}
- Key Skills: ${resumeData.skills.join(', ') || 'Not specified'}

GENERATE EXACTLY 8 QUESTIONS:

1. INTRODUCTION (Easy, 60s): "Tell me about yourself, your background, and what brings you to apply for this ${jobRole} position."
2. WARMUP (Easy, 45s): Simple question about their interests
3-4. TECHNICAL (Medium, 90s each): Core technical concepts
5-6. DEEP TECHNICAL (Hard, 120s each): Complex problems
7. SCENARIO (Hard, 120s): Real-world situation
8. CLOSING (Easy, 45s): "Do you have any questions for us?"

QUESTION 1 MUST ALWAYS BE INTRODUCTION.

Resume:
${resumeText}

Return ONLY valid JSON:
[
  {
    "id": 1,
    "question": "Tell me about yourself...",
    "difficulty": "Easy",
    "time": 60,
    "type": "introduction",
    "expectedKeywords": ["experience", "background"]
  },
  ... (7 more questions)
]`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) throw new Error('Failed to parse questions');

    const questions = JSON.parse(jsonMatch[0]);
    if (questions.length !== 8) throw new Error('Did not receive 8 questions');

    return questions;

  } catch (error) {
    console.error('Question generation error:', error);
    return getRealisticDefaultQuestions(resumeText);
  }
};

// ⭐ ADDED: Default Questions With Introduction
const getRealisticDefaultQuestions = (resumeText) => {
  const resumeData = parseResumeDeep(resumeText);
  const primaryLang = resumeData.languages[0] || 'JavaScript';
  const primaryFramework = resumeData.frameworks[0] || 'React';
  
  return [
    {
      id: 1,
      question: "Tell me about yourself, your background, and what interests you about this Full Stack Developer position.",
      difficulty: "Easy",
      time: 60,
      type: "introduction",
      expectedKeywords: ["experience", "background", "passion"]
    },
    {
      id: 2,
      question: `What excites you most about working with ${primaryFramework}?`,
      difficulty: "Easy",
      time: 45,
      type: "warmup",
      expectedKeywords: [primaryFramework.toLowerCase(), "enjoy"]
    },
    {
      id: 3,
      question: `Walk me through a project where you used ${primaryFramework}. What challenges did you face?`,
      difficulty: "Medium",
      time: 90,
      type: "technical",
      expectedKeywords: ["project", "challenge", "solution"]
    },
    {
      id: 4,
      question: `Explain how state management works in ${primaryFramework}.`,
      difficulty: "Medium",
      time: 90,
      type: "technical",
      expectedKeywords: ["state", "props", "context"]
    },
    {
      id: 5,
      question: `Write a function in ${primaryLang} to find duplicate values in an array. Explain time complexity.`,
      difficulty: "Hard",
      time: 120,
      type: "coding",
      expectedKeywords: ["algorithm", "O(n)", "hash"]
    },
    {
      id: 6,
      question: `How would you optimize a slow ${primaryFramework} application?`,
      difficulty: "Hard",
      time: 120,
      type: "scenario",
      expectedKeywords: ["performance", "profiling", "lazy"]
    },
    {
      id: 7,
      question: "A critical bug is reported in production. Walk me through your debugging process.",
      difficulty: "Hard",
      time: 120,
      type: "scenario",
      expectedKeywords: ["debug", "logs", "reproduce"]
    },
    {
      id: 8,
      question: "Do you have any questions for me about the team or role?",
      difficulty: "Easy",
      time: 45,
      type: "closing",
      expectedKeywords: ["question", "team", "culture"]
    }
  ];
};