import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Mic, 
  History, 
  Star, 
  CheckCircle, 
  XCircle,
  Settings,
  BookOpen
} from 'lucide-react';
import QuranQuote from '../components/QuranQuote';

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Get user's favorites and recent attempts from localStorage or context
  const favorites = JSON.parse(localStorage.getItem('hifz-favorites') || '[]');
  const history = JSON.parse(localStorage.getItem('hifz-history') || '[]');

  // Sample surah data for bookmarks display
  const SAMPLE_SURAHS = {
    1: { name: 'Al-Fatihah', nameAr: 'الفاتحة' },
    36: { name: 'Ya-Sin', nameAr: 'يس' },
    67: { name: 'Al-Mulk', nameAr: 'الملك' },
    112: { name: 'Al-Ikhlas', nameAr: 'الإخلاص' },
    114: { name: 'An-Nas', nameAr: 'الناس' },
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Main Content */}
      <div className="p-4">
        {/* Greeting */}
        <p className="text-white/60 text-sm">Assalamu Alaikum,</p>
        <h1 className="text-2xl font-bold text-white mb-4">
          {user?.name || 'Student'}
        </h1>

        {/* Daily Quran Quote - Featured on Dashboard */}
        <QuranQuote 
          variant="default" 
          showRefresh={true} 
          className="mb-6"
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/practice')}
            className="bg-emerald-500/20 border border-emerald-500/40 rounded-2xl p-4 text-left hover:bg-emerald-500/30 transition-colors"
          >
            <Mic className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-white font-semibold">New Recitation</p>
            <p className="text-white/50 text-sm">Start practicing</p>
          </button>
          
          <button
            onClick={() => navigate('/history')}
            className="bg-blue-500/20 border border-blue-500/40 rounded-2xl p-4 text-left hover:bg-blue-500/30 transition-colors"
          >
            <History className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-white font-semibold">History</p>
            <p className="text-white/50 text-sm">View attempts</p>
          </button>
        </div>

        {/* Bookmarked Surahs */}
        {favorites.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Bookmarked
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {favorites.slice(0, 5).map((id) => (
                <button
                  key={id}
                  onClick={() => navigate(`/practice/${id}`)}
                  className="flex-shrink-0 bg-white/10 border border-white/20 rounded-xl px-4 py-3 hover:bg-white/20 transition-colors"
                >
                  <p 
                    className={`${theme.accentText} text-lg`} 
                    dir="rtl"
                    style={{ fontFamily: "'Amiri', serif" }}
                  >
                    {SAMPLE_SURAHS[id]?.nameAr || `سورة ${id}`}
                  </p>
                  <p className="text-white/60 text-xs">
                    {SAMPLE_SURAHS[id]?.name || `Surah ${id}`}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Attempts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Recent Attempts</h2>
            {history.length > 0 && (
              <button
                onClick={() => navigate('/history')}
                className="text-white/50 text-sm hover:text-white/70 transition-colors"
              >
                View All
              </button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="space-y-2">
              {history.slice(0, 3).map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {entry.status === 'passed' || entry.status === 'approved' ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                    <div>
                      <p className="text-white font-medium">{entry.surahName}</p>
                      <p className="text-white/40 text-xs">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    entry.status === 'passed' || entry.status === 'approved' 
                      ? 'text-emerald-400' 
                      : 'text-red-400'
                  }`}>
                    {entry.score}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-2" />
              <p className="text-white/40">No recitations yet</p>
              <p className="text-white/30 text-sm">Start practicing to see your progress</p>
            </div>
          )}
        </div>

        {/* Inspirational Footer Quote */}
        <QuranQuote 
          variant="compact" 
          className="mt-8"
        />
      </div>
    </div>
  );
}
