import React, { useState, useEffect, useRef } from 'react';
import { Upload, Send, User, Search, Clock, AlertCircle, FileText, Mail, Phone, Award, TrendingUp, Calendar, ChevronLeft, CheckCircle } from 'lucide-react';

// Utility Functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const extractTextFromPDF = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      resolve(text);
    };
    reader.readAsText(file);
  });
};

const extractTextFromDOCX = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      resolve(text);
    };
    reader.readAsText(file);
  });
};

const parseResume = (text) => {
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/[\d\s()+-]{10,}/);
  const lines = text.split('\n').filter(l => l.trim());
  const name = lines[0]?.trim() || '';
  
  return {
    name,
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0].trim() : ''
  };
};

const generateQuestions = () => [
  { id: 1, question: "Tell me about yourself and your background.", difficulty: "Easy", time: 120 },
  { id: 2, question: "What are your greatest strengths and how do they apply to this role?", difficulty: "Medium", time: 180 },
  { id: 3, question: "Describe a challenging project you worked on and how you overcame obstacles.", difficulty: "Hard", time: 240 }
];

const scoreAnswer = (question, answer, difficulty) => {
  const wordCount = answer.trim().split(/\s+/).length;
  const baseScore = difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 20 : 30;
  const minWords = difficulty === 'Easy' ? 20 : difficulty === 'Medium' ? 40 : 60;
  
  if (wordCount < minWords * 0.3) return Math.floor(baseScore * 0.3);
  if (wordCount < minWords * 0.6) return Math.floor(baseScore * 0.6);
  if (wordCount >= minWords) return baseScore;
  return Math.floor(baseScore * 0.8);
};

const generateSummary = (candidate) => {
  const totalScore = candidate.answers.reduce((sum, ans) => sum + ans.score, 0);
  const maxScore = candidate.answers.reduce((sum, ans) => {
    const max = ans.difficulty === 'Easy' ? 10 : ans.difficulty === 'Medium' ? 20 : 30;
    return sum + max;
  }, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);
  
  let rating = 'Needs Improvement';
  if (percentage >= 80) rating = 'Excellent';
  else if (percentage >= 60) rating = 'Good';
  else if (percentage >= 40) rating = 'Average';
  
  return `📊 Overall Score: ${totalScore}/${maxScore} (${percentage}%)\n⭐ Rating: ${rating}`;
};

// Components
const Header = () => (
  <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-1.5 sm:p-2 rounded-lg">
            <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">Interview Assistant</h1>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">AI-Powered Interview Platform</p>
          </div>
        </div>
      </div>
    </div>
  </header>
);

const TabNavigation = ({ activeTab, setActiveTab }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
    <div className="bg-white rounded-lg shadow-sm p-1 inline-flex w-full sm:w-auto">
      <button
        onClick={() => setActiveTab('interviewee')}
        className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium text-xs sm:text-base transition-all ${
          activeTab === 'interviewee'
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <span className="flex items-center justify-center space-x-1 sm:space-x-2">
          <User className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Interviewee</span>
        </span>
      </button>
      <button
        onClick={() => setActiveTab('interviewer')}
        className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium text-xs sm:text-base transition-all ${
          activeTab === 'interviewer'
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <span className="flex items-center justify-center space-x-1 sm:space-x-2">
          <Award className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Interviewer</span>
        </span>
      </button>
    </div>
  </div>
);

const ChatMessage = ({ message }) => (
  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[85%] sm:max-w-[75%] ${
      message.sender === 'user' 
        ? 'bg-indigo-600 text-white' 
        : 'bg-gray-100 text-gray-800'
    } rounded-lg px-3 sm:px-4 py-2 sm:py-3 shadow-sm`}>
      {message.type === 'file' ? (
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span className="text-sm">{message.content}</span>
        </div>
      ) : (
        <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{message.content}</p>
      )}
    </div>
  </div>
);

const Timer = ({ timeRemaining }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining <= 30;
  
  return (
    <div className={`mb-3 p-2 sm:p-3 rounded-lg flex items-center justify-center gap-2 ${
      isLowTime ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
    }`}>
      <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${isLowTime ? 'text-red-600' : 'text-blue-600'}`} />
      <span className={`font-semibold text-sm sm:text-base ${isLowTime ? 'text-red-700' : 'text-blue-700'}`}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

const WelcomeBackModal = ({ onResume, onStartFresh }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Welcome Back!</h2>
      <p className="text-sm sm:text-base text-gray-600 mb-6">You have an incomplete interview. Would you like to continue where you left off?</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onResume}
          className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium text-sm sm:text-base"
        >
          Resume Interview
        </button>
        <button
          onClick={onStartFresh}
          className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium text-sm sm:text-base"
        >
          Start Fresh
        </button>
      </div>
    </div>
  </div>
);

const CandidateRow = ({ candidate, onViewDetails }) => {
  const totalScore = candidate.answers.reduce((sum, ans) => sum + ans.score, 0);
  const maxScore = candidate.answers.reduce((sum, ans) => {
    const max = ans.difficulty === 'Easy' ? 10 : ans.difficulty === 'Medium' ? 20 : 30;
    return sum + max;
  }, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);
  
  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{candidate.name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="text-xs sm:text-sm text-gray-600">
          <div className="flex items-center space-x-1 mb-1">
            <Mail className="w-3 h-3" />
            <span className="truncate max-w-[150px] sm:max-w-none">{candidate.email}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Phone className="w-3 h-3" />
            <span>{candidate.phone}</span>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center space-x-2">
          <div className="text-lg sm:text-xl font-bold text-indigo-600">{percentage}%</div>
          <div className="text-xs text-gray-500">({totalScore}/{maxScore})</div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{candidate.summary}</p>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
        <button
          onClick={() => onViewDetails(candidate)}
          className="text-indigo-600 hover:text-indigo-800 font-medium text-xs sm:text-sm"
        >
          View Details
        </button>
      </td>
    </tr>
  );
};

const CandidateDetails = ({ candidate, onBack }) => {
  const totalScore = candidate.answers.reduce((sum, ans) => sum + ans.score, 0);
  const maxScore = candidate.answers.reduce((sum, ans) => {
    const max = ans.difficulty === 'Easy' ? 10 : ans.difficulty === 'Medium' ? 20 : 30;
    return sum + max;
  }, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-white hover:text-indigo-100 transition mb-4"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Back to List</span>
        </button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">{candidate.name}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-indigo-100 text-xs sm:text-sm">
              <span className="flex items-center space-x-1">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{candidate.email}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{candidate.phone}</span>
              </span>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 bg-white bg-opacity-20 rounded-lg px-4 sm:px-6 py-2 sm:py-3 backdrop-blur-sm">
            <div className="text-white text-center">
              <div className="text-2xl sm:text-3xl font-bold">{percentage}%</div>
              <div className="text-xs sm:text-sm">Overall Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Score</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{totalScore}/{maxScore}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Questions</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{candidate.answers.length}</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Completed</span>
            </div>
            <div className="text-sm font-semibold text-purple-600">
              {new Date(candidate.completedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Interview Responses</h3>
          <div className="space-y-4">
            {candidate.answers.map((ans, idx) => {
              const maxScoreForQ = ans.difficulty === 'Easy' ? 10 : ans.difficulty === 'Medium' ? 20 : 30;
              const scorePercent = Math.round((ans.score / maxScoreForQ) * 100);
              
              return (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded">
                          Q{idx + 1}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          ans.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          ans.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {ans.difficulty}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base mb-3">{ans.question}</p>
                    </div>
                    <div className="flex items-center space-x-2 mb-2 sm:mb-0 sm:ml-4">
                      <div className="text-right">
                        <div className="text-lg sm:text-xl font-bold text-indigo-600">{scorePercent}%</div>
                        <div className="text-xs text-gray-500">{ans.score}/{maxScoreForQ}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Answer:</p>
                    <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{ans.answer}</p>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Time used: {Math.floor(ans.timeUsed / 60)}:{(ans.timeUsed % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const InterviewAssistant = () => {
  const [activeTab, setActiveTab] = useState('interviewee');
  const [candidates, setCandidates] = useState([]);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [error, setError] = useState('');
  
  const timerRef = useRef(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem('interviewData') || '{}');
    if (saved.candidates) setCandidates(saved.candidates);
    if (saved.currentCandidate && !saved.currentCandidate.completed) {
      setShowWelcomeBack(true);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('interviewData', JSON.stringify({
      candidates,
      currentCandidate,
      chatMessages,
      interviewStarted,
      currentQuestionIndex,
      questions
    }));
  }, [candidates, currentCandidate, chatMessages, interviewStarted, currentQuestionIndex, questions]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeRemaining === 0 && interviewStarted) {
        handleSubmitAnswer();
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeRemaining, interviewStarted]);

  const addMessage = (sender, content, type = 'text') => {
    setChatMessages(prev => [...prev, { sender, content, type, timestamp: Date.now() }]);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(fileType)) {
      setError('Please upload a PDF or DOCX file');
      return;
    }

    setError('');
    setUploadedFile(file);
    addMessage('user', file.name, 'file');
    addMessage('assistant', 'Analyzing your resume...');

    try {
      let text = '';
      if (fileType === 'pdf') {
        text = await extractTextFromPDF(file);
      } else if (fileType === 'docx') {
        text = await extractTextFromDOCX(file);
      }

      const parsed = parseResume(text);
      const missing = [];
      if (!parsed.name) missing.push('name');
      if (!parsed.email) missing.push('email');
      if (!parsed.phone) missing.push('phone');

      const candidateId = generateId();
      const newCandidate = {
        id: candidateId,
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        answers: [],
        completed: false,
        startedAt: Date.now()
      };

      setCurrentCandidate(newCandidate);
      setMissingFields(missing);

      if (missing.length > 0) {
        addMessage('assistant', `I found some information, but I need your ${missing.join(', ')}. Let's start with your ${missing[0]}:`);
      } else {
        addMessage('assistant', `Great! I found your details:\n\n👤 Name: ${parsed.name}\n📧 Email: ${parsed.email}\n📱 Phone: ${parsed.phone}\n\nReady to start the interview? Type "start" to begin!`);
      }
    } catch (err) {
      setError('Error processing resume. Please try again.');
      addMessage('assistant', 'Sorry, I had trouble reading your resume. Please upload it again.');
    }
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    addMessage('user', currentInput);
    const input = currentInput.trim();
    setCurrentInput('');

    if (missingFields.length > 0 && !interviewStarted) {
      const field = missingFields[0];
      const updatedCandidate = { ...currentCandidate, [field]: input };
      setCurrentCandidate(updatedCandidate);
      
      const remaining = missingFields.slice(1);
      setMissingFields(remaining);

      if (remaining.length > 0) {
        addMessage('assistant', `Thanks! Now, please provide your ${remaining[0]}:`);
      } else {
        addMessage('assistant', `Perfect! Here's your information:\n\n👤 Name: ${updatedCandidate.name}\n📧 Email: ${updatedCandidate.email}\n📱 Phone: ${updatedCandidate.phone}\n\nReady to start the interview? Type "start" to begin!`);
      }
      return;
    }

    if (!interviewStarted && input.toLowerCase() === 'start') {
      const qs = generateQuestions();
      setQuestions(qs);
      setInterviewStarted(true);
      setCurrentQuestionIndex(0);
      setTimeRemaining(qs[0].time);
      addMessage('assistant', `Great! Let's begin. You'll have ${qs[0].time} seconds for this question.\n\n**Question 1 (${qs[0].difficulty}):**\n${qs[0].question}`);
      return;
    }

    if (interviewStarted && currentQuestionIndex < questions.length) {
      handleSubmitAnswer(input);
    }
  };

  const handleSubmitAnswer = (answer = currentInput || '(No answer provided)') => {
    const question = questions[currentQuestionIndex];
    const score = scoreAnswer(question.question, answer, question.difficulty);
    
    const newAnswer = {
      questionId: question.id,
      question: question.question,
      answer,
      score,
      difficulty: question.difficulty,
      timeUsed: question.time - (timeRemaining || 0)
    };

    const updatedAnswers = [...currentCandidate.answers, newAnswer];
    const updatedCandidate = { ...currentCandidate, answers: updatedAnswers };
    setCurrentCandidate(updatedCandidate);

    addMessage('assistant', `Score: ${score}/${question.difficulty === 'Easy' ? 10 : question.difficulty === 'Medium' ? 20 : 30}`);

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const nextQuestion = questions[nextIndex];
      setCurrentQuestionIndex(nextIndex);
      setTimeRemaining(nextQuestion.time);
      addMessage('assistant', `\n**Question ${nextIndex + 1} (${nextQuestion.difficulty}):**\n${nextQuestion.question}\n\nYou have ${nextQuestion.time} seconds.`);
    } else {
      const summary = generateSummary(updatedCandidate);
      const finalCandidate = {
        ...updatedCandidate,
        completed: true,
        summary,
        completedAt: Date.now()
      };
      
      setCandidates(prev => [...prev, finalCandidate]);
      setCurrentCandidate(null);
      setInterviewStarted(false);
      setTimeRemaining(null);
      
      addMessage('assistant', `\n🎉 Interview Complete!\n\n${summary}\n\nThank you for your time! You can now switch to the Interviewer tab to see your results.`);
    }
    
    setCurrentInput('');
  };

  const handleWelcomeBack = (resume) => {
    setShowWelcomeBack(false);
    if (resume) {
      const saved = JSON.parse(sessionStorage.getItem('interviewData') || '{}');
      if (saved.currentCandidate) {
        setCurrentCandidate(saved.currentCandidate);
        setChatMessages(saved.chatMessages || []);
        setInterviewStarted(saved.interviewStarted || false);
        setCurrentQuestionIndex(saved.currentQuestionIndex || 0);
        setQuestions(saved.questions || []);
        if (saved.interviewStarted && saved.questions?.[saved.currentQuestionIndex]) {
          setTimeRemaining(saved.questions[saved.currentQuestionIndex].time);
        }
      }
    } else {
      sessionStorage.removeItem('interviewData');
      setCurrentCandidate(null);
      setChatMessages([]);
      setInterviewStarted(false);
    }
  };

  const filteredCandidates = candidates
    .filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const scoreA = a.answers.reduce((sum, ans) => sum + ans.score, 0);
      const scoreB = b.answers.reduce((sum, ans) => sum + ans.score, 0);
      return sortBy === 'score' ? scoreB - scoreA : b.completedAt - a.completedAt;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {showWelcomeBack && (
        <WelcomeBackModal
          onResume={() => handleWelcomeBack(true)}
          onStartFresh={() => handleWelcomeBack(false)}
        />
      )}

      <Header />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        {activeTab === 'interviewee' ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
            <div className="h-[500px] sm:h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-400 mb-3 sm:mb-4" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Let's Get Started!</h2>
                    <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Upload your resume (PDF or DOCX) to begin the interview</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-indigo-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-indigo-700 transition font-medium shadow-md text-sm sm:text-base"
                    >
                      Upload Resume
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <>
                    {chatMessages.map((msg, idx) => (
                      <ChatMessage key={idx} message={msg} />
                    ))}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {chatMessages.length > 0 && (
                <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
                  {interviewStarted && timeRemaining !== null && (
                    <Timer timeRemaining={timeRemaining} />
                  )}
                  
                  {error && (
                    <div className="mb-3 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs sm:text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  {!currentCandidate?.completed && (
                    <div className="flex gap-2">
                      {!uploadedFile && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2.5 sm:p-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition flex-shrink-0"
                        >
                          <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                      )}
                      <input
                        type="text"
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your answer..."
                        className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                        disabled={!uploadedFile || (interviewStarted && timeRemaining === 0)}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!currentInput.trim()}
                        className="p-2.5 sm:p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Candidates Dashboard</h2>
                  <p className="text-xs sm:text-sm text-gray-600">{candidates.length} total candidates</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search candidates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 text-sm sm:text-base"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                  >
                    <option value="score">Sort by Score</option>
                    <option value="date">Sort by Date</option>
                  </select>
                </div>
              </div>
            </div>

            {selectedCandidate ? (
              <CandidateDetails
                candidate={selectedCandidate}
                onBack={() => setSelectedCandidate(null)}
              />
            ) : (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                {filteredCandidates.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center">
                    <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No Candidates Yet</h3>
                    <p className="text-sm sm:text-base text-gray-500">Candidates will appear here after completing interviews</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Candidate</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Score</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Summary</th>
                          <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredCandidates.map((candidate) => (
                          <CandidateRow
                            key={candidate.id}
                            candidate={candidate}
                            onViewDetails={setSelectedCandidate}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewAssistant;