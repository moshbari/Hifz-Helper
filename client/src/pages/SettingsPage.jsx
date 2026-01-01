import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Moon,
  Sun,
  LogOut,
  User,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  Clock,
  BookOpen,
  Settings,
} from 'lucide-react';

// Bottom nav (shared component)
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

export default function SettingsPage() {
  const { theme, themeName, setTheme, availableThemes } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
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

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* User Profile */}
        <div className={`${theme.card} rounded-xl p-4`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full ${theme.primary} flex items-center justify-center`}>
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className={`font-semibold ${theme.text}`}>{user?.name || 'Student'}</h2>
              <p className={`text-sm ${theme.textMuted}`}>{user?.email || 'No email'}</p>
            </div>
          </div>
        </div>

        {/* Theme Selection */}
        <div className={`${theme.card} rounded-xl p-4`}>
          <h3 className={`font-semibold ${theme.text} mb-4 flex items-center gap-2`}>
            <Moon className="w-5 h-5" />
            Theme
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {availableThemes && availableThemes.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  themeName === t.name
                    ? `${theme.primary} border-current`
                    : `${theme.bg} ${theme.border} border`
                }`}
              >
                <span className={themeName === t.name ? 'text-white' : theme.text}>
                  {t.label || t.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div className={`${theme.card} rounded-xl p-4`}>
          <h3 className={`font-semibold ${theme.text} mb-4 flex items-center gap-2`}>
            <HelpCircle className="w-5 h-5" />
            About
          </h3>
          <div className={`text-sm ${theme.textMuted} space-y-2`}>
            <p>Hifz Helper v1.0.0</p>
            <p>Your companion for Quran memorization</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </main>

      <BottomNav active="settings" />
    </div>
  );
}
