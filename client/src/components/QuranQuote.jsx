import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getRandomQuote, getRandomQuoteByCategory } from '../data/quranVirtues';
import { BookOpen, RefreshCw } from 'lucide-react';

/**
 * QuranQuote Component
 * Displays a random Hadith or Quranic verse about the virtues of Quran
 * 
 * Props:
 * - category: (optional) Filter by category like 'memorization', 'reward', etc.
 * - compact: (optional) Show a smaller version
 * - showRefresh: (optional) Show a button to get a new quote
 * - className: (optional) Additional CSS classes
 */
export default function QuranQuote({ 
  category = null, 
  compact = false, 
  showRefresh = false,
  className = '' 
}) {
  const { theme } = useTheme();
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    loadNewQuote();
  }, [category]);

  const loadNewQuote = () => {
    const newQuote = category 
      ? getRandomQuoteByCategory(category) 
      : getRandomQuote();
    setQuote(newQuote);
  };

  if (!quote) return null;

  // Compact version for smaller spaces
  if (compact) {
    return (
      <div className={`${theme.card} rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full ${theme.primary} flex items-center justify-center flex-shrink-0`}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${theme.text} leading-relaxed`}>
              "{quote.english}"
            </p>
            <p className={`text-xs ${theme.textMuted} mt-2`}>
              — {quote.reference}
            </p>
          </div>
          {showRefresh && (
            <button 
              onClick={loadNewQuote}
              className={`p-1 ${theme.textMuted} hover:${theme.text} transition-colors`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full version with Arabic text
  return (
    <div className={`${theme.card} rounded-2xl p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${theme.primary} flex items-center justify-center`}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className={`text-sm font-medium ${theme.textMuted}`}>
            {quote.type === 'quran' ? 'Quran' : 'Hadith'}
          </span>
        </div>
        {showRefresh && (
          <button 
            onClick={loadNewQuote}
            className={`p-2 ${theme.textMuted} hover:${theme.text} transition-colors rounded-full hover:bg-white/10`}
            title="New quote"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Arabic Text */}
      {quote.arabic && (
        <p 
          className={`arabic-text text-xl leading-loose ${theme.text} mb-4 text-center`}
          dir="rtl"
        >
          {quote.arabic}
        </p>
      )}

      {/* English Translation */}
      <p className={`text-sm ${theme.textMuted} leading-relaxed text-center italic`}>
        "{quote.english}"
      </p>

      {/* Reference */}
      <div className={`mt-4 pt-3 border-t ${theme.border} flex items-center justify-center gap-2`}>
        <span className={`text-xs ${theme.textMuted}`}>
          {quote.reference}
        </span>
        {quote.narrator && (
          <span className={`text-xs ${theme.textMuted}`}>
            • Narrated by {quote.narrator}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * QuranQuoteBanner Component
 * A thin banner version for top/bottom of pages
 */
export function QuranQuoteBanner({ category = null, className = '' }) {
  const { theme } = useTheme();
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    const newQuote = category 
      ? getRandomQuoteByCategory(category) 
      : getRandomQuote();
    setQuote(newQuote);
  }, [category]);

  if (!quote) return null;

  return (
    <div className={`${theme.bg} py-3 px-4 ${className}`}>
      <p className={`text-xs ${theme.textMuted} text-center leading-relaxed`}>
        <span className="opacity-70">📖</span>
        {' '}"{quote.english}"{' '}
        <span className="opacity-70">— {quote.reference}</span>
      </p>
    </div>
  );
}

/**
 * QuranQuoteCard Component  
 * A card specifically designed for results pages with encouraging tone
 */
export function QuranQuoteCard({ accuracy = null, className = '' }) {
  const { theme } = useTheme();
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    // Select category based on accuracy if provided
    let selectedCategory = null;
    if (accuracy !== null) {
      if (accuracy >= 90) {
        selectedCategory = 'reward';
      } else if (accuracy >= 70) {
        selectedCategory = 'encouragement';
      } else {
        selectedCategory = 'memorization';
      }
    }
    
    const newQuote = selectedCategory 
      ? getRandomQuoteByCategory(selectedCategory) 
      : getRandomQuote();
    setQuote(newQuote);
  }, [accuracy]);

  if (!quote) return null;

  return (
    <div className={`bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📿</span>
        <span className={`text-sm font-medium ${theme.text}`}>
          {quote.type === 'quran' ? 'From the Quran' : 'Prophet ﷺ said'}
        </span>
      </div>

      {quote.arabic && (
        <p 
          className={`arabic-text text-lg leading-relaxed ${theme.text} mb-3`}
          dir="rtl"
        >
          {quote.arabic}
        </p>
      )}

      <p className={`text-sm ${theme.textMuted} leading-relaxed italic`}>
        "{quote.english}"
      </p>

      <p className={`text-xs ${theme.textMuted} mt-3 opacity-70`}>
        {quote.reference}
        {quote.narrator && ` • ${quote.narrator}`}
      </p>
    </div>
  );
}
