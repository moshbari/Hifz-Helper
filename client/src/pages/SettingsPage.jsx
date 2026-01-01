import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ChevronLeft,
  User,
  Palette,
  Volume2,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Check,
  Wifi,
  WifiOff
} from 'lucide-react';
import QuranQuote from '../components/QuranQuote';

// Theme options
const THEME_OPTIONS = [
  { id: 'ocean', name: 'Ocean', gradient: 'from-blue-900 via-blue-800 to-cyan-900', accent: 'text-cyan-400' },
  { id: 'forest', name: 'Forest', gradient: 'from-green-900 via-emerald-800 to-teal-900', accent: 'text-emerald-400' },
  { id: 'sunset', name: 'Sunset', gradient: 'from-orange-900 via-red-800 to-pink-900', accent: 'text-orange-400' },
  { id: 'midnight', name: 'Midnight', gradient: 'from-slate-900 via-purple-900 to-slate-900', accent: 'text-purple-400' },
  { id: 'desert', name: 'Desert', gradient: 'from-amber-900 via-yellow-800 to-orange-900', accent: 'text-amber-400' },
  { id: 'light', name: 'Light', gradient: 'from-gray-100 via-gray-50 to-white', accent: 'text-blue-600', isLight: true },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, themeName, setTheme } = useTheme();
  
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    autoPlayAudio: true,
    notifications: true,
    offlineMode: false,
    playbackSpeed: 1.0
  });

  const [offlineCount, setOfflineCount] = useState(0);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = JSON.parse(localStorage.getItem('hifz-settings') || '{}');
    setSettings(prev => ({ ...prev, ...savedSettings }));

    // Check offline cache
    const offlineAttempts = JSON.parse(localStorage.getItem('hifz-offline-queue') || '[]');
    setOfflineCount(offlineAttempts.length);
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('hifz-settings', JSON.stringify(newSettings));
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
      navigate('/login');
    }
  };

  const syncOffline = async () => {
    // In production, this would sync offline attempts to the server
    alert('Syncing offline attempts...');
    localStorage.setItem('hifz-offline-queue', JSON.stringify([]));
    setOfflineCount(0);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button 
          onClick={() => navigate('/')}
          className="text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white font-bold text-lg">Settings</h1>
      </div>

      <div className="p-4">
        {/* User Profile Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${theme.accentGradient} flex items-center justify-center`}>
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">{user?.name || 'Student'}</p>
              <p className="text-white/50 text-sm">{user?.email || 'student@example.com'}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 ${theme.accentText} bg-white/10 rounded text-xs`}>
                {user?.role || 'Student'}
              </span>
            </div>
          </div>
        </div>

        {/* Inspirational Quote */}
        <QuranQuote 
          variant="default" 
          showRefresh={true}
          className="mb-6"
        />

        {/* Theme Selection */}
        <div className="mb-6">
          <h2 className="text-white/60 text-sm mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative rounded-xl p-3 border-2 transition-all ${
                  themeName === t.id 
                    ? 'border-white/60' 
                    : 'border-transparent hover:border-white/20'
                }`}
              >
                <div className={`h-12 rounded-lg bg-gradient-to-br ${t.gradient} mb-2`} />
                <p className={`text-xs ${t.isLight ? 'text-gray-800' : 'text-white/70'}`}>
                  {t.name}
                </p>
                {themeName === t.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-gray-800" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white">Arabic Font Size</span>
          </div>
          <div className="flex bg-white/10 rounded-xl p-1">
            {['small', 'medium', 'large', 'xlarge'].map((size) => (
              <button
                key={size}
                onClick={() => updateSetting('fontSize', size)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  settings.fontSize === size 
                    ? 'bg-white text-gray-800' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {size === 'xlarge' ? 'XL' : size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
          {/* Preview */}
          <div 
            className="mt-3 p-3 bg-black/20 rounded-lg"
            dir="rtl"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            <p className={`text-white text-center ${
              settings.fontSize === 'small' ? 'text-lg' :
              settings.fontSize === 'medium' ? 'text-xl' :
              settings.fontSize === 'large' ? 'text-2xl' : 'text-3xl'
            }`}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        </div>

        {/* Playback Speed */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-white/60" />
              Playback Speed
            </span>
            <span className="text-white/60">{settings.playbackSpeed}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.25"
            value={settings.playbackSpeed}
            onChange={(e) => updateSetting('playbackSpeed', parseFloat(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-white/40 text-xs mt-1">
            <span>0.5x</span>
            <span>1x</span>
            <span>1.5x</span>
            <span>2x</span>
          </div>
        </div>

        {/* Toggle Settings */}
        <div className="space-y-2 mb-6">
          {/* Auto-play Audio */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-white/60" />
              <span className="text-white">Auto-play Audio</span>
            </div>
            <button
              onClick={() => updateSetting('autoPlayAudio', !settings.autoPlayAudio)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                settings.autoPlayAudio ? 'bg-emerald-500' : 'bg-white/20'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.autoPlayAudio ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-white/60" />
              <span className="text-white">Notifications</span>
            </div>
            <button
              onClick={() => updateSetting('notifications', !settings.notifications)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                settings.notifications ? 'bg-emerald-500' : 'bg-white/20'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.notifications ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Offline Mode */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.offlineMode ? (
                  <WifiOff className="w-5 h-5 text-amber-400" />
                ) : (
                  <Wifi className="w-5 h-5 text-white/60" />
                )}
                <div>
                  <span className="text-white">Offline Mode</span>
                  {offlineCount > 0 && (
                    <p className="text-amber-400 text-xs">{offlineCount} pending sync</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => updateSetting('offlineMode', !settings.offlineMode)}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  settings.offlineMode ? 'bg-amber-500' : 'bg-white/20'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.offlineMode ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
            {offlineCount > 0 && (
              <button
                onClick={syncOffline}
                className="mt-3 w-full py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30 transition-colors"
              >
                Sync Now
              </button>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-red-500/20 border border-red-500/40 text-red-400 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/30 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>

        {/* Footer Quote */}
        <QuranQuote 
          variant="minimal" 
          className="mt-8"
        />

        {/* Version Info */}
        <p className="text-center text-white/30 text-xs mt-4">
          Hifz Helper v1.0.0
        </p>
      </div>
    </div>
  );
}
