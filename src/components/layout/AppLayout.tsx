import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAppStore } from '../../store';
import { Focus, Menu } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const {
    timerMode,
    timerTime,
    timerDurations,
    timerIsActive,
    timerSessionName,
    setTimerTime,
    setTimerIsActive,
    setTimerMode,
    addTimeSession
  } = useAppStore();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    // Stopwatch counts up, everything else (Timer, Focus, Break) counts down.
    const isCountdown = timerMode !== 'Stopwatch';
    
    if (timerIsActive && (!isCountdown || timerTime > 0)) {
      interval = setInterval(() => {
        setTimerTime((prev) => isCountdown ? prev - 1 : prev + 1);
      }, 1000);
    } else if (timerIsActive && isCountdown && timerTime === 0) {
      // Timer finished
      setTimerIsActive(false);
      
      if (timerMode === 'Focus') {
        // Save the session
        addTimeSession({
          name: timerSessionName || 'Untitled Session',
          duration: timerDurations.Focus,
          date: new Date().toISOString()
        });
        
        // Auto-switch to break
        setTimerMode('Break');
        setTimerTime(timerDurations.Break);
      } else if (timerMode === 'Break') {
        // Auto-switch to focus
        setTimerMode('Focus');
        setTimerTime(timerDurations.Focus);
      } else if (timerMode === 'Timer') {
        // Timer countdown finished
        setTimerTime(timerDurations.Timer);
      }
    }

    return () => clearInterval(interval);
  }, [timerIsActive, timerTime, timerMode, timerSessionName, timerDurations, addTimeSession, setTimerTime, setTimerIsActive, setTimerMode]);

  return (
    <div className="flex h-screen bg-bg-app text-text-main overflow-hidden font-sans relative">
      {!settings?.focusMode && <Sidebar isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />}
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {!settings?.focusMode && (
          <header className="md:hidden flex items-center justify-between p-4 border-b border-border-subtle bg-bg-app shrink-0 z-10">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="Workbench Logo" className="w-6 h-6 rounded-md object-cover border border-border-subtle" />
              <span className="font-bold tracking-tight text-text-main">WORKBENCH</span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="p-2 text-text-muted hover:text-text-main bg-bg-card rounded-md border border-border-subtle"
            >
              <Menu className="w-5 h-5" />
            </button>
          </header>
        )}
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          {settings?.focusMode && (
            <button 
              onClick={() => updateSettings({ focusMode: false })}
              className="fixed top-4 left-4 z-50 p-2.5 bg-bg-card border border-border-subtle rounded-full text-text-muted hover:text-text-main shadow-lg backdrop-blur-sm"
              title="Exit Focus Mode"
            >
              <Focus className="w-5 h-5" />
            </button>
          )}
          <div className="max-w-6xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
