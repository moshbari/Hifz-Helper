import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useRecording } from '../hooks/useRecording';
import { quranApi, transcribeApi, verifyApi, attemptsApi } from '../services/api';
import {
  ArrowLeft,
  Mic,
  Square,
  RefreshCw,
  Check,
  X,
  Edit3,
  Send,
  Loader2,
} from 'lucide-react';

function RecordingButton({ isRecording, onStart, onStop, duration, disabled }) {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={isRecording ? onStop : onStart}
        disabled={disabled}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
          disabled ? 'bg-gray-500 cursor-not-allowed' : isRecording ? 'bg-red-500 recording-pulse' : `${theme.primary} ${theme.primaryHover}`
        }`}
      >
        {isRecording ? <Square className="w-8 h-8 text-white fill-white" /> : <Mic className="w-8 h-8 text-white" />}
      </button>
      <p className={`mt-3 text-lg font-mono ${theme.text}`}>{duration}</p>
      <p className={`text-sm ${theme.textMuted}`}>{disabled ? 'Processing...' : isRecording ? 'Tap to stop' : 'Tap to record'}</p>
    </div>
  );
}

function VerseRangeModal({ surah, onSelect, onClose }) {
  const { theme } = useTheme();
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(Math.min(7, surah.versesCount));
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div className={`${theme.card} rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 animate-fade-in`}>
        <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Select Verse Range</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className={`block text-sm ${theme.textMuted} mb-2`}>Start Verse</label>
            <select value={start} onChange={(e) => { const v = parseInt(e.target.value); setStart(v); if (end < v) setEnd(v); }} className={`w-full p-3 ${theme.bg} ${theme.text} ${theme.border} border rounded-lg`}>
              {Array.from({ length: surah.versesCount }, (_, i) => i + 1).map((v) => (<option key={v} value={v}>{v}</option>))}
            </select>
          </div>
          <div>
            <label className={`block text-sm ${theme.textMuted} mb-2`}>End Verse</label>
            <select value={end} onChange={(e) => setEnd(parseInt(e.target.value))} className={`w-full p-3 ${theme.bg} ${theme.text} ${theme.border} border rounded-lg`}>
              {Array.from({ length: surah.versesCount - start + 1 }, (_, i) => start + i).map((v) => (<option key={v} value={v}>{v}</option>))}
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className={`flex-1 py-3 ${theme.card} ${theme.border} border rounded-lg ${theme.text}`}>Cancel</button>
          <button onClick={() => onSelect(start, end)} className={`flex-1 py-3 ${theme.primary} text-white rounded-lg`}>Start Practice</button>
        </div>
      </div>
