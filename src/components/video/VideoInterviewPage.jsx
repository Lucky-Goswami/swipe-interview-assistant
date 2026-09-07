import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VideoOff, Clock, Volume2, Mic, CheckCircle, AlertCircle } from 'lucide-react';

// Safe imports with fallbacks
let VoiceEngine;
let SpeechSynthesisEngine;

try {
  VoiceEngine = require('../ai/VoiceEngine').VoiceEngine;
} catch (error) {
  console.warn('VoiceEngine not available, using fallback');
  VoiceEngine = class {
    start() { return false; }
    stop() { return ''; }
    abort() {}
    setCallbacks() {}
    isActive() { return false; }
  };
}

try {
  SpeechSynthesisEngine = require('../ai/SpeechSynthesis').SpeechSynthesisEngine;
} catch (error) {
  console.warn('SpeechSynthesisEngine not available, using fallback');
  SpeechSynthesisEngine = class {
    async initialize() { return true; }
    async speak(text, options) { 
      if (options?.onEnd) setTimeout(options.onEnd, 1000);
    }
    stop() {}
  };
}

// ⭐ SMART QUESTION GENERATOR - Works for ALL industries
const generateSmartQuestions = (resumeText, jobRole) => {
  console.log('🤖 Generating smart questions based on resume analysis...');
  
  const resumeLower = (resumeText || '').toLowerCase();
  
  // Comprehensive skill detection for ALL industries
  const detectedSkills = [];
  const allSkills = {
    'SAP': ['sap', 'abap', 'fiori', 's/4hana', 'sap hana', 'sap mm', 'sap sd', 'sap fico'],
    'Salesforce': ['salesforce', 'apex', 'lightning', 'visualforce', 'crm'],
    'React': ['react', 'reactjs', 'react.js', 'react native'],
    'Angular': ['angular', 'angularjs', 'angular 2'],
    'Vue': ['vue', 'vuejs', 'vue.js'],
    'Node.js': ['node', 'nodejs', 'express', 'nestjs'],
    'Python': ['python', 'django', 'flask', 'fastapi'],
    'Java': ['java', 'spring', 'springboot', 'hibernate'],
    'JavaScript': ['javascript', 'typescript', 'js'],
    '.NET': ['.net', 'c#', 'asp.net', 'dotnet'],
    'PHP': ['php', 'laravel', 'symfony'],
    'Ruby': ['ruby', 'rails', 'ruby on rails'],
    'AWS': ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
    'Azure': ['azure', 'microsoft azure', 'azure cloud'],
    'Google Cloud': ['gcp', 'google cloud platform'],
    'DevOps': ['devops', 'ci/cd', 'jenkins', 'docker', 'kubernetes', 'k8s'],
    'Data Science': ['data science', 'machine learning', 'ml', 'pandas', 'tensorflow', 'pytorch'],
    'Data Analysis': ['data analysis', 'analytics', 'tableau', 'power bi', 'data visualization'],
    'SQL': ['sql', 'mysql', 'postgresql', 'database', 'oracle database'],
    'MongoDB': ['mongodb', 'nosql', 'mongoose'],
    'UI/UX Design': ['ui', 'ux', 'user interface', 'user experience', 'figma', 'sketch', 'adobe xd'],
    'Graphic Design': ['graphic design', 'photoshop', 'illustrator', 'indesign'],
    'Product Design': ['product design', 'prototyping'],
    'Digital Marketing': ['digital marketing', 'seo', 'sem', 'google ads', 'ppc'],
    'Content Marketing': ['content marketing', 'copywriting', 'content creation'],
    'Social Media': ['social media marketing', 'facebook ads', 'instagram', 'linkedin'],
    'Email Marketing': ['email marketing', 'mailchimp', 'hubspot'],
    'Sales': ['sales', 'business development', 'lead generation', 'account management'],
    'Accounting': ['accounting', 'bookkeeping', 'accounts payable', 'accounts receivable'],
    'Financial Analysis': ['financial analysis', 'financial modeling', 'forecasting'],
    'Investment Banking': ['investment banking', 'equity research', 'valuation'],
    'Taxation': ['taxation', 'tax preparation', 'gst', 'income tax'],
    'Auditing': ['auditing', 'internal audit', 'compliance'],
    'Human Resources': ['human resources', 'hr', 'recruitment', 'talent acquisition'],
    'Payroll': ['payroll', 'compensation', 'benefits administration'],
    'Employee Relations': ['employee relations', 'performance management'],
    'Supply Chain': ['supply chain', 'logistics', 'inventory management', 'procurement'],
    'Operations Management': ['operations management', 'process improvement', 'lean', 'six sigma'],
    'Project Management': ['project management', 'pmp', 'agile', 'scrum', 'jira', 'waterfall'],
    'Quality Assurance': ['quality assurance', 'qa', 'testing', 'quality control'],
    'Nursing': ['nursing', 'rn', 'patient care', 'clinical', 'nurse'],
    'Medical': ['medical', 'physician', 'doctor', 'healthcare provider'],
    'Pharmacy': ['pharmacy', 'pharmacist', 'pharmaceutical'],
    'Legal': ['legal', 'law', 'attorney', 'paralegal', 'litigation', 'contract law'],
    'Contract Management': ['contract management', 'agreement', 'legal compliance'],
    'Teaching': ['teaching', 'teacher', 'education', 'curriculum', 'instructor'],
    'Training': ['training', 'corporate training', 'e-learning', 'instructional design'],
    'Customer Support': ['customer support', 'customer service', 'help desk', 'technical support'],
    'Call Center': ['call center', 'bpo', 'contact center'],
    'Leadership': ['leadership', 'team management', 'people management'],
    'Strategy': ['strategy', 'strategic planning', 'business strategy'],
    'Consulting': ['consulting', 'advisory', 'business consulting'],
    'Content Writing': ['content writing', 'technical writing', 'blogging'],
    'Research': ['research', 'market research', 'academic research'],
    'Engineering': ['engineering', 'mechanical engineering', 'electrical engineering'],
    'Civil Engineering': ['civil engineering', 'structural design', 'construction'],
    'Architecture': ['architecture', 'architectural design', 'cad', 'autocad']
  };
  
  for (const [skill, keywords] of Object.entries(allSkills)) {
    if (keywords.some(kw => resumeLower.includes(kw))) {
      detectedSkills.push(skill);
    }
  }
  
  // Detect experience level
  let experienceLevel = 'fresher';
  let yearsExp = 0;
  const yearMatch = resumeLower.match(/(\d+)\s*(?:\+)?\s*years?/);
  if (yearMatch) {
    yearsExp = parseInt(yearMatch[1]);
    if (yearsExp >= 7) experienceLevel = 'senior';
    else if (yearsExp >= 3) experienceLevel = 'mid';
    else if (yearsExp >= 1) experienceLevel = 'junior';
  }
  
  // Smart role detection from resume content
  let detectedRole = jobRole || 'Professional';
  
  if (!detectedRole || detectedRole === 'Full Stack Developer' || detectedRole === 'Professional') {
    if (detectedSkills.includes('SAP')) detectedRole = 'SAP Consultant';
    else if (detectedSkills.includes('Salesforce')) detectedRole = 'Salesforce Developer';
    else if (detectedSkills.includes('Data Science')) detectedRole = 'Data Scientist';
    else if (detectedSkills.includes('Data Analysis')) detectedRole = 'Data Analyst';
    else if (detectedSkills.includes('DevOps')) detectedRole = 'DevOps Engineer';
    else if (detectedSkills.includes('UI/UX Design')) detectedRole = 'UI/UX Designer';
    else if (detectedSkills.includes('Digital Marketing')) detectedRole = 'Digital Marketing Specialist';
    else if (detectedSkills.includes('Human Resources')) detectedRole = 'HR Professional';
    else if (detectedSkills.includes('Accounting')) detectedRole = 'Accountant';
    else if (detectedSkills.includes('Sales')) detectedRole = 'Sales Professional';
    else if (detectedSkills.includes('Project Management')) detectedRole = 'Project Manager';
    else if (detectedSkills.includes('Nursing')) detectedRole = 'Nurse';
    else if (detectedSkills.includes('Teaching')) detectedRole = 'Teacher';
    else if (detectedSkills.includes('Legal')) detectedRole = 'Legal Professional';
    else if (detectedSkills.includes('Customer Support')) detectedRole = 'Customer Support Specialist';
    else if (detectedSkills.includes('Content Writing')) detectedRole = 'Content Writer';
    else if (detectedSkills.includes('React')) detectedRole = 'React Developer';
    else if (detectedSkills.includes('Angular')) detectedRole = 'Angular Developer';
    else if (detectedSkills.includes('Python')) detectedRole = 'Python Developer';
    else if (detectedSkills.includes('Java')) detectedRole = 'Java Developer';
    else if (detectedSkills.includes('Node.js')) detectedRole = 'Backend Developer';
  }
  
  console.log('✅ Detected Skills:', detectedSkills.slice(0, 5));
  console.log('📊 Experience:', experienceLevel, `(${yearsExp} years)`);
  console.log('💼 Role:', detectedRole);
  
  const questions = [];
  let qId = 1;
  const primarySkill = detectedSkills[0];
  const secondarySkill = detectedSkills[1];
  
  // 1. INTRODUCTION
  questions.push({
    id: qId++,
    question: `Tell me about your professional background and experience as a ${detectedRole}.`,
    difficulty: 'Easy',
    time: 120,
    type: 'introduction'
  });
  
  // 2-4. DEEP TECHNICAL QUESTIONS based on PRIMARY skill
  const techQuestions = {
    'SAP': [
      'What SAP modules have you worked with? Describe a complex customization or configuration you implemented in SAP.',
      'Explain your experience with SAP transaction codes and custom report development using ABAP or SAP Fiori.',
      'How do you approach SAP integration with external systems? Describe a specific integration project.'
    ],
    'Salesforce': [
      'Describe your experience with Apex triggers and classes. Give an example of complex business logic you implemented.',
      'How do you handle Salesforce governor limits in your development? Provide a specific example from your work.',
      'Explain your experience with Lightning components and Salesforce integrations.'
    ],
    'React': [
      'Explain your approach to state management in React. Discuss hooks like useState, useEffect, and custom hooks you have created.',
      'How do you optimize React application performance? Discuss techniques like memoization, lazy loading, and code splitting.',
      'Describe your experience with React Router, Redux, or Context API in building complex applications.'
    ],
    'Python': [
      'What Python frameworks have you worked with? Describe a complex application or script you developed.',
      'Explain your experience with Python libraries for data processing, APIs, web development, or automation.',
      'How do you handle error handling and logging in Python applications? Provide examples.'
    ],
    'Data Science': [
      'Walk me through your process for building and deploying a machine learning model from start to finish.',
      'What techniques do you use for feature engineering, data preprocessing, and handling imbalanced datasets?',
      'Describe a challenging data science project. What algorithms did you use and why?'
    ],
    'Data Analysis': [
      'Describe your approach to exploratory data analysis. What tools and techniques do you use?',
      'How do you create impactful data visualizations? What tools like Tableau, Power BI, or Python libraries do you prefer?',
      'Explain how you clean and transform messy data for analysis.'
    ],
    'Digital Marketing': [
      'Describe your experience running paid advertising campaigns on platforms like Google Ads or Facebook. How do you optimize for conversions?',
      'Explain your SEO strategy. What tools do you use for keyword research, on-page optimization, and performance tracking?',
      'How do you measure marketing campaign success? What KPIs do you track?'
    ],
    'Accounting': [
      'Describe your experience with month-end and year-end closing processes. What are the critical steps you follow?',
      'How do you handle account reconciliations and ensure accuracy in financial reporting?',
      'What accounting software have you used? Describe your proficiency with tools like QuickBooks, SAP, or Oracle.'
    ],
    'Nursing': [
      'Describe your approach to patient assessment and creating care plans. How do you prioritize when managing multiple patients?',
      'How do you handle emergency situations? Walk me through your response protocol.',
      'Explain your experience with electronic health records and medical documentation.'
    ],
    'UI/UX Design': [
      'Walk me through your design process from user research to final mockups. What tools do you use?',
      'How do you validate design decisions with user testing and data? Provide an example.',
      'Describe a challenging design problem you solved. What was your approach?'
    ],
    'Project Management': [
      'How do you manage project scope, timeline, and budget? What methodologies like Agile or Waterfall have you used?',
      'Describe how you handle changing requirements and scope creep in projects.',
      'What project management tools do you use? How do you track progress and communicate with stakeholders?'
    ],
    'Java': [
      'Explain your experience with Java frameworks like Spring or Hibernate. Describe a complex application you built.',
      'How do you handle concurrency and optimize Java application performance?',
      'Describe your experience with RESTful APIs, microservices, or enterprise Java applications.'
    ],
    'Node.js': [
      'Describe your experience building RESTful APIs with Node.js and Express. What best practices do you follow?',
      'How do you handle authentication, error handling, and scalability in Node.js applications?',
      'Explain your experience with databases, ORMs, and async programming in Node.js.'
    ]
  };
  
  if (primarySkill && techQuestions[primarySkill]) {
    questions.push({
      id: qId++,
      question: techQuestions[primarySkill][0],
      difficulty: 'Medium',
      time: 180,
      type: 'technical'
    });
    questions.push({
      id: qId++,
      question: techQuestions[primarySkill][1],
      difficulty: 'Hard',
      time: 180,
      type: 'technical'
    });
    if (techQuestions[primarySkill][2]) {
      questions.push({
        id: qId++,
        question: techQuestions[primarySkill][2],
        difficulty: 'Medium',
        time: 150,
        type: 'technical'
      });
    }
  } else if (primarySkill) {
    questions.push({
      id: qId++,
      question: `Describe your hands-on experience with ${primarySkill}. What projects or tasks have you completed using this skill?`,
      difficulty: 'Medium',
      time: 150,
      type: 'technical'
    });
    questions.push({
      id: qId++,
      question: `What are the most challenging technical problems you have solved using ${primarySkill}? Walk me through your approach.`,
      difficulty: 'Hard',
      time: 180,
      type: 'technical'
    });
  }
  
  // 5. SECONDARY SKILL
  if (secondarySkill && secondarySkill !== primarySkill) {
    questions.push({
      id: qId++,
      question: `Tell me about your experience with ${secondarySkill}. How have you used it in real-world projects?`,
      difficulty: 'Medium',
      time: 120,
      type: 'technical'
    });
  }
  
  // 6. PRACTICAL SCENARIO
  const scenarios = {
    'SAP': 'A client needs a custom SAP report pulling data from multiple modules with complex logic. Walk me through your approach from requirement gathering to delivery.',
    'Salesforce': 'Your Salesforce org is hitting governor limits in production causing failures. How would you diagnose and fix this issue?',
    'React': 'Your React application has severe performance issues with slow rendering and high memory usage. How would you debug and optimize it?',
    'Data Science': 'Your machine learning model performs well on training data but poorly on test data (overfitting). What steps would you take?',
    'Accounting': 'You discover a $50,000 discrepancy during month-end reconciliation. What is your step-by-step approach to investigate?',
    'Digital Marketing': 'Your paid ad campaign has high impressions and clicks but zero conversions. How would you investigate and fix this?',
    'Nursing': 'You have multiple critical patients requiring immediate attention. How do you prioritize and manage the situation?',
    'Project Management': 'Your project is 3 weeks behind schedule and 20% over budget. How do you get it back on track?'
  };
  
  questions.push({
    id: qId++,
    question: scenarios[primarySkill] || `Describe a critical technical challenge you faced as a ${detectedRole}. Walk me through how you solved it step by step.`,
    difficulty: 'Hard',
    time: 180,
    type: 'scenario'
  });
  
  // 7. PROJECT ACHIEVEMENT
  questions.push({
    id: qId++,
    question: `Describe your most technically challenging or impactful project as a ${detectedRole}. What was your specific role and contribution?`,
    difficulty: 'Medium',
    time: 180,
    type: 'achievement'
  });
  
  // 8. TOOLS & TECHNOLOGIES
  questions.push({
    id: qId++,
    question: `What tools, software, and technologies do you use regularly in your ${detectedRole} work? Which ones are you most proficient in?`,
    difficulty: 'Easy',
    time: 120,
    type: 'tools'
  });
  
  // 9. ONE BEHAVIORAL QUESTION (kept minimal)
  questions.push({
    id: qId++,
    question: 'Tell me about a time you collaborated with a difficult team member or resolved a professional conflict. What was the outcome?',
    difficulty: 'Medium',
    time: 120,
    type: 'behavioral'
  });
  
  // 10. LEARNING/LEADERSHIP based on experience level
  if (experienceLevel === 'senior') {
    questions.push({
      id: qId++,
      question: `As a senior ${detectedRole}, how do you mentor junior team members and ensure technical excellence in your organization?`,
      difficulty: 'Medium',
      time: 120,
      type: 'leadership'
    });
  } else {
    questions.push({
      id: qId++,
      question: `What new technologies or skills are you currently learning to advance your career as a ${detectedRole}?`,
      difficulty: 'Easy',
      time: 90,
      type: 'learning'
    });
  }
  
  // 11. SHORT CLOSING
  questions.push({
    id: qId++,
    question: `Why are you interested in this ${detectedRole} position and what unique technical value can you bring to the role?`,
    difficulty: 'Easy',
    time: 90,
    type: 'closing'
  });
  
  return questions;
};

// ⭐ SMART SCORING FUNCTION
const scoreAnswerSmart = (question, answer, difficulty) => {
  if (!answer || answer.trim().length < 10) {
    return {
      score: 0,
      feedback: 'No meaningful answer provided. Please provide detailed responses with specific examples.'
    };
  }

  const maxScore = difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 20 : 30;
  const wordCount = answer.split(/\s+/).filter(w => w.length > 0).length;
  const sentenceCount = answer.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  
  const questionWords = question.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3 && !['what', 'when', 'where', 'which', 'would', 'could', 'should', 'about', 'your', 'yourself', 'tell', 'describe'].includes(w));
  
  const answerLower = answer.toLowerCase();
  const relevantKeywords = questionWords.filter(word => answerLower.includes(word)).length;
  const keywordScore = Math.min(relevantKeywords / Math.max(questionWords.length, 1), 1);
  
  let lengthScore;
  if (wordCount < 20) lengthScore = wordCount / 20 * 0.5;
  else if (wordCount < 50) lengthScore = 0.5 + ((wordCount - 20) / 30) * 0.25;
  else if (wordCount < 100) lengthScore = 0.75 + ((wordCount - 50) / 50) * 0.2;
  else lengthScore = 0.95;
  
  const structureScore = Math.min(sentenceCount / 5, 1);
  
  const professionalTerms = ['experience', 'project', 'developed', 'implemented', 'designed', 'managed', 'achieved', 'improved', 'responsible', 'team', 'skills', 'technology', 'system', 'application', 'worked', 'created', 'built', 'led', 'delivered'];
  const professionalCount = professionalTerms.filter(term => answerLower.includes(term)).length;
  const professionalBonus = Math.min(professionalCount / 5, 0.25);
  
  const rawScore = (keywordScore * 0.35 + lengthScore * 0.35 + structureScore * 0.15 + professionalBonus);
  let finalScore = Math.round(rawScore * maxScore);
  
  if (wordCount >= 15 && finalScore < maxScore * 0.3) {
    finalScore = Math.round(maxScore * 0.3);
  }
  
  finalScore = Math.min(finalScore, maxScore);
  
  const scorePercentage = (finalScore / maxScore) * 100;
  let feedback = '';
  
  if (scorePercentage >= 85) feedback = 'Excellent answer! You demonstrated strong technical understanding with clear, detailed explanations.';
  else if (scorePercentage >= 70) feedback = 'Great answer! You covered key points well. Adding more specific examples would make it even stronger.';
  else if (scorePercentage >= 55) feedback = 'Good effort! Your answer is on track but could benefit from more depth and concrete examples.';
  else if (scorePercentage >= 40) feedback = 'Adequate response. Try to elaborate more with specific details and real-world examples from your experience.';
  else if (scorePercentage >= 20) feedback = 'Basic answer provided. Focus on giving more comprehensive responses with technical details.';
  else feedback = 'Brief answer. Please provide more substantial explanations with specific examples.';
  
  return { score: finalScore, feedback: feedback };
};

const VideoInterviewPage = ({ candidate, onComplete, onBack }) => {
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const voiceEngine = useRef(null);
  const speechEngine = useRef(null);
  const timerRef = useRef(null);
  const answersRef = useRef([]);
  const isProcessingRef = useRef(false);
  const hasInitialized = useRef(false);

  const startRecording = useCallback(() => {
    if (!voiceEngine.current || voiceEngine.current.isActive?.()) return true;
    if (isRecording) return true;
    const started = voiceEngine.current.start();
    if (started) setIsRecording(true);
    return started;
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (!voiceEngine.current) return '';
    const finalTranscript = voiceEngine.current.stop();
    setIsRecording(false);
    return finalTranscript || transcript;
  }, [transcript]);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (voiceEngine.current) voiceEngine.current.abort?.();
    if (speechEngine.current) speechEngine.current.stop();
    if (stream) stream.getTracks().forEach(track => track.stop());
  }, [stream]);

  const speakText = useCallback(async (text) => {
    if (!speechEngine.current) return;
    if (isRecording) stopRecording();
    setIsAISpeaking(true);
    try {
      await speechEngine.current.speak(text, {
        rate: 0.95,
        pitch: 1.1,
        onEnd: () => setIsAISpeaking(false)
      });
    } catch (err) {
      setIsAISpeaking(false);
    }
  }, [isRecording, stopRecording]);

  const completeInterview = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setStatus('completed');
    
    const totalScore = answersRef.current.reduce((sum, ans) => sum + ans.score, 0);
    const maxScore = answersRef.current.reduce((sum, ans) => {
      const max = ans.difficulty === 'Easy' ? 10 : ans.difficulty === 'Medium' ? 20 : 30;
      return sum + max;
    }, 0);

    await speakText(`Interview complete! Your total score is ${totalScore} out of ${maxScore} points. Thank you for your time.`);
    
    setTimeout(() => {
      cleanup();
      onComplete({
        ...candidate,
        answers: answersRef.current,
        completed: true,
        completedAt: Date.now(),
        totalScore,
        maxScore,
        summary: `Total Score: ${totalScore}/${maxScore} points`
      });
    }, 3000);
  }, [candidate, onComplete, speakText, cleanup]);

  const startQuestionRef = useRef();

  const submitAnswerHelper = useCallback(async (questionIndex, finalTranscript, currentTimeRemaining) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setStatus('evaluating');

    const question = questions[questionIndex];
    if (!question) {
      isProcessingRef.current = false;
      return;
    }

    const result = scoreAnswerSmart(question.question, finalTranscript || '(No answer provided)', question.difficulty);
    
    const newAnswer = {
      questionId: question.id,
      question: question.question,
      answer: finalTranscript,
      score: result.score,
      feedback: result.feedback,
      difficulty: question.difficulty,
      timeUsed: question.time - (currentTimeRemaining || 0)
    };

    answersRef.current = [...answersRef.current, newAnswer];
    console.log('✅ Answer saved:', newAnswer);

    const maxScore = question.difficulty === 'Easy' ? 10 : question.difficulty === 'Medium' ? 20 : 30;
    await speakText(`You scored ${result.score} out of ${maxScore} points. ${result.feedback}`);

    if (questionIndex < questions.length - 1) {
      await speakText('Moving to the next question.');
      setTimeout(() => {
        isProcessingRef.current = false;
        if (startQuestionRef.current) startQuestionRef.current(questionIndex + 1);
      }, 2000);
    } else {
      isProcessingRef.current = false;
      completeInterview();
    }
  }, [questions, speakText, completeInterview]);

  const handleSubmitAnswer = useCallback(() => {
    if (isProcessingRef.current) return;
    const finalTranscript = stopRecording();
    if (timerRef.current) clearInterval(timerRef.current);
    submitAnswerHelper(currentQuestionIndex, finalTranscript, timeRemaining);
  }, [stopRecording, currentQuestionIndex, timeRemaining, submitAnswerHelper]);

  const startQuestion = useCallback((index) => {
    if (isProcessingRef.current) return;
    const question = questions[index];
    if (!question) return;

    console.log(`📋 Starting question ${index + 1}:`, question.question);

    setCurrentQuestionIndex(index);
    setTimeRemaining(question.time);
    setTranscript('');
    setStatus('asking');

    if (!voiceEngine.current) {
      voiceEngine.current = new VoiceEngine();
      voiceEngine.current.setCallbacks({
        onResult: (result) => setTranscript(result.full),
        onSilence: () => {
          setTimeout(() => { 
            if (isRecording) handleSubmitAnswer(); 
          }, 1500);
        },
        onError: (err) => setError(`Microphone error: ${err}`)
      });
    }

    let questionText = `Question ${index + 1}.`;
    if (question.type === 'introduction') questionText += ' Let\'s start with an introduction.';
    else if (question.type === 'closing') questionText += ' This is our final question.';
    questionText += ` ${question.question}. You have ${question.time} seconds to answer.`;

    speakText(questionText).then(() => {
      setTimeout(() => {
        setStatus('answering');
        const started = startRecording();
        
        if (started) {
          let timeLeft = question.time;
          timerRef.current = setInterval(() => {
            timeLeft -= 1;
            setTimeRemaining(timeLeft);
            
            if (timeLeft <= 0) {
              console.log('⏰ Time expired! Auto-submitting...');
              clearInterval(timerRef.current);
              timerRef.current = null;
              setTimeout(() => {
                const finalTranscript = stopRecording();
                submitAnswerHelper(index, finalTranscript, 0);
              }, 100);
            }
          }, 1000);
        } else {
          setError('Failed to start voice recognition. Please check microphone permissions.');
        }
      }, 1000);
    });
  }, [questions, speakText, startRecording, handleSubmitAnswer, isRecording, stopRecording, submitAnswerHelper]);

  useEffect(() => {
    startQuestionRef.current = startQuestion;
  }, [startQuestion]);

  const initializeInterview = useCallback(async () => {
    if (hasInitialized.current) {
      console.warn('⚠️ Already initialized, skipping...');
      return;
    }
    hasInitialized.current = true;

    try {
      console.log('🚀 Initializing video interview...');

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 24 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      voiceEngine.current = new VoiceEngine();
      speechEngine.current = new SpeechSynthesisEngine();
      await speechEngine.current.initialize();

      console.log('✅ Media and engines initialized');

      setStatus('generating_questions');
      const qs = generateSmartQuestions(
        candidate?.resumeText || '',
        candidate?.jobRole || ''
      );
      
      setQuestions(qs);
      setStatus('ready');
      console.log('✅ Generated', qs.length, 'personalized questions');

      await speakText('Hello! Welcome to your AI video interview. I will ask you questions based on your resume and experience. Let\'s begin with an introduction.');
      
      setTimeout(() => {
        if (startQuestionRef.current) {
          startQuestionRef.current(0);
        }
      }, 2000);

    } catch (err) {
      console.error('Initialization error:', err);
      setError('Failed to access camera/microphone. Please grant permissions and refresh the page.');
      setStatus('error');
      hasInitialized.current = false;
    }
  }, [candidate, speakText]);

  useEffect(() => {
    initializeInterview();
    return () => {
      console.log('🔄 Component unmounting, cleaning up...');
      cleanup();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl p-8 max-w-md text-center">
          <VideoOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Camera Access Required</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
                cleanup();
                onBack();
              }
            }}
            className="text-white hover:text-gray-300 transition px-4 py-2 bg-gray-800 rounded-lg"
          >
            ← Exit Interview
          </button>
          <h1 className="text-3xl font-bold text-white">AI Video Interview</h1>
          <div className="w-32"></div>
        </div>

        <div className="bg-black rounded-xl overflow-hidden mb-6 relative shadow-2xl">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-[500px] object-cover" 
          />

          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="bg-black/80 px-4 py-3 rounded-xl backdrop-blur-md border border-white/20">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-white text-sm font-medium">
                  {status === 'initializing' && '⏳ Setting up...'}
                  {status === 'generating_questions' && '🤖 Analyzing your resume...'}
                  {status === 'ready' && '✅ Ready'}
                  {status === 'asking' && '🗣️ AI Speaking'}
                  {status === 'answering' && '🎤 Your Turn to Speak'}
                  {status === 'evaluating' && '📊 Evaluating your answer...'}
                  {status === 'completed' && '🎉 Interview Complete!'}
                </span>
              </div>
            </div>

            {timeRemaining !== null && status !== 'completed' && (
              <div className={`px-5 py-3 rounded-xl font-bold text-xl backdrop-blur-md border-2 ${
                timeRemaining <= 10 ? 'bg-red-500/90 border-red-300 animate-pulse' : 
                timeRemaining <= 30 ? 'bg-orange-500/90 border-orange-300' : 
                'bg-blue-500/90 border-blue-300'
              } text-white shadow-lg`}>
                <Clock className="w-6 h-6 inline mr-2" />
                {formatTime(timeRemaining)}
              </div>
            )}
          </div>

          {isAISpeaking && (
            <div className="absolute bottom-6 left-6">
              <div className="bg-purple-500/95 px-5 py-3 rounded-xl flex items-center gap-3 text-white backdrop-blur-md border-2 border-purple-300 shadow-lg">
                <Volume2 className="w-6 h-6 animate-pulse" />
                <div className="flex flex-col">
                  <span className="font-bold">AI is speaking...</span>
                  <span className="text-xs text-purple-100">Please wait for your turn</span>
                </div>
                <div className="flex gap-1 ml-2">
                  <div className="w-1 h-4 bg-white rounded-full animate-pulse"></div>
                  <div className="w-1 h-6 bg-white rounded-full animate-pulse" style={{animationDelay: '75ms'}}></div>
                  <div className="w-1 h-5 bg-white rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
                </div>
              </div>
            </div>
          )}

          {isRecording && (
            <div className="absolute bottom-6 right-6">
              <div className="bg-red-500/95 px-5 py-3 rounded-xl backdrop-blur-md border-2 border-red-300 shadow-lg">
                <div className="flex items-center gap-3 text-white">
                  <Mic className="w-6 h-6 animate-pulse" />
                  <div className="flex flex-col">
                    <span className="font-bold">Recording...</span>
                    <span className="text-xs">I'm listening</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isRecording && transcript && (
            <div className="absolute top-20 left-4">
              <div className="bg-green-500/95 px-4 py-2 rounded-lg flex items-center gap-2 text-white backdrop-blur-md border border-green-300">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">I can hear you clearly!</span>
              </div>
            </div>
          )}

          {timeRemaining !== null && timeRemaining <= 30 && timeRemaining > 0 && status === 'answering' && (
            <div className="absolute top-20 right-4">
              <div className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white backdrop-blur-md border ${
                timeRemaining <= 10 ? 'bg-red-500/95 border-red-300 animate-pulse' : 'bg-orange-500/95 border-orange-300'
              }`}>
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {timeRemaining <= 10 ? 'HURRY UP!' : 'Time running low!'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
              <p className="text-sm text-gray-500 mt-1 capitalize">
                {questions[currentQuestionIndex]?.type || 'Loading...'}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              questions[currentQuestionIndex]?.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-2 border-green-300'
              : questions[currentQuestionIndex]?.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
              : 'bg-red-100 text-red-700 border-2 border-red-300'
            }`}>
              {questions[currentQuestionIndex]?.difficulty || 'Loading'}
            </span>
          </div>
          
          <p className="text-xl text-gray-700 mb-4 leading-relaxed">
            {questions[currentQuestionIndex]?.question || 'Loading question...'}
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-inner" 
              style={{ 
                width: `${questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0}%` 
              }} 
            />
          </div>
        </div>

        {transcript && status === 'answering' && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-lg border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-indigo-600 animate-pulse" />
                <h3 className="text-lg font-bold text-gray-800">Your Answer (Live Transcript)</h3>
              </div>
              <button
                onClick={handleSubmitAnswer}
                disabled={isProcessingRef.current || transcript.length < 10}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-bold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Submit Answer
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {transcript || 'Start speaking...'}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <span>Words: {transcript.split(/\s+/).filter(w => w.length > 0).length}</span>
                <span>•</span>
                <span>Characters: {transcript.length}</span>
              </div>
            </div>
          </div>
        )}

        {error && status !== 'error' && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3">💡 Interview Tips</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Speak clearly and naturally - the AI is analyzing your responses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Provide specific examples and technical details from your actual experience</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Watch the timer and submit manually or let it auto-submit when time expires</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Quality matters more than speed - take your time to give comprehensive answers</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoInterviewPage;