import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getRandomQuote } from '../data/quranVirtues';
import { BookOpen, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { register, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    setQuote(getRandomQuote());
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col`}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className={`w-20 h-20 ${theme.primary} rounded-2xl flex items-center justify-center mb-6`}>
          <BookOpen className="w-10 h-10 text-white" />
        </div>

        <h1 className={`text-2xl font-bold ${theme.text} mb-2`}>Join Hifz Helper</h1>
        <p className={`${theme.textMuted} mb-6 text-center`}>
          Start your Quran memorization journey
        </p>

        {/* Quran Quote */}
        {quote && (
          <div className={`${theme.card} rounded-xl p-4 mb-6 max-w-sm w-full`}>
            <p className={`text-sm ${theme.textMuted} text-center italic leading-relaxed`}>
              "{quote.english}"
            </p>
            <p className={`text-xs ${theme.textMuted} text-center mt-2 opacity-70`}>
              — {quote.reference}
            </p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className={`block text-sm ${theme.textMuted} mb-1`}>Name</label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 ${theme.card} ${theme.text} ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Your name"
                required
              />
            </div>
          </div>

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
                minLength={6}
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

          <div>
            <label className={`block text-sm ${theme.textMuted} mb-1`}>Confirm Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 ${theme.card} ${theme.text} ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="••••••••"
                required
              />
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
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className={`mt-6 ${theme.textMuted}`}>
          Already have an account?{' '}
          <Link to="/login" className={theme.accent}>
            Sign in
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className={`px-6 py-4 text-center ${theme.textMuted}`}>
        <p className="text-xs">
          🤲 "Whoever recites the Quran and acts upon it, his parents will be crowned with light on the Day of Resurrection."
        </p>
        <p className="text-xs opacity-70 mt-1">— Abu Dawud</p>
      </div>
    </div>
  );
}
