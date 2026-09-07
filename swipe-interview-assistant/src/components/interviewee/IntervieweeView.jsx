import React, { useRef, useEffect } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { ChatArea } from './ChatArea';
import { InputArea } from './InputArea';

export const IntervieweeView = ({
  chatMessages,
  currentInput,
  setCurrentInput,
  handleSendMessage,
  handleFileUpload,
  uploadedFile,
  interviewStarted,
  timeRemaining,
  setTimeRemaining, // ⭐ NEW - Need this to update timer
  error,
  currentCandidate,
  chatEndRef,
  isUploading,
  onStartVideoInterview,
  isEvaluating
}) => {
  const fileInputRef = useRef(null);
  const timerIntervalRef = useRef(null);
  
  // ⭐ CRITICAL: Working Timer Logic
  useEffect(() => {
    // Clear any existing timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    // Only start timer if interview started and time is set
    if (interviewStarted && timeRemaining !== null && timeRemaining > 0 && !isEvaluating) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Timer hit zero - auto submit
            clearInterval(timerIntervalRef.current);
            
            // Auto-submit current answer (even if empty)
            if (currentInput.trim()) {
              handleSendMessage();
            } else {
              // Submit placeholder for empty answer
              handleSendMessage('⏰ Time expired - no answer submitted');
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000); // Update every second
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [interviewStarted, timeRemaining, isEvaluating]); // Don't include handleSendMessage to avoid re-renders

  // ⭐ Format time as MM:SS
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ⭐ Get timer styling based on remaining time
  const getTimerStyle = () => {
    if (timeRemaining === null) return { color: 'text-gray-600', bg: 'bg-gray-100' };
    if (timeRemaining <= 10) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300' };
    if (timeRemaining <= 30) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-300' };
    return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-300' };
  };

  const timerStyle = getTimerStyle();
  
  // Show WelcomeScreen when there are no messages AND no file uploaded
  const showWelcomeScreen = chatMessages.length === 0 && !uploadedFile && !currentCandidate;
  
  return (
    <div className="mt-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header - Only show when NOT on welcome screen */}
        {!showWelcomeScreen && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Interview Session</h2>
            <p className="text-indigo-100 text-sm">
              {!uploadedFile
                ? 'Upload your resume to begin'
                : interviewStarted
                ? 'Answer the questions to complete your interview'
                : 'Ready to start your interview'}
            </p>
            
            {/* ⭐ WORKING TIMER - Show in header when interview started */}
            {interviewStarted && timeRemaining !== null && (
              <div className={`mt-3 ${timerStyle.bg} backdrop-blur-sm rounded-lg px-4 py-3 border-2 ${timerStyle.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-3xl font-bold ${timerStyle.color} ${timeRemaining <= 10 ? 'animate-pulse' : ''}`}>
                      {formatTime(timeRemaining)}
                    </span>
                    <div className="text-sm text-gray-700 font-medium">
                      {timeRemaining <= 10 ? '⚠️ Hurry up!' : timeRemaining <= 30 ? '⏰ Time running low' : '⏱️ Time remaining'}
                    </div>
                  </div>
                  {timeRemaining <= 10 && (
                    <div className="text-red-600 font-bold text-sm animate-bounce">
                      ⚡ Auto-submit at 0:00!
                    </div>
                  )}
                </div>
                
                {/* ⭐ Visual Progress Bar */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      timeRemaining <= 10 ? 'bg-red-500' : 
                      timeRemaining <= 30 ? 'bg-orange-500' : 
                      'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.max(0, (timeRemaining / 120) * 100)}%` // Assuming max 120 seconds
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Main Content Area */}
        <div className={showWelcomeScreen ? 'h-[600px]' : 'h-[600px] flex flex-col overflow-hidden'}>
          {showWelcomeScreen ? (
            <WelcomeScreen
              onFileUpload={handleFileUpload}
              fileInputRef={fileInputRef}
            />
          ) : (
            <>
              {/* Error Display */}
              {error && (
                <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  ⚠️ {error}
                </div>
              )}
              
              {/* ⭐ Timer Warning Banner - Shows when time < 30 seconds */}
              {interviewStarted && timeRemaining !== null && timeRemaining <= 30 && timeRemaining > 0 && (
                <div className={`mx-6 mt-4 p-3 rounded-lg border-2 ${
                  timeRemaining <= 10 ? 'bg-red-100 border-red-400' : 'bg-orange-100 border-orange-400'
                }`}>
                  <div className="flex items-center justify-center gap-2 text-sm font-bold">
                    <span className={timeRemaining <= 10 ? 'text-red-700' : 'text-orange-700'}>
                      {timeRemaining <= 10 ? '🚨 LAST 10 SECONDS!' : '⚠️ 30 seconds remaining!'}
                    </span>
                    <span className={`${timeRemaining <= 10 ? 'text-red-600 animate-pulse' : 'text-orange-600'} text-lg`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Chat Area */}
              <ChatArea
                messages={chatMessages}
                chatEndRef={chatEndRef}
                isUploading={isUploading}
                isEvaluating={isEvaluating}
              />

              {/* ⭐ Video Interview Button */}
              {uploadedFile && !interviewStarted && currentCandidate && onStartVideoInterview && (
                <div className="mx-6 mb-4">
                  <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-indigo-200 rounded-xl">
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        🎥 Ready for Video Interview?
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Start a professional video interview with AI-powered questions,
                        voice recognition, and real-time feedback!
                      </p>
                      <button
                        onClick={onStartVideoInterview}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition transform hover:scale-105 font-bold text-lg shadow-lg flex items-center gap-3 mx-auto"
                      >
                        <svg 
                          className="w-6 h-6" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                          />
                        </svg>
                        Start Video Interview
                      </button>
                      <p className="text-xs text-gray-500 mt-3">
                        Or type "start" below for text-based interview
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Input Area */}
              <InputArea
                currentInput={currentInput}
                setCurrentInput={setCurrentInput}
                onSendMessage={handleSendMessage}
                onFileUpload={handleFileUpload}
                fileInputRef={fileInputRef}
                uploadedFile={uploadedFile}
                interviewStarted={interviewStarted}
                timeRemaining={timeRemaining}
                error={error}
                currentCandidate={currentCandidate}
                isCompleted={currentCandidate?.completed}
                isEvaluating={isEvaluating}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};