import React from 'react';
import { Upload } from 'lucide-react';

export const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-indigo-600 text-white'
            : message.type === 'file'
            ? 'bg-gray-100 border-2 border-gray-300 text-gray-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {message.type === 'file' ? (
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span className="font-medium">{message.content}</span>
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        )}
        <div
          className={`text-xs mt-1 ${
            isUser ? 'text-indigo-200' : 'text-gray-500'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};