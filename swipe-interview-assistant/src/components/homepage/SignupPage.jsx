import React, { useState } from 'react';
import { Sparkles, UserPlus } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';

const SignupPage = ({ onBack, onSignup }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, {
        displayName: name
      });

      // Pass user data back to App.jsx
      onSignup({
        uid: user.uid,
        email: user.email,
        name: name,
        photoURL: user.photoURL
      });
    } catch (err) {
      console.error('Signup error:', err);
      
      // Handle specific Firebase errors
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Use at least 6 characters');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password accounts are not enabled');
          break;
        default:
          setError('Failed to create account. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Pass user data back to App.jsx
      onSignup({
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL
      });
    } catch (err) {
      console.error('Google signup error:', err);
      
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError('Sign-up popup was closed');
          break;
        case 'auth/cancelled-popup-request':
          setError('Sign-up was cancelled');
          break;
        case 'auth/account-exists-with-different-credential':
          setError('An account already exists with this email');
          break;
        default:
          setError('Failed to sign up with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-12 h-12 text-yellow-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-300">Start your interview preparation journey</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all disabled:opacity-50"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all disabled:opacity-50"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all disabled:opacity-50"
              placeholder="••••••••"
              minLength={6}
              required
            />
            <p className="text-xs text-gray-400 mt-1">At least 6 characters</p>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all disabled:opacity-50"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/30"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-transparent text-gray-300">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? 'Signing up...' : 'Sign up with Google'}
        </button>

        <button
          onClick={onBack}
          disabled={loading}
          className="w-full mt-4 px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all disabled:opacity-50"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default SignupPage;