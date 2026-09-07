import React, { useState } from 'react';
import { Sparkles, Zap, Target, TrendingUp, Menu, X } from 'lucide-react';

const LandingPage = ({ onShowLogin, onShowSignup }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-y-auto">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold">InterviewAI</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onShowLogin}
              className="px-6 py-2 rounded-lg font-semibold hover:bg-white/10 transition-all"
            >
              Login
            </button>
            <button
              onClick={onShowSignup}
              className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-semibold hover:scale-105 transition-all shadow-lg"
            >
              Sign Up Free
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-purple-900/95 backdrop-blur-lg p-6 space-y-3">
            <button
              onClick={onShowLogin}
              className="w-full px-6 py-2 rounded-lg font-semibold hover:bg-white/10 transition-all text-left"
            >
              Login
            </button>
            <button
              onClick={onShowSignup}
              className="w-full px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-semibold hover:scale-105 transition-all shadow-lg"
            >
              Sign Up Free
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 text-center">
        <div className="mb-6 inline-block">
          <span className="px-4 py-2 bg-yellow-400/20 text-yellow-300 rounded-full text-sm font-semibold">
            🚀 AI-Powered Interview Practice
          </span>
        </div>
        
        <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
          Master Your Next
          <br />
          <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
            Job Interview
          </span>
        </h1>
        
        <p className="text-lg md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Get personalized AI interview questions based on your resume. Practice, improve, and land your dream job.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onShowSignup}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Start Practicing Free
          </button>
          <button
            onClick={onShowLogin}
            className="px-8 py-4 bg-white/10 backdrop-blur-lg rounded-xl font-bold text-lg hover:bg-white/20 transition-all border border-white/20"
          >
            Already have an account?
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid md:grid-cols-3 gap-6 pb-20">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
            <Zap className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
          <p className="text-gray-300 text-sm">Upload your resume and get instant personalized interview questions tailored to your experience.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all">
          <div className="bg-gradient-to-br from-green-500 to-teal-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
            <Target className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-2">Targeted Practice</h3>
          <p className="text-gray-300 text-sm">Practice with questions specific to your role, industry, and experience level.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all">
          <div className="bg-gradient-to-br from-orange-500 to-pink-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-2">Track Progress</h3>
          <p className="text-gray-300 text-sm">Monitor your improvement and build confidence for your next big interview.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;