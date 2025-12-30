import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { quranApi, attemptsApi } from '../services/api';
import {
  BookOpen,
  Search,
  Heart,
  Clock,
  Settings,
  ChevronRight,
  Flame,
  Target,
  TrendingUp,
  LogOut,
} from 'lucide-react';

// Navigation bar component
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

// Stats card
function StatsCard({ icon: Icon, label, value, color }) {
  const { theme } = useTheme();

  return (
    <div className={`${theme.card} rounded-xl p-4`}>
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-2`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className={`text-2xl font-bold ${theme.text}`}>{value}</p>
      <p className={`text-sm ${theme.textMuted}`}>{label}</p>
    </div>
  );
}

// Surah card
function SurahCard({ surah, isFavorite, onToggleFavorite, onClick }) {
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`w-full ${theme.card} ${theme.cardHover} rounded-xl p-4 flex items-center gap-4 transition-colors text-left`}
    >
      <div className={`w-12 h-12 ${theme.primary} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <span className="text-white font-semibold">{surah.number}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold ${theme.text} truncate`}>{surah.name}</h3>
          <span className={`text-lg ${theme.textMuted}`} dir="rtl">{surah.nameAr}</span>
        </div>
        <p className={`text-sm ${theme.textMuted}`}>
          {surah.versesCount} verses • {surah.revelationType}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(surah.number);
        }}
        className="p-2"
      >
        <Heart
          className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : theme.textMuted}`}
        />
      </button>
      <ChevronRight className={`w-5 h-5 ${theme.textMuted}`} />
    </button>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [surahs, setSurahs] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('hifz-favorites');
    return saved ? JSON.parse(saved) : [1, 112, 113, 114];
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('hifz-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const loadData = async () => {
    try {
      const [surahsRes, statsRes] = await Promise.all([
        quranApi.getSurahs(),
        attemptsApi.getStats().catch(() => ({ stats: null })),
      ]);
      setSurahs(surahsRes.surahs);
      setStats(statsRes.stats);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (surahNumber) => {
    setFavorites((prev) =>
      prev.includes(surahNumber)
        ? prev.filter((n) => n !== surahNumber)
        : [...prev, surahNumber]
    );
  };

  const filteredSurahs = surahs.filter((surah) => {
    if (showFavoritesOnly && !favorites.includes(surah.number)) {
      return false;
    }
    if (search) {
      const query = search.toLowerCase();
      return (
        surah.name.toLowerCase().includes(query) ||
        surah.nameAr.includes(search) ||
        surah.number.toString() === search
      );
    }
    return true;
  });

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student';

  return (
    <div className={`min-h-screen ${theme.bg} pb-20`}>
      {/* Header */}
      <header className={`${theme.card} px-4 py-6 safe-top`}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`${theme.textMuted} text-sm`}>Assalamu Alaikum,</p>
              <h1 className={`text-xl font-bold ${theme.text}`}>{userName}</h1>
            </div>
            <button
              onClick={logout}
              className={`p-2 ${theme.textMuted} hover:${theme.text} transition-colors`}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              <StatsCard
                icon={Flame}
                label="Streak"
                value={`${stats.streakDays}d`}
                color="bg-orange-500"
              />
              <StatsCard
                icon={Target}
                label="Accuracy"
                value={`${stats.averageAccuracy}%`}
                color="bg-emerald-500"
              />
              <StatsCard
                icon={TrendingUp}
                label="Total"
                value={stats.totalAttempts}
                color="bg-blue-500"
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Search */}
        <div className="relative mb-4">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search surahs..."
            className={`w-full pl-10 pr-4 py-3 ${theme.card} ${theme.text} ${theme.border} border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowFavoritesOnly(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !showFavoritesOnly
                ? `${theme.primary} text-white`
                : `${theme.card} ${theme.text}`
            }`}
          >
            All Surahs
          </button>
          <button
            onClick={() => setShowFavoritesOnly(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              showFavoritesOnly
                ? `${theme.primary} text-white`
                : `${theme.card} ${theme.text}`
            }`}
          >
            <Heart className="w-4 h-4" />
            Favorites
          </button>
        </div>

        {/* Surah List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full spinner" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSurahs.map((surah) => (
              <SurahCard
                key={surah.number}
                surah={surah}
                isFavorite={favorites.includes(surah.number)}
                onToggleFavorite={toggleFavorite}
                onClick={() => navigate(`/practice/${surah.number}`)}
              />
            ))}

            {filteredSurahs.length === 0 && (
              <div className={`text-center py-12 ${theme.textMuted}`}>
                {showFavoritesOnly
                  ? 'No favorites yet. Tap the heart icon to add some!'
                  : 'No surahs found'}
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav active="home" />
    </div>
  );
}
