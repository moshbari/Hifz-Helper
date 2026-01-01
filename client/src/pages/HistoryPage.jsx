import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  CheckCircle, 
  XCircle, 
  Trash2,
  Download,
  Filter,
  ChevronLeft,
  BookOpen,
  Search
} from 'lucide-react';
import QuranQuote from '../components/QuranQuote';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'passed', 'failed'
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('hifz-history') || '[]');
    setHistory(savedHistory);
  }, []);

  const filteredHistory = history.filter(entry => {
    const matchesFilter = filter === 'all' 
      || (filter === 'passed' && (entry.status === 'passed' || entry.status === 'approved'))
      || (filter === 'failed' && (entry.status === 'failed' || entry.status === 'rejected'));
    
    const matchesSearch = !searchTerm || 
      entry.surahName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const deleteEntry = (id) => {
    const newHistory = history.filter(entry => entry.id !== id);
    setHistory(newHistory);
    localStorage.setItem('hifz-history', JSON.stringify(newHistory));
    setShowDeleteConfirm(null);
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.setItem('hifz-history', JSON.stringify([]));
  };

  const exportHistory = () => {
    const content = history.map(h => 
      `${h.surahName} | ${new Date(h.date).toLocaleDateString()} | ${h.status} | ${h.score}%`
    ).join('\n');

    const blob = new Blob([
      'HIFZ HELPER - HISTORY\n',
      '=====================\n\n',
      `Date Exported: ${new Date().toLocaleDateString()}\n\n`,
      'Surah | Date | Status | Score\n',
      '------------------------------\n',
      content,
      `\n\n------------------------------\n`,
      `Total Attempts: ${history.length}\n`,
      `Passed: ${history.filter(h => h.status === 'passed' || h.status === 'approved').length}\n`,
      `Average Score: ${Math.round(history.reduce((sum, h) => sum + (h.score || 0), 0) / history.length || 0)}%`
    ], { type: 'text/plain' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `hifz-history-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  // Calculate stats
  const totalAttempts = history.length;
  const passedAttempts = history.filter(h => h.status === 'passed' || h.status === 'approved').length;
  const avgScore = totalAttempts > 0 
    ? Math.round(history.reduce((sum, h) => sum + (h.score || 0), 0) / totalAttempts)
    : 0;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-lg">Practice History</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={exportHistory}
            disabled={history.length === 0}
            className="p-2 text-white/70 hover:text-white transition-colors disabled:opacity-30"
            title="Export history"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Inspirational Quote */}
        <QuranQuote 
          variant="compact" 
          className="mb-4"
        />

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{totalAttempts}</p>
            <p className="text-white/50 text-xs">Total</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{passedAttempts}</p>
            <p className="text-emerald-400/60 text-xs">Passed</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{avgScore}%</p>
            <p className="text-blue-400/60 text-xs">Avg Score</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search surah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/40"
            />
          </div>
          <div className="flex bg-white/10 rounded-xl p-1">
            {['all', 'passed', 'failed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f 
                    ? 'bg-white text-gray-800' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length > 0 ? (
          <div className="space-y-2">
            {filteredHistory.map((entry) => (
              <div
                key={entry.id}
                className="bg-white/5 border border-white/10 rounded-xl p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {entry.status === 'passed' || entry.status === 'approved' ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                    <div>
                      <p className="text-white font-medium">{entry.surahName}</p>
                      <p className="text-white/40 text-xs">
                        {new Date(entry.date).toLocaleDateString()} at{' '}
                        {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${
                      entry.status === 'passed' || entry.status === 'approved' 
                        ? 'text-emerald-400' 
                        : 'text-red-400'
                    }`}>
                      {entry.score}%
                    </span>
                    <button
                      onClick={() => setShowDeleteConfirm(entry.id)}
                      className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {entry.feedback && (
                  <p className="text-white/50 text-sm mt-2 pl-9">{entry.feedback}</p>
                )}

                {/* Delete Confirmation */}
                {showDeleteConfirm === entry.id && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                    <p className="text-white/60 text-sm">Delete this entry?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1 text-white/60 text-sm hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">
              {searchTerm || filter !== 'all' 
                ? 'No matching entries found' 
                : 'No practice history yet'}
            </p>
            <p className="text-white/30 text-sm mt-1">
              {!searchTerm && filter === 'all' && 'Start practicing to track your progress'}
            </p>
          </div>
        )}

        {/* Clear All Button */}
        {history.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
                  clearAllHistory();
                }
              }}
              className="text-red-400 text-sm px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-colors"
            >
              Clear All History
            </button>
          </div>
        )}

        {/* Footer Quote - Changes based on performance */}
        <QuranQuote 
          variant="default" 
          showRefresh={true}
          specificIndex={passedAttempts > totalAttempts / 2 ? 0 : 3}
          className="mt-8"
        />
      </div>
    </div>
  );
}
