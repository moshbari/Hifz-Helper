import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getRandomQuote } from '../data/quranVirtues';
import { BookOpen, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    // Load a random quote
    setQuote(getRandomQuote());
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col`}>
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className={`w-20 h-20 ${theme.primary} rounded-2xl flex items-center justify-center mb-6`}>
          <BookOpen className="w-10 h-10 text-white" />
        </div>

        <h1 className={`text-2xl font-bold ${theme.text} mb-2`}>Hifz Helper</h1>
        <p className={`${theme.textMuted} mb-8 text-center`}>
          Your companion for Quran memorization
        </p>

        {/* Quran Quote */}
        {quote && (
          <div className={`${theme.card} rounded-xl p-4 mb-8 max-w-sm w-full`}>
            <p className={`text-sm ${theme.textMuted} text-center italic leading-relaxed`}>
              "{quote.english}"
            </p>
            <p className={`text-xs ${theme.textMuted} text-center mt-2 opacity-70`}>
              — {quote.reference}
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
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
                className={`w-full pl-10 pr-4 py-3 ${theme.card} ${theme.text} ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm ${theme.textMuted} mb-1`}>Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 ${theme.card} ${theme.text} ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 ${theme.primary} text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 spinner" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Sign up link */}
        <p className={`mt-6 ${theme.textMuted}`}>
          Don't have an account?{' '}
          <Link to="/register" className={theme.accent}>
            Sign up
          </Link>
        </p>
      </div>

      {/* Footer Quote */}
      <div className={`px-6 py-4 text-center ${theme.textMuted}`}>
        <p className="text-xs">
          📖 "The best among you are those who learn the Quran and teach it."
        </p>
        <p className="text-xs opacity-70 mt-1">— Sahih Bukhari</p>
      </div>
    </div>
  );
}
