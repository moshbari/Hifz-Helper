import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES } from '../context/ThemeContext';
import {
  BookOpen,
  Clock,
  Settings,
  Palette,
  LogOut,
  User,
  Mail,
  Shield,
  Check,
} from 'lucide-react';

// Bottom nav
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

// Theme selector
function ThemeSelector() {
  const { theme, themeName, setTheme, themes } = useTheme();

  const themeColors = {
    ocean: 'bg-blue-600',
    forest: 'bg-emerald-600',
    royal: 'bg-purple-600',
    sunset: 'bg-orange-600',
    midnight: 'bg-indigo-600',
    light: 'bg-slate-200',
    cream: 'bg-amber-200',
  };

  return (
    <div className={`${theme.card} rounded-xl p-4`}>
      <div className="flex items-center gap-3 mb-4">
        <Palette className={`w-5 h-5 ${theme.accent}`} />
        <h3 className={`font-medium ${theme.text}`}>Theme</h3>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {Object.entries(themes).map(([key, t]) => (
          <button
            key={key}
            onClick={() => setTheme(key)}
            className={`relative aspect-square rounded-xl ${themeColors[key]} flex items-center justify-center transition-transform hover:scale-105 ${
              themeName === key ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
            }`}
            title={t.name}
          >
            {themeName === key && (
              <Check className="w-5 h-5 text-white drop-shadow" />
            )}
          </button>
        ))}
      </div>

      <p className={`text-sm ${theme.textMuted} mt-3`}>
        Current: {themes[themeName].name}
      </p>
    </div>
  );
}

// Settings section
function SettingsSection({ title, children }) {
  const { theme } = useTheme();

  return (
    <div className="mb-6">
      <h2 className={`text-sm font-medium ${theme.textMuted} mb-3 px-1`}>{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// Settings row
function SettingsRow({ icon: Icon, label, value, onClick, danger }) {
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`w-full ${theme.card} rounded-xl p-4 flex items-center gap-3 transition-colors ${theme.cardHover}`}
    >
      <Icon className={`w-5 h-5 ${danger ? 'text-red-400' : theme.accent}`} />
      <span className={`flex-1 text-left ${danger ? 'text-red-400' : theme.text}`}>{label}</span>
      {value && <span className={theme.textMuted}>{value}</span>}
    </button>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await logout();
      navigate('/login');
    }
  };

  const handleClearData = () => {
    if (confirm('This will clear all local data including favorites. Continue?')) {
      localStorage.removeItem('hifz-favorites');
      localStorage.removeItem('hifz-theme');
      window.location.reload();
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} pb-20`}>
      {/* Header */}
      <header className={`${theme.card} px-4 py-6 safe-top`}>
        <div className="max-w-lg mx-auto">
          <h1 className={`text-xl font-bold ${theme.text}`}>Settings</h1>
        </div>
      </header>

      {/* Settings Content */}
      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Profile Section */}
        <SettingsSection title="Profile">
          <div className={`${theme.card} rounded-xl p-4`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${theme.primary} rounded-full flex items-center justify-center`}>
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${theme.text}`}>
                  {user?.user_metadata?.name || 'Student'}
                </p>
                <p className={`text-sm ${theme.textMuted}`}>{user?.email}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs ${theme.primary} text-white`}>
                {user?.user_metadata?.role || 'Student'}
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Appearance Section */}
        <SettingsSection title="Appearance">
          <ThemeSelector />
        </SettingsSection>

        {/* App Section */}
        <SettingsSection title="App">
          <SettingsRow
            icon={Shield}
            label="Clear Local Data"
            onClick={handleClearData}
          />
        </SettingsSection>

        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingsRow
            icon={LogOut}
            label="Sign Out"
            onClick={handleLogout}
            danger
          />
        </SettingsSection>

        {/* App Info */}
        <div className={`text-center ${theme.textMuted} text-sm mt-8`}>
          <p>Hifz Helper v1.0.0</p>
          <p className="mt-1">Made with ❤️ for Quran memorization</p>
        </div>
      </main>

      <BottomNav active="settings" />
    </div>
  );
}
