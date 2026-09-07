import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Sparkles } from 'lucide-react';

export const WelcomeScreen = ({ onFileUpload, fileInputRef }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const fileType = file.name.split('.').pop().toLowerCase();
      if (['pdf', 'docx'].includes(fileType)) {
        const syntheticEvent = {
          target: { files: [file] }
        };
        onFileUpload(syntheticEvent);
      }
    }
  };

  return (
    <div className="h-full py-4 px-4 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-5 left-10 w-48 h-48 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-10 right-10 w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-5 left-1/2 w-48 h-48 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full mx-auto h-full flex flex-col justify-start pt-8">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center mb-1">
            <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Your AI Interview
            </span>
          </h1>
          <p className="text-sm text-gray-600">
            Let's get started on your journey to success
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative bg-white rounded-2xl shadow-xl p-6 mb-3 transition-all duration-300 ${
            isDragging ? 'border-4 border-indigo-500 scale-105 bg-indigo-50 shadow-2xl' : 'border-2 border-dashed border-gray-300'
          }`}
        >
          {/* Upload Icon */}
          <div className="flex justify-center mb-3">
            <div className={`relative transition-transform duration-500 ${isDragging ? 'scale-110 rotate-12' : ''}`}>
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-full">
                <Upload className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Main Text */}
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              {isDragging ? 'Drop your resume here!' : 'Upload Your Resume'}
            </h2>
            <p className="text-gray-600 mb-1 text-sm">
              Drag and drop your file here, or click the button below
            </p>
            <p className="text-xs text-gray-500">
              We'll analyze your experience and create personalized questions
            </p>
          </div>

          {/* Upload Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2">
                <FileText className={`w-4 h-4 transition-transform duration-300 ${isHovering ? 'rotate-12' : ''}`} />
                Choose File
              </div>
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={onFileUpload}
            className="hidden"
          />

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
            <div className="text-center group cursor-pointer transform transition-transform hover:scale-110">
              <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 group-hover:bg-green-200 transition-colors">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs font-medium text-gray-700">PDF</p>
            </div>
            <div className="text-center group cursor-pointer transform transition-transform hover:scale-110">
              <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 group-hover:bg-blue-200 transition-colors">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs font-medium text-gray-700">DOCX</p>
            </div>
            <div className="text-center group cursor-pointer transform transition-transform hover:scale-110">
              <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 group-hover:bg-purple-200 transition-colors">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs font-medium text-gray-700">AI Powered</p>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center px-4">
          <p className="text-xs text-gray-600 mb-0.5 font-medium">
            🔒 Your data is secure and processed locally
          </p>
          <p className="text-xs text-gray-500">
            Supported: PDF, DOCX • Max: 10MB
          </p>
        </div>
      </div>
    </div>
  );
}