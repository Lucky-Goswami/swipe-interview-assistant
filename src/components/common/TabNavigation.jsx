import React from 'react';

export const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('interviewee')}
            className={`px-6 py-4 font-medium border-b-2 transition ${
              activeTab === 'interviewee'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Interviewee
          </button>
          <button
            onClick={() => setActiveTab('interviewer')}
            className={`px-6 py-4 font-medium border-b-2 transition ${
              activeTab === 'interviewer'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Interviewer
          </button>
        </div>
      </div>
    </div>
  );
};