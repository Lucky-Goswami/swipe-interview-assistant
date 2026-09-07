import React from 'react';
import { PlayCircle, RotateCcw } from 'lucide-react';

export const WelcomeBackModal = ({ onResume, onStartFresh }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlayCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back! 👋
          </h2>
          <p className="text-gray-600">
            We found your previous interview session. Would you like to continue where you left off?
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
          >
            <PlayCircle className="w-5 h-5" />
            Resume Interview
          </button>

          <button
            onClick={onStartFresh}
            className="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-3"
          >
            <RotateCcw className="w-5 h-5" />
            Start Fresh Interview
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Starting fresh will clear your previous progress
        </p>
      </div>
    </div>
  );
};