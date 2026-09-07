import React from 'react';
import { ChatMessage } from './ChatMessage';

export const ChatArea = ({ messages, chatEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} message={msg} />
      ))}
      <div ref={chatEndRef} />
    </div>
  );
};