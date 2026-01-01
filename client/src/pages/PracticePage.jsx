import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Mic, 
  Square, 
  Play, 
  Pause,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Loader2,
  RotateCcw,
  Star,
  StarOff
} from 'lucide-react';
import QuranQuote from '../components/QuranQuote';

// Sample verses data - in production this would come from API
const SAMPLE_VERSES = {
  1: [
    { number: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
    { number: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
    { number: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ' },
    { number: 4, text: 'مَالِكِ يَوْمِ الدِّينِ' },
    { number: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
    { number: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
    { number: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' },
  ]
};

const SURAH_INFO = {
  1: { name: 'Al-Fatihah', nameAr: 'الفاتحة', verses: 7 }
};

export default function PracticePage() {
  const { surahNumber } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Transcription & verification state
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Favorites
  const [isFavorite, setIsFavorite] = useState(false);

  const surahNum = parseInt(surahNumber) || 1;
  const surahInfo = SURAH_INFO[surahNum] || { name: `Surah ${surahNum}`, nameAr: `سورة ${surahNum}`, verses: 7 };
  const verses = SAMPLE_VERSES[surahNum] || [];

  useEffect(() => {
    // Check if this surah is favorited
    const favorites = JSON.parse(localStorage.getItem('hifz-favorites') || '[]');
    setIsFavorite(favorites.includes(surahNum));

    // Cleanup audio URL on unmount
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [surahNum, audioUrl]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('hifz-favorites') || '[]');
    if (isFavorite) {
      const newFavorites = favorites.filter(id => id !== surahNum);
      localStorage.setItem('hifz-favorites', JSON.stringify(newFavorites));
    } else {
      favorites.push(surahNum);
      localStorage.setItem('hifz-favorites', JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.transcription) {
        setTranscription(data.transcription);
      }
    } catch (err) {
      console.error('Transcription failed:', err);
      alert('Transcription failed. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleVerify = async () => {
    if (!transcription) return;

    setIsVerifying(true);
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription,
          surahNumber: surahNum,
          expectedVerses: verses.map(v => v.text)
        }),
      });

      const result = await response.json();
      setVerificationResult(result);

      // Save to history
      const history = JSON.parse(localStorage.getItem('hifz-history') || '[]');
      history.unshift({
        id: Date.now(),
        surahNumber: surahNum,
        surahName: surahInfo.name,
        date: new Date().toISOString(),
        status: result.passed ? 'passed' : 'failed',
        score: result.score || 0,
        feedback: result.feedback
      });
      localStorage.setItem('hifz-history', JSON.stringify(history.slice(0, 100)));
    } catch (err) {
      console.error('Verification failed:', err);
      alert('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const resetAttempt = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setTranscription('');
    setVerificationResult(null);
  };

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
          <div>
            <h1 
              className="text-white font-bold text-lg"
              dir="rtl"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {surahInfo.nameAr}
            </h1>
            <p className="text-white/50 text-xs">{surahInfo.name}</p>
          </div>
        </div>
        <button 
          onClick={toggleFavorite}
          className="p-2 text-white/70 hover:text-yellow-400 transition-colors"
        >
          {isFavorite ? (
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff className="w-6 h-6" />
          )}
        </button>
      </div>

      <div className="p-4">
        {/* Encouraging Quote - Before Practice */}
        {!audioBlob && !verificationResult && (
          <QuranQuote 
            variant="compact" 
            className="mb-4"
          />
        )}

        {/* Verses to Recite */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          <h2 className="text-white/60 text-sm mb-3">Verses to Recite</h2>
          <div 
            className="space-y-2"
            dir="rtl"
            style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
          >
            {verses.length > 0 ? (
              verses.map((verse) => (
                <p key={verse.number} className="text-xl text-white leading-loose">
                  {verse.text}
                  <span className="text-amber-400/60 text-sm mx-1">۝</span>
                </p>
              ))
            ) : (
              <p className="text-white/40 text-center">Loading verses...</p>
            )}
          </div>
        </div>

        {/* Recording Section */}
        {!verificationResult && (
          <div className="text-center mb-6">
            {!audioBlob ? (
              <>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-red-500 animate-pulse'
                      : `bg-gradient-to-br ${theme.accentGradient}`
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-10 h-10 text-white" />
                  ) : (
                    <Mic className="w-10 h-10 text-white" />
                  )}
                </button>
                <p className="text-white/60 mt-3">
                  {isRecording ? 'Recording... Tap to stop' : 'Tap to start recording'}
                </p>
              </>
            ) : (
              <div className="space-y-4">
                {/* Audio Playback */}
                <div className="bg-white/10 rounded-xl p-4 flex items-center gap-4">
                  <button
                    onClick={playAudio}
                    className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${theme.accentGradient}`}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white ml-1" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className="text-white font-medium">Recording Complete</p>
                    <p className="text-white/50 text-sm">Tap play to review</p>
                  </div>
                  <button
                    onClick={resetAttempt}
                    className="p-2 text-white/50 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
                <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />

                {/* Transcribe Button */}
                {!transcription && (
                  <button
                    onClick={handleTranscribe}
                    disabled={isTranscribing}
                    className={`w-full py-4 bg-gradient-to-r ${theme.accentGradient} text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2`}
                  >
                    {isTranscribing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Transcribing...
                      </>
                    ) : (
                      'Transcribe Recording'
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Transcription Result */}
        {transcription && !verificationResult && (
          <div className="mb-6">
            <h3 className="text-white/60 text-sm mb-2">Transcription</h3>
            <div 
              className="bg-white/5 border border-white/10 rounded-xl p-4"
              dir="rtl"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              <p className="text-xl text-white leading-loose">{transcription}</p>
            </div>
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className={`w-full mt-4 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Recitation'
              )}
            </button>
          </div>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <div className="space-y-4">
            <div className={`rounded-2xl p-6 text-center ${
              verificationResult.passed 
                ? 'bg-emerald-500/20 border border-emerald-500/40' 
                : 'bg-red-500/20 border border-red-500/40'
            }`}>
              {verificationResult.passed ? (
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
              ) : (
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-3" />
              )}
              <h2 className={`text-2xl font-bold mb-1 ${
                verificationResult.passed ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {verificationResult.passed ? 'Excellent!' : 'Keep Practicing'}
              </h2>
              <p className="text-white/70">
                Score: {verificationResult.score}%
              </p>
            </div>

            {verificationResult.feedback && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-white/60 text-sm mb-2">Feedback</h3>
                <p className="text-white/80">{verificationResult.feedback}</p>
              </div>
            )}

            {/* Encouraging Quote after result */}
            <QuranQuote 
              variant="default" 
              showRefresh={true}
              className="mt-4"
            />

            <button
              onClick={resetAttempt}
              className={`w-full py-4 bg-gradient-to-r ${theme.accentGradient} text-white font-semibold rounded-xl shadow-lg`}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
