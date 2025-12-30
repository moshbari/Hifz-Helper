import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useRecording } from '../hooks/useRecording';
import { quranApi, transcribeApi, verifyApi, attemptsApi } from '../services/api';
import {
  ArrowLeft,
  Mic,
  Square,
  Play,
  Pause,
  RefreshCw,
  Check,
  X,
  Edit3,
  Send,
  Loader2,
  Volume2,
  ChevronDown,
} from 'lucide-react';

// Recording button component
function RecordingButton({ isRecording, onStart, onStop, duration }) {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={isRecording ? onStop : onStart}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
          isRecording
            ? 'bg-red-500 recording-pulse'
            : `${theme.primary} ${theme.primaryHover}`
        }`}
      >
        {isRecording ? (
          <Square className="w-8 h-8 text-white fill-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </button>
      <p className={`mt-3 text-lg font-mono ${theme.text}`}>
        {duration}
      </p>
      <p className={`text-sm ${theme.textMuted}`}>
        {isRecording ? 'Tap to stop' : 'Tap to record'}
      </p>
    </div>
  );
}

// Verse range selector
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
            <select
              value={start}
              onChange={(e) => setStart(parseInt(e.target.value))}
              className={`w-full p-3 ${theme.bg} ${theme.text} ${theme.border} border rounded-lg`}
            >
              {Array.from({ length: surah.versesCount }, (_, i) => i + 1).map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm ${theme.textMuted} mb-2`}>End Verse</label>
            <select
              value={end}
              onChange={(e) => setEnd(parseInt(e.target.value))}
              className={`w-full p-3 ${theme.bg} ${theme.text} ${theme.border} border rounded-lg`}
            >
              {Array.from({ length: surah.versesCount - start + 1 }, (_, i) => start + i).map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-3 ${theme.card} ${theme.border} border rounded-lg ${theme.text}`}
          >
            Cancel
          </button>
          <button
            onClick={() => onSelect(start, end)}
            className={`flex-1 py-3 ${theme.primary} text-white rounded-lg`}
          >
            Start Practice
          </button>
        </div>
      </div>
    </div>
  );
}

// Verification result component
function VerificationResult({ result, onRetry, onDone }) {
  const { theme } = useTheme();

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return 'text-emerald-400';
    if (accuracy >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="animate-fade-in">
      {/* Accuracy Score */}
      <div className={`${theme.card} rounded-2xl p-6 mb-4 text-center`}>
        <div className={`text-5xl font-bold ${getAccuracyColor(result.overallAccuracy)} mb-2`}>
          {result.overallAccuracy}%
        </div>
        <p className={`${theme.textMuted}`}>
          {result.isCorrect ? '✓ Excellent recitation!' : 'Keep practicing!'}
        </p>
      </div>

      {/* Word-by-word results */}
      {result.wordByWord && result.wordByWord.length > 0 && (
        <div className={`${theme.card} rounded-2xl p-4 mb-4`}>
          <h4 className={`font-medium ${theme.text} mb-3`}>Word Analysis</h4>
          <div className="flex flex-wrap gap-2" dir="rtl">
            {result.wordByWord.map((word, idx) => (
              <span
                key={idx}
                className={`px-2 py-1 rounded text-lg font-arabic ${
                  word.status === 'correct'
                    ? `${theme.success} bg-emerald-500/10`
                    : word.status === 'incorrect'
                    ? `${theme.error} bg-red-500/10`
                    : `${theme.textMuted} bg-slate-500/10`
                }`}
              >
                {word.original}
                {word.status === 'correct' && <Check className="inline w-3 h-3 ml-1" />}
                {word.status === 'incorrect' && <X className="inline w-3 h-3 ml-1" />}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {result.errors && result.errors.length > 0 && (
        <div className={`${theme.card} rounded-2xl p-4 mb-4`}>
          <h4 className={`font-medium ${theme.text} mb-3`}>Areas to Improve</h4>
          <div className="space-y-2">
            {result.errors.slice(0, 5).map((error, idx) => (
              <div key={idx} className={`text-sm ${theme.textMuted}`}>
                <span className={theme.error}>"{error.recited}"</span>
                <span className="mx-2">→</span>
                <span className={theme.success}>"{error.original}"</span>
                {error.suggestion && (
                  <p className="text-xs mt-1 opacity-70">{error.suggestion}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Encouragement */}
      {result.encouragement && (
        <p className={`text-center ${theme.textMuted} mb-6`}>{result.encouragement}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className={`flex-1 py-3 ${theme.card} ${theme.border} border rounded-xl ${theme.text} flex items-center justify-center gap-2`}
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>
        <button
          onClick={onDone}
          className={`flex-1 py-3 ${theme.primary} text-white rounded-xl flex items-center justify-center gap-2`}
        >
          <Check className="w-5 h-5" />
          Done
        </button>
      </div>
    </div>
  );
}

export default function PracticePage() {
  const { surahNumber } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [surah, setSurah] = useState(null);
  const [verses, setVerses] = useState([]);
  const [verseRange, setVerseRange] = useState(null);
  const [showRangeModal, setShowRangeModal] = useState(true);
  const [step, setStep] = useState('select'); // select, record, transcribe, edit, verify, result
  const [transcription, setTranscription] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    isRecording,
    duration,
    formattedDuration,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
  } = useRecording();

  useEffect(() => {
    loadSurah();
  }, [surahNumber]);

  const loadSurah = async () => {
    try {
      const { surah } = await quranApi.getSurah(surahNumber);
      setSurah(surah);
    } catch (err) {
      setError('Failed to load surah');
    }
  };

  const loadVerses = async (start, end) => {
    setLoading(true);
    try {
      const { verses: loadedVerses, combinedText } = await quranApi.getVerses(surahNumber, start, end);
      setVerses(loadedVerses);
      setVerseRange({ start, end, combinedText });
      setShowRangeModal(false);
      setStep('record');
    } catch (err) {
      setError('Failed to load verses');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordingComplete = async () => {
    if (!audioBlob) return;

    setStep('transcribe');
    setLoading(true);
    setError(null);

    try {
      const result = await transcribeApi.transcribe(audioBlob);
      setTranscription(result.transcription);
      setStep('edit');
    } catch (err) {
      setError('Transcription failed. Please try again.');
      setStep('record');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setStep('verify');
    setLoading(true);
    setError(null);

    try {
      const result = await verifyApi.verify(
        transcription,
        verseRange.combinedText,
        parseInt(surahNumber),
        verseRange
      );

      setVerificationResult(result.verification);

      // Save attempt
      await attemptsApi.saveAttempt({
        surahNumber: parseInt(surahNumber),
        surahName: surah.name,
        verseStart: verseRange.start,
        verseEnd: verseRange.end,
        transcription,
        originalText: verseRange.combinedText,
        accuracy: result.verification.overallAccuracy,
        wordResults: result.verification.wordByWord,
        errors: result.verification.errors,
        duration,
        status: result.verification.isCorrect ? 'passed' : 'needs_review',
      });

      setStep('result');
    } catch (err) {
      setError('Verification failed. Please try again.');
      setStep('edit');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    resetRecording();
    setTranscription('');
    setVerificationResult(null);
    setStep('record');
  };

  if (!surah) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full spinner" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      {/* Header */}
      <header className={`${theme.card} px-4 py-4 sticky top-0 z-10`}>
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className={`p-2 ${theme.textMuted} hover:${theme.text}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className={`font-semibold ${theme.text}`}>{surah.name}</h1>
            <p className={`text-sm ${theme.textMuted}`}>
              {verseRange ? `Verses ${verseRange.start}-${verseRange.end}` : `${surah.versesCount} verses`}
            </p>
          </div>
          <span className={`text-2xl ${theme.textMuted}`} dir="rtl">{surah.nameAr}</span>
        </div>
      </header>

      {/* Verse Range Modal */}
      {showRangeModal && surah && (
        <VerseRangeModal
          surah={surah}
          onSelect={loadVerses}
          onClose={() => navigate('/')}
        />
      )}

      {/* Main Content */}
      <main className="px-4 py-6 max-w-lg mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Verses Display */}
        {verses.length > 0 && step !== 'result' && (
          <div className={`${theme.card} rounded-2xl p-6 mb-6`}>
            <div className="arabic-text text-2xl leading-loose" dir="rtl">
              {verses.map((verse, idx) => (
                <span key={verse.number}>
                  {verse.text}
                  <span className="verse-separator">۝</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recording Step */}
        {step === 'record' && (
          <div className="text-center py-8">
            <RecordingButton
              isRecording={isRecording}
              onStart={startRecording}
              onStop={() => {
                stopRecording();
                setTimeout(handleRecordingComplete, 500);
              }}
              duration={formattedDuration}
            />
          </div>
        )}

        {/* Transcribing Step */}
        {step === 'transcribe' && loading && (
          <div className="text-center py-12">
            <Loader2 className={`w-12 h-12 ${theme.accent} mx-auto spinner mb-4`} />
            <p className={theme.text}>Transcribing your recitation...</p>
            <p className={`text-sm ${theme.textMuted} mt-2`}>This may take a moment</p>
          </div>
        )}

        {/* Edit Transcription Step */}
        {step === 'edit' && (
          <div className="animate-fade-in">
            <div className={`${theme.card} rounded-2xl p-4 mb-4`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-medium ${theme.text}`}>Your Transcription</h3>
                <Edit3 className={`w-4 h-4 ${theme.textMuted}`} />
              </div>
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                className={`w-full h-32 p-3 ${theme.bg} ${theme.text} ${theme.border} border rounded-lg resize-none arabic-text text-xl`}
                dir="rtl"
                placeholder="Edit transcription if needed..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className={`flex-1 py-3 ${theme.card} ${theme.border} border rounded-xl ${theme.text}`}
              >
                Re-record
              </button>
              <button
                onClick={handleVerify}
                className={`flex-1 py-3 ${theme.primary} text-white rounded-xl flex items-center justify-center gap-2`}
              >
                <Send className="w-5 h-5" />
                Verify
              </button>
            </div>
          </div>
        )}

        {/* Verifying Step */}
        {step === 'verify' && loading && (
          <div className="text-center py-12">
            <Loader2 className={`w-12 h-12 ${theme.accent} mx-auto spinner mb-4`} />
            <p className={theme.text}>Verifying your recitation...</p>
          </div>
        )}

        {/* Result Step */}
        {step === 'result' && verificationResult && (
          <VerificationResult
            result={verificationResult}
            onRetry={handleRetry}
            onDone={() => navigate('/')}
          />
        )}
      </main>
    </div>
  );
}
