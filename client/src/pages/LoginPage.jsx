import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BookOpen, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError('');
    try {
      const demoEmail = role === 'teacher' ? 'teacher@quran.app' : 'student@quran.app';
      await login(demoEmail, 'demo123');
      navigate('/');
    } catch (err) {
      setError('Demo login failed. Server may not be running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center p-4`}>
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className={`w-16 h-16 ${theme.primary} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className={`text-2xl font-bold ${theme.text}`}>Hifz Helper</h1>
        <p className={`${theme.textMuted} mt-1`}>Quran Memorization Assistant</p>
      </div>

      {/* Form Card */}
      <div className={`w-full max-w-md ${theme.card} rounded-2xl p-6 shadow-xl`}>
        <h2 className={`text-xl font-semibold ${theme.text} mb-6`}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className={`block text-sm ${theme.textMuted} mb-1`}>Name</label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={`w-full pl-10 pr-4 py-3 ${theme.bg} ${theme.text} ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
          )}

          <div>
            <label className={`block text-sm ${theme.textMuted} mb-1`}>Email</label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-3 ${theme.bg} ${theme.text} ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm ${theme.textMuted} mb-1`}>Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 ${theme.bg} ${theme.text} ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 ${theme.primary} ${theme.primaryHover} text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 spinner" />
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className={`${theme.accent} hover:underline text-sm`}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Demo Accounts */}
        <div className={`mt-6 pt-6 border-t ${theme.border}`}>
          <p className={`text-sm ${theme.textMuted} text-center mb-3`}>Quick Demo Access</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleDemoLogin('student')}
              disabled={loading}
              className={`flex-1 py-2 ${theme.card} ${theme.cardHover} ${theme.border} border rounded-lg text-sm transition-colors`}
            >
              Student Demo
            </button>
            <button
              onClick={() => handleDemoLogin('teacher')}
              disabled={loading}
              className={`flex-1 py-2 ${theme.card} ${theme.cardHover} ${theme.border} border rounded-lg text-sm transition-colors`}
            >
              Teacher Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
