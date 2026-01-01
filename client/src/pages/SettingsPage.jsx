import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import {
  Moon,
  LogOut,
  User,
  Shield,
  HelpCircle,
  ChevronRight,
  Clock,
  BookOpen,
  Settings,
  Key,
  Eye,
  EyeOff,
  Loader2,
  Check,
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

// Password Reset Modal
function PasswordResetModal({ onClose }) {
  const { theme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

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
      await authApi.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`${theme.card} rounded-2xl w-full max-w-md p-6 animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-xl font-bold ${theme.text} mb-4 flex items-center gap-2`}>
          <Key className="w-5 h-5" />
          Change Password
        </h2>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <p className={`text-lg font-medium ${theme.text}`}>Password Changed!</p>
            <p className={`text-sm ${theme.textMuted} mt-1`}>Your password has been updated successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium ${theme.textMuted} mb-2`}>
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full p-3 pr-10 ${theme.bg} ${theme.text} ${theme.border} border rounded-lg`}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`}
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${theme.textMuted} mb-2`}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full p-3 pr-10 ${theme.bg} ${theme.text} ${theme.border} border rounded-lg`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${theme.textMuted} mb-2`}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full p-3 ${theme.bg} ${theme.text} ${theme.border} border rounded-lg`}
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-3 ${theme.bg} ${theme.border} border rounded-lg ${theme.text}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 ${theme.primary} text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50`}
              >
                {loading ? <Loader2 className="w-5 h-5 spinner" /> : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, themeName, setTheme, themes } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} pb-20`}>
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
              <h2 className={`font-semibold ${theme.text}`}>{user?.user_metadata?.name || user?.name || 'Student'}</h2>
              <p className={`text-sm ${theme.textMuted}`}>{user?.email || 'No email'}</p>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className={`${theme.card} rounded-xl p-4`}>
          <h3 className={`font-semibold ${theme.text} mb-4 flex items-center gap-2`}>
            <Shield className="w-5 h-5" />
            Account
          </h3>
          <button
            onClick={() => setShowPasswordModal(true)}
            className={`w-full flex items-center justify-between p-3 ${theme.bg} rounded-lg ${theme.text} hover:opacity-80 transition-opacity`}
          >
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5" />
              <span>Change Password</span>
            </div>
            <ChevronRight className={`w-5 h-5 ${theme.textMuted}`} />
          </button>
        </div>

        {/* Theme Selection */}
        <div className={`${theme.card} rounded-xl p-4`}>
          <h3 className={`font-semibold ${theme.text} mb-4 flex items-center gap-2`}>
            <Moon className="w-5 h-5" />
            Theme
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {themes && Object.entries(themes).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  themeName === key
                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                    : `${theme.bg} ${theme.border} border`
                }`}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-4 h-4 rounded-full ${t.primary}`}
                  />
                  <span className={theme.text}>
                    {t.name}
                  </span>
                </div>
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

      {showPasswordModal && (
        <PasswordResetModal onClose={() => setShowPasswordModal(false)} />
      )}

      <BottomNav active="settings" />
    </div>
  );
}
