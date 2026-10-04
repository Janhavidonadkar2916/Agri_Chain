import React, { useState } from 'react';
import { authService, API_BASE_URL } from '../services/api';
import NotificationToast from '../components/NotificationToast';
import { Settings, Lock, CheckCircle2, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [apiUrl, setApiUrl] = useState(API_BASE_URL);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: '', type: 'success' });

  const { darkMode, toggleDarkMode } = useTheme();

  const handleSaveApiUrl = (e) => {
    e.preventDefault();
    localStorage.setItem('agrichain_api_url', apiUrl.trim());
    setToastMsg({ text: 'API Server URL updated successfully! Refreshing...', type: 'success' });
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      setToastMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        current_password: currentPwd,
        new_password: newPwd
      });
      setToastMsg({ text: 'Password changed successfully!', type: 'success' });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err) {
      console.error(err);
      setToastMsg({ text: err.response?.data?.detail || 'Failed to change password.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Account Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Update password security and toggle UI display preferences
        </p>
      </div>

      {/* Theme Settings */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
          <Settings className="w-5 h-5 text-agri-600" />
          Appearance & Theme Mode
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Dark Mode Interface</h4>
            <p className="text-xs text-slate-500">Switch between light slate and dark glassmorphic themes</p>
          </div>

          <button
            onClick={toggleDarkMode}
            className="px-4 py-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 w-full sm:w-auto"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            {darkMode ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </div>

      {/* Backend API Configuration */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
          <Settings className="w-5 h-5 text-agri-600" />
          Backend API Server URL
        </h3>

        <form onSubmit={handleSaveApiUrl} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Active API Endpoint URL
            </label>
            <input
              type="url"
              required
              placeholder="e.g. https://pretty-papers-work.loca.lt"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono focus:ring-2 focus:ring-agri-500 outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Expose your local server and enter your active Localtunnel or Cloudflare URL here to allow other devices to connect.
            </p>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            Save API Server URL
          </button>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
          <Lock className="w-5 h-5 text-agri-600" />
          Security & Password Change
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-agri-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-agri-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-agri-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <NotificationToast
        message={toastMsg.text}
        type={toastMsg.type}
        onClose={() => setToastMsg({ text: '', type: 'success' })}
      />

    </div>
  );
}
