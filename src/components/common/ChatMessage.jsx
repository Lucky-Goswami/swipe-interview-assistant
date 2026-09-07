import React from 'react';
import { Upload } from 'lucide-react';
const ChatMessage = ({ message }) => (
  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
        message.sender === 'user'
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-100 text-gray-800'
      }`}
    >
      {message.type === 'file' ? (
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          <span className="text-sm">{message.content}</span>
        </div>
      ) : (
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
      )}
    </div>
  </div>
);