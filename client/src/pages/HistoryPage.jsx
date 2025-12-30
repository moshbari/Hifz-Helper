import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { attemptsApi } from '../services/api';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  ChevronRight,
  Calendar,
  BookOpen,
  Settings,
} from 'lucide-react';

// Bottom nav (shared component - should be extracted)
function BottomNav({ active }) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const tabs = [
    { id: 'home', icon: BookOpen, label: 'Surahs', path: '/' },
    { id: 'history', icon: Clock, label: 'History', path: '/history' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${theme.card} border-t ${theme.border} safe-bottom`}>
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              active === tab.id ? theme.accent : theme.textMuted
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// Attempt card
function AttemptCard({ attempt, onDelete, onClick }) {
  const { theme } = useTheme();
  const isPassed = attempt.status === 'passed' || attempt.accuracy >= 85;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return 'text-emerald-400';
    if (accuracy >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      className={`${theme.card} rounded-xl p-4 transition-colors cursor-pointer ${theme.cardHover}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isPassed ? 'bg-emerald-500/20' : 'bg-yellow-500/20'
          }`}
        >
          {isPassed ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${theme.text}`}>{attempt.surah_name}</h3>
            <span className={`font-bold ${getAccuracyColor(attempt.accuracy)}`}>
              {attempt.accuracy}%
            </span>
          </div>
          <p className={`text-sm ${theme.textMuted}`}>
            Verses {attempt.verse_start}-{attempt.verse_end}
          </p>
          <div className={`flex items-center gap-2 mt-1 text-xs ${theme.textMuted}`}>
            <Calendar className="w-3 h-3" />
            {formatDate(attempt.created_at)}
            {attempt.duration && (
              <>
                <span>•</span>
                <Clock className="w-3 h-3" />
                {Math.floor(attempt.duration / 60)}:{(attempt.duration % 60).toString().padStart(2, '0')}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(attempt.id);
            }}
            className={`p-2 ${theme.textMuted} hover:text-red-400 transition-colors`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <ChevronRight className={`w-5 h-5 ${theme.textMuted}`} />
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const [attemptsRes, statsRes] = await Promise.all([
        attemptsApi.getAttempts(50),
        attemptsApi.getStats(),
      ]);
      setAttempts(attemptsRes.attempts);
      setStats(statsRes.stats);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this attempt?')) return;

    try {
      await attemptsApi.deleteAttempt(id);
      setAttempts((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Failed to delete attempt:', error);
    }
  };

  // Group attempts by date
  const groupedAttempts = attempts.reduce((groups, attempt) => {
    const date = new Date(attempt.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(attempt);
    return groups;
  }, {});

  return (
    <div className={`min-h-screen ${theme.bg} pb-20`}>
      {/* Header */}
      <header className={`${theme.card} px-4 py-6 safe-top`}>
        <div className="max-w-lg mx-auto">
          <h1 className={`text-xl font-bold ${theme.text}`}>Practice History</h1>
          
          {stats && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <p className={`text-2xl font-bold ${theme.text}`}>{stats.totalAttempts}</p>
                <p className={`text-xs ${theme.textMuted}`}>Total</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold text-emerald-400`}>{stats.passedCount}</p>
                <p className={`text-xs ${theme.textMuted}`}>Passed</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${theme.accent}`}>{stats.averageAccuracy}%</p>
                <p className={`text-xs ${theme.textMuted}`}>Avg</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold text-orange-400`}>{stats.streakDays}</p>
                <p className={`text-xs ${theme.textMuted}`}>Streak</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* History List */}
      <main className="px-4 py-6 max-w-lg mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full spinner" />
          </div>
        ) : attempts.length === 0 ? (
          <div className={`text-center py-12 ${theme.textMuted}`}>
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No practice history yet</p>
            <p className="text-sm mt-1">Start practicing to see your progress!</p>
            <button
              onClick={() => navigate('/')}
              className={`mt-4 px-6 py-2 ${theme.primary} text-white rounded-lg`}
            >
              Start Practicing
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedAttempts).map(([date, dateAttempts]) => (
              <div key={date}>
                <h2 className={`text-sm font-medium ${theme.textMuted} mb-3`}>
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>
                <div className="space-y-3">
                  {dateAttempts.map((attempt) => (
                    <AttemptCard
                      key={attempt.id}
                      attempt={attempt}
                      onDelete={handleDelete}
                      onClick={() => setSelectedAttempt(attempt)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Attempt Detail Modal */}
      {selectedAttempt && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setSelectedAttempt(null)}
        >
          <div
            className={`${theme.card} rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto animate-fade-in`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme.text}`}>
                {selectedAttempt.surah_name}
              </h3>
              <span
                className={`text-2xl font-bold ${
                  selectedAttempt.accuracy >= 85 ? 'text-emerald-400' : 'text-yellow-400'
                }`}
              >
                {selectedAttempt.accuracy}%
              </span>
            </div>

            <p className={`text-sm ${theme.textMuted} mb-4`}>
              Verses {selectedAttempt.verse_start}-{selectedAttempt.verse_end}
            </p>

            {selectedAttempt.original_text && (
              <div className="mb-4">
                <p className={`text-sm font-medium ${theme.textMuted} mb-2`}>Original Text</p>
                <div className={`${theme.bg} p-3 rounded-lg arabic-text text-lg`} dir="rtl">
                  {selectedAttempt.original_text}
                </div>
              </div>
            )}

            {selectedAttempt.transcription && (
              <div className="mb-4">
                <p className={`text-sm font-medium ${theme.textMuted} mb-2`}>Your Recitation</p>
                <div className={`${theme.bg} p-3 rounded-lg arabic-text text-lg`} dir="rtl">
                  {selectedAttempt.transcription}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedAttempt(null)}
              className={`w-full py-3 ${theme.primary} text-white rounded-lg mt-4`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <BottomNav active="history" />
    </div>
  );
}
