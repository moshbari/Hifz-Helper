import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Search, Star, StarOff, ChevronLeft, BookOpen, Heart } from 'lucide-react';
import QuranQuote from '../components/QuranQuote';

// All 114 Surahs
const QURAN_SURAHS = [
  { number: 1, name: 'Al-Fatihah', nameAr: 'الفاتحة', verses: 7, juz: 1 },
  { number: 2, name: 'Al-Baqarah', nameAr: 'البقرة', verses: 286, juz: 1 },
  { number: 3, name: "Ali 'Imran", nameAr: 'آل عمران', verses: 200, juz: 3 },
  { number: 4, name: 'An-Nisa', nameAr: 'النساء', verses: 176, juz: 4 },
  { number: 5, name: "Al-Ma'idah", nameAr: 'المائدة', verses: 120, juz: 6 },
  { number: 36, name: 'Ya-Sin', nameAr: 'يس', verses: 83, juz: 22 },
  { number: 55, name: 'Ar-Rahman', nameAr: 'الرحمن', verses: 78, juz: 27 },
  { number: 67, name: 'Al-Mulk', nameAr: 'الملك', verses: 30, juz: 29 },
  { number: 78, name: 'An-Naba', nameAr: 'النبأ', verses: 40, juz: 30 },
  { number: 112, name: 'Al-Ikhlas', nameAr: 'الإخلاص', verses: 4, juz: 30 },
  { number: 113, name: 'Al-Falaq', nameAr: 'الفلق', verses: 5, juz: 30 },
  { number: 114, name: 'An-Nas', nameAr: 'الناس', verses: 6, juz: 30 },
];

export default function SurahSelectionPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('surah');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('hifz-favorites') || '[]');
    setFavorites(savedFavorites);
  }, []);

  const toggleFavorite = (surahNumber, e) => {
    e.stopPropagation();
    let newFavorites;
    if (favorites.includes(surahNumber)) {
      newFavorites = favorites.filter(n => n !== surahNumber);
    } else {
      newFavorites = [...favorites, surahNumber];
    }
    setFavorites(newFavorites);
    localStorage.setItem('hifz-favorites', JSON.stringify(newFavorites));
  };

  const filteredSurahs = useMemo(() => {
    return QURAN_SURAHS.filter(surah => {
      const matchesSearch = !searchTerm || 
        surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.nameAr.includes(searchTerm) ||
        surah.number.toString() === searchTerm;
      const matchesFavorites = !showFavoritesOnly || favorites.includes(surah.number);
      return matchesSearch && matchesFavorites;
    });
  }, [searchTerm, showFavoritesOnly, favorites]);

  const surahsByJuz = useMemo(() => {
    const grouped = {};
    filteredSurahs.forEach(surah => {
      if (!grouped[surah.juz]) grouped[surah.juz] = [];
      grouped[surah.juz].push(surah);
    });
    return grouped;
  }, [filteredSurahs]);

  return (
    <div className="min-h-screen pb-24">
      <div className="bg-black/20 backdrop-blur-lg px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="text-white/70 hover:text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white font-bold text-lg">Select Surah</h1>
      </div>

      <div className="p-4">
        <QuranQuote variant="compact" className="mb-4" />

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search surah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
          />
        </div>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex bg-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('surah')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${viewMode === 'surah' ? 'bg-white text-gray-800' : 'text-white/60'}`}
            >
              By Surah
            </button>
            <button
              onClick={() => setViewMode('juz')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${viewMode === 'juz' ? 'bg-white text-gray-800' : 'text-white/60'}`}
            >
              By Juz
            </button>
          </div>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-4 rounded-xl border flex items-center gap-2 ${showFavoritesOnly ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-white/10 border-white/20 text-white/60'}`}
          >
            <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {viewMode === 'surah' && (
          <div className="grid grid-cols-3 gap-2">
            {filteredSurahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => navigate(`/practice/${surah.number}`)}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-left hover:bg-white/10 relative group"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-white/40 text-xs">{surah.number}</span>
                  <button onClick={(e) => toggleFavorite(surah.number, e)} className="text-white/30 hover:text-amber-400">
                    {favorites.includes(surah.number) ? (
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ) : (
                      <StarOff className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                    )}
                  </button>
                </div>
                <p className={`${theme.accentText} text-lg`} dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>{surah.nameAr}</p>
                <p className="text-white/60 text-xs truncate">{surah.name}</p>
                <p className="text-white/30 text-xs">{surah.verses} verses</p>
              </button>
            ))}
          </div>
        )}

        {viewMode === 'juz' && (
          <div className="space-y-4">
            {Object.entries(surahsByJuz).map(([juz, surahs]) => (
              <div key={juz}>
                <h2 className="text-white/60 text-sm mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />Juz {juz}
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {surahs.map((surah) => (
                    <button
                      key={surah.number}
                      onClick={() => navigate(`/practice/${surah.number}`)}
                      className="bg-white/5 border border-white/10 rounded-xl p-2 text-left hover:bg-white/10"
                    >
                      <p className={`${theme.accentText} text-base`} dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>{surah.nameAr}</p>
                      <p className="text-white/50 text-xs truncate">{surah.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredSurahs.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No surahs found</p>
          </div>
        )}

        <QuranQuote variant="minimal" className="mt-8" />
      </div>
    </div>
  );
}
