import React, { useState } from 'react';
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
  Lock,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
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

// Change Password Modal
function ChangePasswordModal({ onClose }) {
  const { theme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`${theme.card} rounded-2xl w-full max-w-md p-6 animate-fade-in`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${theme.text}`}>Change Password</h3>
          <button onClick={onClose} className={theme.textMuted}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <p className={`${theme.text} font-medium`}>Password Changed!</p>
            <p className={`${theme.textMuted} text-sm mt-1`}>Your password has been updated successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className={`block text-sm ${theme.textMuted} mb-1`}>Current Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 ${theme.bg} ${theme.text} ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`}
                >
                  {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm ${theme.textMuted} mb-1`}>New Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 ${theme.bg} ${theme.text} ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`}
                >
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm ${theme.textMuted} mb-1`}>Confirm New Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 ${theme.bg} ${theme.text} ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-3 ${theme.card} ${theme.border} border rounded-lg ${theme.text}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 ${theme.primary} text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50`}
              >
                {loading ? <Loader2 className="w-5 h-5 spinner" /> : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

        {/* Security Section */}
        <SettingsSection title="Security">
          <SettingsRow
            icon={Lock}
            label="Change Password"
            onClick={() => setShowPasswordModal(true)}
          />
        </SettingsSection>

        {/* App Section */}
        <SettingsSection title="App">
          <SettingsRow
            icon={Settings}
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

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

      <BottomNav active="settings" />
    </div>
  );
}
