import React from 'react';
import { Upload, Send, AlertCircle } from 'lucide-react';
import { Timer } from '../common/Timer';

export const InputArea = ({
  currentInput,
  setCurrentInput,
  onSendMessage,
  onFileUpload,
  fileInputRef,
  uploadedFile,
  interviewStarted,
  timeRemaining,
  error,
  isCompleted
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      {interviewStarted && timeRemaining !== null && (
        <Timer timeRemaining={timeRemaining} />
      )}

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!isCompleted && (
        <div className="flex gap-2">
          {!uploadedFile && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                title="Upload Resume"
              >
                <Upload className="w-5 h-5 text-gray-600" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={onFileUpload}
                className="hidden"
              />
            </>
          )}
          
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              !uploadedFile
                ? 'Upload your resume to get started...'
                : 'Type your answer...'
            }
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={!uploadedFile || (interviewStarted && timeRemaining === 0)}
          />
          
          <button
            onClick={onSendMessage}
            disabled={!currentInput.trim() || !uploadedFile}
            className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
            title="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};