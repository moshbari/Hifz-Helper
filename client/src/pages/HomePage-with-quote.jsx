import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { quranApi } from '../services/api';
import QuranQuote from '../components/QuranQuote';
import {
  Search,
  Star,
  BookOpen,
  Clock,
  Settings,
  ChevronRight,
  LogOut,
} from 'lucide-react';

// Bottom navigation
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

// Surah card component
function SurahCard({ surah, onSelect, isFavorite, onToggleFavorite }) {
  const { theme } = useTheme();

  return (
    <div
      className={`${theme.card} ${theme.cardHover} rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-colors`}
      onClick={() => onSelect(surah.number)}
    >
      {/* Surah Number */}
      <div className={`w-10 h-10 ${theme.primary} rounded-lg flex items-center justify-center`}>
        <span className="text-white font-semibold text-sm">{surah.number}</span>
      </div>

      {/* Surah Info */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold ${theme.text}`}>{surah.name}</h3>
        <p className={`text-sm ${theme.textMuted}`}>
          {surah.versesCount} verses • {surah.revelationType}
        </p>
      </div>

      {/* Arabic Name */}
      <span className={`text-xl ${theme.textMuted}`} dir="rtl">
        {surah.nameAr}
      </span>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(surah.number);
        }}
        className={`p-2 transition-colors ${isFavorite ? 'text-yellow-400' : theme.textMuted}`}
      >
        <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-400' : ''}`} />
      </button>

      <ChevronRight className={`w-5 h-5 ${theme.textMuted}`} />
    </div>
  );
}

export default function HomePage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [surahs, setSurahs] = useState([]);
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurahs();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterSurahs();
  }, [searchQuery, surahs, favorites, showFavoritesOnly]);

  const loadSurahs = async () => {
    try {
      const { surahs } = await quranApi.getAllSurahs();
      setSurahs(surahs);
      setFilteredSurahs(surahs);
    } catch (error) {
      console.error('Failed to load surahs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('hifz-favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const saveFavorites = (newFavorites) => {
    localStorage.setItem('hifz-favorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const toggleFavorite = (surahNumber) => {
    const newFavorites = favorites.includes(surahNumber)
      ? favorites.filter((n) => n !== surahNumber)
      : [...favorites, surahNumber];
    saveFavorites(newFavorites);
  };

  const filterSurahs = () => {
    let result = surahs;

    if (showFavoritesOnly) {
      result = result.filter((s) => favorites.includes(s.number));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.nameAr.includes(query) ||
          s.number.toString() === query
      );
    }

    setFilteredSurahs(result);
  };

  const handleSelectSurah = (surahNumber) => {
    navigate(`/practice/${surahNumber}`);
  };

  return (
    <div className={`min-h-screen ${theme.bg} pb-20`}>
      {/* Header */}
      <header className={`${theme.card} px-4 py-6 safe-top`}>
        <div className="max-w-lg mx-auto">
          {/* Welcome */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-sm ${theme.textMuted}`}>Assalamu Alaikum</p>
              <h1 className={`text-xl font-bold ${theme.text}`}>
                {user?.user_metadata?.name || 'Student'}
              </h1>
            </div>
            <div className={`w-10 h-10 ${theme.primary} rounded-full flex items-center justify-center`}>
              <span className="text-white font-semibold">
                {(user?.user_metadata?.name || 'S')[0].toUpperCase()}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
            <input
              type="text"
              placeholder="Search surah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 ${theme.bg} ${theme.text} ${theme.border} border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowFavoritesOnly(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                !showFavoritesOnly
                  ? `${theme.primary} text-white`
                  : `${theme.bg} ${theme.text}`
              }`}
            >
              All Surahs
            </button>
            <button
              onClick={() => setShowFavoritesOnly(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                showFavoritesOnly
                  ? `${theme.primary} text-white`
                  : `${theme.bg} ${theme.text}`
              }`}
            >
              <Star className="w-4 h-4" />
              Favorites ({favorites.length})
            </button>
          </div>
        </div>
      </header>

      {/* Quran Quote */}
      <div className="px-4 pt-4 max-w-lg mx-auto">
        <QuranQuote compact showRefresh className="mb-4" />
      </div>

      {/* Surah List */}
      <main className="px-4 py-2 max-w-lg mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full spinner" />
          </div>
        ) : filteredSurahs.length === 0 ? (
          <div className={`text-center py-12 ${theme.textMuted}`}>
            <p>No surahs found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSurahs.map((surah) => (
              <SurahCard
                key={surah.number}
                surah={surah}
                onSelect={handleSelectSurah}
                isFavorite={favorites.includes(surah.number)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav active="home" />
    </div>
  );
}
