import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAppStore } from './store';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './features/dashboard/Dashboard';
import { DayPlanner } from './features/day-planner/DayPlanner';
import { TodoSystem } from './features/todo-system/TodoSystem';
import { LinkVault } from './features/link-vault/LinkVault';
import { TimerPage } from './features/timer/TimerPage';
import { Statistics } from './features/statistics/Statistics';
import { Settings } from './features/settings/Settings';
import { DBZLoader } from './components/DBZLoader';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './features/auth/store/useAuthStore';

function App() {
  const checkDailyReset = useAppStore((state) => state.checkDailyReset);
  const fetchInitialData = useAppStore((state) => state.fetchInitialData);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const settings = useAppStore((state) => state.settings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (settings?.theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [settings?.theme]);

  useEffect(() => {
    checkDailyReset();
    if (isAuthenticated) {
      fetchInitialData().finally(() => {
        setTimeout(() => setLoading(false), 500);
      });
    } else {
      setTimeout(() => setLoading(false), 500);
    }
  }, [checkDailyReset, fetchInitialData, isAuthenticated]);

  if (loading) {
    return <DBZLoader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="planner" element={<DayPlanner />} />
            <Route path="todos" element={<TodoSystem />} />
            <Route path="links" element={<LinkVault />} />
            <Route path="timer" element={<TimerPage />} />
            <Route path="notes" element={<div className="p-4">Notes (Coming Soon)</div>} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
