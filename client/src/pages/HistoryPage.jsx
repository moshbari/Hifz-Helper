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
  Star,
  Award,
} from 'lucide-react';

// Islamic encouraging messages based on accuracy
const getIslamicMessage = (accuracy) => {
  if (accuracy === 100) {
    return {
      title: "MashaAllah! 🌟",
      message: "Perfect recitation! May Allah bless your memorization journey.",
      icon: "🏆"
    };
  } else if (accuracy >= 95) {
    return {
      title: "Excellent! ⭐",
      message: "SubhanAllah! You're so close to perfection. Keep going!",
      icon: "🌟"
    };
  } else if (accuracy >= 90) {
    return {
      title: "Great Job!",
      message: "MashaAllah! Your hard work is showing. A little more practice!",
      icon: "✨"
    };
  } else if (accuracy >= 80) {
    return {
      title: "Well Done!",
      message: "Alhamdulillah! You're making good progress. Keep practicing!",
      icon: "💪"
    };
  } else if (accuracy >= 70) {
    return {
      title: "Good Effort!",
      message: "Every ayah you learn brings you closer to Allah. Keep trying!",
      icon: "📖"
    };
  } else if (accuracy >= 60) {
    return {
      title: "Keep Going!",
      message: "The Prophet ﷺ said: 'The one who struggles with Quran gets double reward.'",
      icon: "🤲"
    };
  } else {
    return {
      title: "Don't Give Up!",
      message: "Allah rewards the effort, not just the result. Try again!",
      icon: "💚"
    };
  }
};

// Bottom nav (shared component)
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
  const isPerfect = attempt.accuracy === 100;
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
    if (accuracy === 100) return 'text-yellow-400';
    if (accuracy >= 90) return 'text-emerald-400';
    if (accuracy >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      className={`${theme.card} rounded-xl p-4 transition-colors cursor-pointer ${theme.cardHover} ${isPerfect ? 'ring-2 ring-yellow-400/50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isPerfect ? 'bg-yellow-500/20' : isPassed ? 'bg-emerald-500/20' : 'bg-yellow-500/20'
          }`}
        >
          {isPerfect ? (
            <Award className="w-5 h-5 text-yellow-400" />
          ) : isPassed ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${theme.text}`}>{attempt.surah_name}</h3>
            <div className="flex items-center gap-1">
              {isPerfect && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
              <span className={`font-bold ${getAccuracyColor(attempt.accuracy)}`}>
                {attempt.accuracy}%
              </span>
            </div>
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

// Attempt Detail Modal
function AttemptDetailModal({ attempt, onClose }) {
  const { theme } = useTheme();
  const islamicMessage = getIslamicMessage(attempt.accuracy);
  const isPerfect = attempt.accuracy === 100;

  const getAccuracyColor = (accuracy) => {
    if (accuracy === 100) return 'text-yellow-400';
    if (accuracy >= 90) return 'text-emerald-400';
    if (accuracy >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Parse errors if stored as string
  let errors = [];
  try {
    if (typeof attempt.errors === 'string') {
      errors = JSON.parse(attempt.errors);
    } else if (Array.isArray(attempt.errors)) {
      errors = attempt.errors;
    }
  } catch (e) {
    errors = [];
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`${theme.card} rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Score */}
        <div className="text-center mb-6">
          <div className={`text-5xl mb-2`}>{islamicMessage.icon}</div>
          <div className={`text-4xl font-bold ${getAccuracyColor(attempt.accuracy)} mb-1`}>
            {attempt.accuracy}%
          </div>
          <h3 className={`text-lg font-semibold ${theme.text}`}>
            {attempt.surah_name}
          </h3>
          <p className={`text-sm ${theme.textMuted}`}>
            Verses {attempt.verse_start}-{attempt.verse_end}
          </p>
        </div>

        {/* Islamic Message */}
        <div className={`${theme.bg} rounded-xl p-4 mb-4 text-center`}>
          <p className={`font-medium ${theme.text} mb-1`}>{islamicMessage.title}</p>
          <p className={`text-sm ${theme.textMuted}`}>{islamicMessage.message}</p>
        </div>

        {/* Perfect Score Celebration */}
        {isPerfect && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4 text-center">
            <p className="text-yellow-400 font-medium">🎉 Perfect Recitation! 🎉</p>
            <p className="text-yellow-400/70 text-sm mt-1">
              You recited every word correctly. MashaAllah!
            </p>
          </div>
        )}

        {/* Original Text */}
        {attempt.original_text && (
          <div className="mb-4">
            <p className={`text-sm font-medium ${theme.textMuted} mb-2`}>Original Text</p>
            <div className={`${theme.bg} p-3 rounded-lg arabic-text text-lg leading-relaxed`} dir="rtl">
              {attempt.original_text}
            </div>
          </div>
        )}

        {/* Your Recitation */}
        {attempt.transcription && (
          <div className="mb-4">
            <p className={`text-sm font-medium ${theme.textMuted} mb-2`}>Your Recitation</p>
            <div className={`${theme.bg} p-3 rounded-lg arabic-text text-lg leading-relaxed`} dir="rtl">
              {attempt.transcription}
            </div>
          </div>
        )}

        {/* Mistakes Section */}
        {errors && errors.length > 0 && (
          <div className="mb-4">
            <p className={`text-sm font-medium ${theme.textMuted} mb-2`}>
              Mistakes to Review ({errors.length})
            </p>
            <div className={`${theme.bg} rounded-lg p-3 space-y-3`}>
              {errors.map((error, idx) => (
                <div key={idx} className={`pb-3 ${idx < errors.length - 1 ? `border-b ${theme.border}` : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-red-400 text-sm">You said:</span>
                    <span className="arabic-text text-red-400" dir="rtl">
                      {error.recited || error.word || '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-sm">Correct:</span>
                    <span className="arabic-text text-emerald-400" dir="rtl">
                      {error.original || error.correct || '—'}
                    </span>
                  </div>
                  {error.suggestion && (
                    <p className={`text-xs ${theme.textMuted} mt-1`}>💡 {error.suggestion}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Mistakes Message */}
        {(!errors || errors.length === 0) && !isPerfect && (
          <div className={`${theme.bg} rounded-lg p-4 mb-4 text-center`}>
            <p className={theme.textMuted}>No specific mistakes recorded.</p>
            <p className={`text-sm ${theme.textMuted} mt-1`}>Keep practicing to improve!</p>
          </div>
        )}

        {/* Encouragement for non-perfect */}
        {!isPerfect && (
          <div className={`text-center ${theme.textMuted} text-sm mb-4`}>
            <p>📿 "Whoever recites the Quran and masters it by heart, will be with the noble righteous scribes in Heaven."</p>
            <p className="text-xs mt-1">— Prophet Muhammad ﷺ</p>
          </div>
        )}

        <button
          onClick={onClose}
          className={`w-full py-3 ${theme.primary} text-white rounded-lg mt-4`}
        >
          Close
        </button>
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

  // Count perfect scores
  const perfectCount = attempts.filter(a => a.accuracy === 100).length;

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
                <p className={`text-2xl font-bold text-yellow-400`}>{perfectCount}</p>
                <p className={`text-xs ${theme.textMuted}`}>Perfect</p>
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
        <AttemptDetailModal 
          attempt={selectedAttempt} 
          onClose={() => setSelectedAttempt(null)} 
        />
      )}

      <BottomNav active="history" />
    </div>
  );
}
