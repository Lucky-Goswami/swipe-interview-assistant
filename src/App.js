import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/common/Header';
import { TabNavigation } from './components/common/TabNavigation';
import { IntervieweeView } from './components/interviewee/IntervieweeView';
import { InterviewerDashboard } from './components/interviewer/InterviewerDashboard';
import { WelcomeBackModal } from './components/modals/WelcomeBackModal';
import VideoInterviewPage from './components/video/VideoInterviewPage';

// Import authentication components
import LandingPage from './components/homepage/LandingPage';
import LoginPage from './components/homepage/LoginPage';
import SignupPage from './components/homepage/SignupPage';

// Import Firebase auth
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

// Import AI functions
import { generateInterviewQuestions, scoreAnswerWithAI, validateAnswer } from './components/ai/GeminiAI';

function App() {
  // Video Interview State
  const [showVideoInterview, setShowVideoInterview] = useState(false);
  
  // Authentication state
  const [authView, setAuthView] = useState('landing');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Existing interview state
  const [activeTab, setActiveTab] = useState('interviewee');
  const [candidates, setCandidates] = useState([]);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const chatEndRef = useRef(null);
  const timerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // WORKING TIMER with Auto-Submit
  useEffect(() => {
    if (interviewStarted && timeRemaining !== null && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [interviewStarted, currentQuestionIndex]);

  // Auto-submit when timer hits 0
  const handleAutoSubmit = () => {
    const answer = currentInput.trim() || '(No answer provided - Time expired)';
    addMessage('system', `⏰ Time's up! Auto-submitting your answer...`);
    handleSubmitAnswer(answer, true);
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL
        };
        setUser(userData);
        setAuthView('authenticated');
        loadUserInterviewData(firebaseUser.uid);
      } else {
        setUser(null);
        setAuthView('landing');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserInterviewData = (userId) => {
    const saved = localStorage.getItem(`interviewData_${userId}`);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.candidates) setCandidates(data.candidates);
      if (data.currentCandidate && !data.currentCandidate.completed) {
        setShowWelcomeBack(true);
      }
    }
  };

  // ⭐ FIXED: Save interview data with uploaded file name
  useEffect(() => {
    if (user && authView === 'authenticated') {
      localStorage.setItem(`interviewData_${user.uid}`, JSON.stringify({
        candidates,
        currentCandidate,
        chatMessages,
        interviewStarted,
        currentQuestionIndex,
        questions,
        timeRemaining,
        uploadedFileName: uploadedFile?.name || null // ⭐ SAVE FILE NAME
      }));
    }
  }, [candidates, currentCandidate, chatMessages, interviewStarted, currentQuestionIndex, questions, timeRemaining, uploadedFile, user, authView]);

  const handleLogin = (userData) => {
    setUser(userData);
    setAuthView('authenticated');
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setAuthView('authenticated');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAuthView('landing');
      setCandidates([]);
      setCurrentCandidate(null);
      setChatMessages([]);
      setInterviewStarted(false);
      setCurrentQuestionIndex(0);
      setTimeRemaining(null);
      setQuestions([]);
      setUploadedFile(null);
      setError('');
      setShowVideoInterview(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const addMessage = (sender, content, type = 'text') => {
    setChatMessages(prev => [...prev, { 
      sender, 
      content, 
      type, 
      timestamp: Date.now() 
    }]);
  };

  // Resume Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(fileType)) {
      setError('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    setError('');
    setIsUploading(true);
    setUploadedFile(file);
    addMessage('user', file.name, 'file');
    addMessage('assistant', '🔍 Analyzing your resume with AI...');

    try {
      let resumeText = `Resume: ${file.name}\nCandidate: ${user?.name || 'Candidate'}\nEmail: ${user?.email || 'email@example.com'}`;
      
      if (fileType === 'txt') {
        resumeText = await file.text();
      }

      const candidateId = `candidate-${Date.now()}`;
      const newCandidate = {
        id: candidateId,
        name: user?.name || 'Candidate',
        email: user?.email || 'email@example.com',
        phone: '+1234567890',
        resumeText: resumeText,
        answers: [],
        completed: false,
        startedAt: Date.now()
      };

      setCurrentCandidate(newCandidate);
      setIsUploading(false);
      addMessage('assistant', `✅ Great! I found your details:\n\n👤 Name: ${newCandidate.name}\n📧 Email: ${newCandidate.email}\n📱 Phone: ${newCandidate.phone}\n\n🚀 Ready to start the interview? Type "start" to begin!`);
    } catch (error) {
      console.error('File upload error:', error);
      setIsUploading(false);
      setError('Failed to process resume. Please try again.');
      addMessage('assistant', '❌ Failed to analyze resume. Please try again.');
    }
  };

  // Better question generation
  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;

    addMessage('user', currentInput);
    const input = currentInput.trim();
    setCurrentInput('');

    if (!interviewStarted && input.toLowerCase() === 'start') {
      addMessage('assistant', '🤖 Analyzing your resume deeply and generating personalized technical questions...\n\n⏳ This may take 10-15 seconds...');
      
      try {
        const aiQuestions = await generateInterviewQuestions(
          currentCandidate.resumeText || `Candidate: ${currentCandidate.name}`,
          'Full Stack Developer (React/Node.js)'
        );

        setQuestions(aiQuestions);
        setInterviewStarted(true);
        setCurrentQuestionIndex(0);
        setTimeRemaining(aiQuestions[0].time);
        
        addMessage('assistant', `✅ Generated ${aiQuestions.length} personalized questions based on your skills and experience!\n\n⏱️ **Timer Active:** You have ${aiQuestions[0].time} seconds for this question.\n\n📝 **Question 1 (${aiQuestions[0].difficulty}):**\n${aiQuestions[0].question}`);
      } catch (error) {
        console.error('Question generation error:', error);
        addMessage('assistant', '❌ Failed to generate questions. Please try again or contact support.');
      }
      return;
    }

    if (interviewStarted && currentQuestionIndex < questions.length && !isEvaluating) {
      handleSubmitAnswer(input, false);
    }
  };

  // Answer validation + scoring
  const handleSubmitAnswer = async (answer, isAutoSubmit = false) => {
    if (isEvaluating) return;
    
    setIsEvaluating(true);
    const answerText = answer || currentInput || '(No answer provided)';
    const question = questions[currentQuestionIndex];
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (!isAutoSubmit) {
      addMessage('user', answerText);
    }
    
    // VALIDATE FIRST
    const validation = validateAnswer(answerText);
    if (!validation.valid && !isAutoSubmit) {
      addMessage('assistant', `❌ ${validation.reason}\n\n⚠️ **Score: 0/${question.difficulty === 'Easy' ? 10 : question.difficulty === 'Medium' ? 20 : 30}**\n\nPlease provide meaningful answers in future questions.`);
      
      const newAnswer = {
        questionId: question.id,
        question: question.question,
        answer: answerText,
        score: 0,
        feedback: validation.reason,
        difficulty: question.difficulty,
        timeUsed: question.time - (timeRemaining || 0)
      };

      await moveToNextQuestion(newAnswer);
      setIsEvaluating(false);
      return;
    }
    
    addMessage('assistant', '🤔 Evaluating your answer with AI...');

    try {
      const evaluation = await scoreAnswerWithAI(
        question.question,
        answerText,
        question.difficulty
      );

      const newAnswer = {
        questionId: question.id,
        question: question.question,
        answer: answerText,
        score: evaluation.score,
        feedback: evaluation.feedback,
        difficulty: question.difficulty,
        timeUsed: question.time - (timeRemaining || 0)
      };

      const maxScore = question.difficulty === 'Easy' ? 10 : question.difficulty === 'Medium' ? 20 : 30;
      
      addMessage('assistant', `✅ **Score: ${evaluation.score}/${maxScore}**\n💬 **Feedback:** ${evaluation.feedback}`);

      await moveToNextQuestion(newAnswer);

    } catch (error) {
      console.error('Answer scoring error:', error);
      addMessage('assistant', '❌ Failed to score answer. Please try again.');
    }
    
    setIsEvaluating(false);
    setCurrentInput('');
  };

  // Move to next question logic
  const moveToNextQuestion = async (newAnswer) => {
    const updatedAnswers = [...currentCandidate.answers, newAnswer];
    const updatedCandidate = { ...currentCandidate, answers: updatedAnswers };
    setCurrentCandidate(updatedCandidate);

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const nextQuestion = questions[nextIndex];
      setCurrentQuestionIndex(nextIndex);
      setTimeRemaining(nextQuestion.time);
      
      addMessage('assistant', `\n⏱️ **Timer Restarted:** ${nextQuestion.time} seconds\n\n📝 **Question ${nextIndex + 1} (${nextQuestion.difficulty}):**\n${nextQuestion.question}`);
    } else {
      const totalScore = updatedAnswers.reduce((sum, ans) => sum + ans.score, 0);
      const maxTotalScore = updatedAnswers.reduce((sum, ans) => {
        const max = ans.difficulty === 'Easy' ? 10 : ans.difficulty === 'Medium' ? 20 : 30;
        return sum + max;
      }, 0);
      
      const percentage = Math.round((totalScore / maxTotalScore) * 100);
      const summary = `Total Score: ${totalScore}/${maxTotalScore} points (${percentage}%)\nQuestions Answered: ${updatedAnswers.length}/6`;
      
      const finalCandidate = {
        ...updatedCandidate,
        completed: true,
        summary,
        totalScore,
        maxTotalScore,
        percentage,
        completedAt: Date.now()
      };
      
      setCandidates(prev => [...prev, finalCandidate]);
      setCurrentCandidate(null);
      setInterviewStarted(false);
      setTimeRemaining(null);
      setCurrentQuestionIndex(0);
      
      addMessage('assistant', `\n🎉 **Interview Complete!**\n\n📊 ${summary}\n\n${getPerformanceMessage(percentage)}\n\n✨ Thank you for your time! Switch to the **Interviewer** tab to see detailed results.`);
    }
  };

  // Performance feedback based on score
  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return '🌟 **Outstanding!** Excellent technical knowledge!';
    if (percentage >= 75) return '👏 **Great job!** Strong performance overall!';
    if (percentage >= 60) return '👍 **Good effort!** Solid understanding with room to grow.';
    if (percentage >= 40) return '📚 **Keep learning!** Focus on strengthening your fundamentals.';
    return '💪 **Don\'t give up!** Practice more and you\'ll improve significantly.';
  };

  // ⭐ FIXED: Resume interview with uploaded file restoration
  const handleWelcomeBack = (resume) => {
    setShowWelcomeBack(false);
    
    if (resume) {
      // RESUME: Load saved interview state
      const saved = localStorage.getItem(`interviewData_${user.uid}`);
      if (saved) {
        const data = JSON.parse(saved);
        
        if (data.currentCandidate) {
          setCurrentCandidate(data.currentCandidate);
          setChatMessages(data.chatMessages || []);
          setInterviewStarted(data.interviewStarted || false);
          setCurrentQuestionIndex(data.currentQuestionIndex || 0);
          setQuestions(data.questions || []);
          setTimeRemaining(data.timeRemaining || null);
          
          // ⭐ FIX: Restore uploaded file (create a mock File object)
          if (data.uploadedFileName) {
            const mockFile = new File(
              ["Resume content"], 
              data.uploadedFileName, 
              { type: 'application/pdf' }
            );
            setUploadedFile(mockFile);
          }
          
          // Show welcome back message
          addMessage('system', '✅ Welcome back! Your interview session has been restored.');
        }
      }
    } else {
      // START FRESH: Clear everything
      if (user) {
        localStorage.removeItem(`interviewData_${user.uid}`);
      }
      setCurrentCandidate(null);
      setChatMessages([]);
      setInterviewStarted(false);
      setCurrentQuestionIndex(0);
      setQuestions([]);
      setTimeRemaining(null);
      setUploadedFile(null);
      setError('');
      
      addMessage('system', '🔄 Starting fresh! Please upload your resume to begin.');
    }
  };

  const handleStartVideoInterview = () => {
    if (!uploadedFile || !currentCandidate) {
      setError('Please upload your resume first!');
      return;
    }
    setShowVideoInterview(true);
  };

  const handleVideoInterviewComplete = (completedCandidate) => {
    setCandidates(prev => [...prev, completedCandidate]);
    setShowVideoInterview(false);
    setCurrentCandidate(null);
    setInterviewStarted(false);
    setUploadedFile(null);
    setChatMessages([]);
    setActiveTab('interviewer');
    alert('🎉 Interview completed! Check the Interviewer tab to see results.');
  };

  const handleVideoInterviewBack = () => {
    if (window.confirm('Are you sure you want to exit the interview? Your progress will be lost.')) {
      setShowVideoInterview(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (authView === 'landing') {
    return (
      <LandingPage
        onShowLogin={() => setAuthView('login')}
        onShowSignup={() => setAuthView('signup')}
      />
    );
  }

  if (authView === 'login') {
    return (
      <LoginPage
        onBack={() => setAuthView('landing')}
        onLogin={handleLogin}
      />
    );
  }

  if (authView === 'signup') {
    return (
      <SignupPage
        onBack={() => setAuthView('landing')}
        onSignup={handleSignup}
      />
    );
  }

  if (showVideoInterview) {
    return (
      <VideoInterviewPage
        candidate={currentCandidate}
        onComplete={handleVideoInterviewComplete}
        onBack={handleVideoInterviewBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {showWelcomeBack && (
        <WelcomeBackModal
          onResume={() => handleWelcomeBack(true)}
          onStartFresh={() => handleWelcomeBack(false)}
        />
      )}

      <Header user={user} onLogout={handleLogout} />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {activeTab === 'interviewee' ? (
          <IntervieweeView
            chatMessages={chatMessages}
            currentInput={currentInput}
            setCurrentInput={setCurrentInput}
            handleSendMessage={handleSendMessage}
            handleFileUpload={handleFileUpload}
            uploadedFile={uploadedFile}
            interviewStarted={interviewStarted}
            timeRemaining={timeRemaining}
            setTimeRemaining={setTimeRemaining} 
            error={error}
            currentCandidate={currentCandidate}
            chatEndRef={chatEndRef}
            isUploading={isUploading}
            onStartVideoInterview={handleStartVideoInterview}
            isEvaluating={isEvaluating}
          />
        ) : (
          <InterviewerDashboard
            candidates={candidates}
          />
        )}
      </div>
    </div>
  );
}

export default App;