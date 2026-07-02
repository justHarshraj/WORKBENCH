import { useState, useEffect } from 'react';
import { useAuthStore } from '../auth/store/useAuthStore';
import { useAppStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, User, Moon, Sun, Monitor, Bell, Shield, LogOut, Check } from 'lucide-react';
import { API_URL } from '../../store';

export const Settings = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'notifications' | 'security'>('account');

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setAvatarUrl(user?.avatar || '');
  }, [user]);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
  };

  const toggleFocusMode = () => {
    updateSettings({ focusMode: !settings?.focusMode });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, avatar: avatarUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      updateUser({ name: data.user.name, email: data.user.email, avatar: data.user.avatar });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-bg-card border border-border-subtle flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-text-muted" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main">Settings</h1>
          <p className="text-sm text-text-muted">Manage your account and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation / Sections */}
        <div className="space-y-1">
          <button 
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'account' ? 'bg-bg-card text-text-main shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-main hover:bg-bg-card/50'}`}
          >
            <User className={`w-4 h-4 ${activeTab === 'account' ? 'text-accent' : 'text-text-muted'}`} />
            Account
          </button>
          <button 
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'appearance' ? 'bg-bg-card text-text-main shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-main hover:bg-bg-card/50'}`}
          >
            <Monitor className={`w-4 h-4 ${activeTab === 'appearance' ? 'text-accent' : 'text-text-muted'}`} />
            Appearance
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-bg-card text-text-main shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-main hover:bg-bg-card/50'}`}
          >
            <Bell className={`w-4 h-4 ${activeTab === 'notifications' ? 'text-accent' : 'text-text-muted'}`} />
            Notifications
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-bg-card text-text-main shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-main hover:bg-bg-card/50'}`}
          >
            <Shield className={`w-4 h-4 ${activeTab === 'security' ? 'text-accent' : 'text-text-muted'}`} />
            Security
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-8 relative">
          
          <AnimatePresence mode="wait">
            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Profile Section */}
                <section className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-xl">
                  <h2 className="text-lg font-semibold text-text-main mb-6">Profile Information</h2>
                  
                  {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
                      {error}
                    </div>
                  )}
                  {saveSuccess && (
                    <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Profile updated successfully!
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="flex items-center gap-6 mb-8">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={name || 'User'} className="w-20 h-20 rounded-full border border-border-subtle object-cover bg-bg-app" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-bg-app border border-border-subtle flex items-center justify-center text-2xl font-semibold text-text-main uppercase shadow-inner">
                          {name?.[0] || email?.[0] || 'U'}
                        </div>
                      )}
                      <div className="flex-1 max-w-sm">
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">Avatar URL</label>
                        <input 
                          type="url" 
                          value={avatarUrl} 
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://example.com/avatar.png"
                          className="w-full bg-bg-app border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-accent transition-colors shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Full Name</label>
                        <input 
                          type="text" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full bg-bg-app border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-accent transition-colors shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Email Address</label>
                        <input 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full bg-bg-app border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-accent transition-colors shadow-inner disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button 
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50 shadow-lg"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </section>
                
                {/* Danger Zone */}
                <section className="bg-bg-card border border-red-900/30 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-lg font-semibold text-red-400 mb-6">Danger Zone</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-main">Log Out</p>
                      <p className="text-xs text-text-muted mt-1">End your current session across this device.</p>
                    </div>
                    <button 
                      onClick={logout}
                      className="px-4 py-2 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <section className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-xl">
                  <h2 className="text-lg font-semibold text-text-main mb-6">Preferences</h2>
                  
                  <div className="space-y-6">
                    {/* Theme */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-main">Theme</p>
                        <p className="text-xs text-text-muted mt-1">Select your preferred interface theme.</p>
                      </div>
                      <div className="flex bg-bg-app border border-border-subtle rounded-lg p-1">
                        <button 
                          onClick={() => handleThemeChange('light')}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${settings?.theme === 'light' ? 'bg-border-subtle text-text-main shadow' : 'text-text-muted hover:text-text-main'}`}
                        >
                          <Sun className="w-3.5 h-3.5" /> Light
                        </button>
                        <button 
                          onClick={() => handleThemeChange('dark')}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${settings?.theme === 'dark' || !settings?.theme ? 'bg-border-subtle text-text-main shadow' : 'text-text-muted hover:text-text-main'}`}
                        >
                          <Moon className="w-3.5 h-3.5" /> Dark
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-border-subtle/50 w-full"></div>

                    {/* Focus Mode */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-main">Focus Mode</p>
                        <p className="text-xs text-text-muted mt-1">Hide the sidebar to minimize distractions.</p>
                      </div>
                      <button 
                        onClick={toggleFocusMode}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${settings?.focusMode ? 'bg-accent' : 'bg-border-subtle'}`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings?.focusMode ? 'translate-x-2' : '-translate-x-2'}`} />
                      </button>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {(activeTab === 'notifications' || activeTab === 'security') && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-16 h-16 bg-bg-card rounded-2xl flex items-center justify-center mb-4 border border-border-subtle shadow-xl">
                  {activeTab === 'notifications' ? <Bell className="w-8 h-8 text-text-muted" /> : <Shield className="w-8 h-8 text-text-muted" />}
                </div>
                <h2 className="text-xl font-bold text-text-main mb-2 capitalize">{activeTab} Settings</h2>
                <p className="text-text-muted text-sm max-w-sm">
                  This feature is currently under development. Check back in a future update!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
