import React from 'react';

export const Timer = ({ timeRemaining }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining <= 10;

  return (
    <div
      className={`mb-3 p-3 rounded-lg flex items-center justify-center gap-2 font-mono text-lg font-bold ${
        isLowTime
          ? 'bg-red-100 text-red-700 animate-pulse'
          : 'bg-blue-50 text-blue-700'
      }`}
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
          clipRule="evenodd"
        />
      </svg>
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {isLowTime && <span className="text-sm font-normal ml-2">Hurry up!</span>}
    </div>
  );
};