import { useState, useEffect } from 'react';
import { useAppStore, type TimerMode } from '../../store';
import { motion } from 'framer-motion';
import { Clock, Timer as TimerIcon, List, Brain, Coffee, Hourglass } from 'lucide-react';
import { format } from 'date-fns';

export const TimerPage = () => {
  const {
    timeSessions,
    timerMode,
    timerTime,
    timerDurations,
    timerIsActive,
    timerSessionName,
    setTimerMode,
    setTimerTime,
    setTimerDuration,
    setTimerIsActive,
    setTimerSessionName,
    addTimeSession
  } = useAppStore();

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editMinutes, setEditMinutes] = useState('');

  // Keep local edit minutes in sync
  useEffect(() => {
    if (timerMode !== 'Stopwatch') {
      setEditMinutes(Math.floor(timerDurations[timerMode] / 60).toString());
    }
  }, [timerMode, timerDurations]);

  const handleTimeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const mins = parseInt(editMinutes);
    if (!isNaN(mins) && mins >= 0) {
      const clampedMins = Math.min(mins, 1440);
      const newDuration = clampedMins * 60;
      setTimerDuration(timerMode, newDuration);
      if (!timerIsActive) {
        setTimerTime(newDuration);
      }
      setEditMinutes(clampedMins.toString());
    }
    setIsEditingTime(false);
  };

  // Digital Clock State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setTimerIsActive(true);
  const handlePause = () => setTimerIsActive(false);
  
  const handleReset = () => {
    setTimerIsActive(false);
    setTimerTime(timerMode === 'Stopwatch' ? 0 : timerDurations[timerMode]);
  };

  const handleSave = async () => {
    if (timerTime === 0 && timerMode === 'Stopwatch') return;
    
    setIsSaving(true);
    
    const isCountdown = timerMode !== 'Stopwatch';
    const duration = isCountdown ? (timerDurations[timerMode] - timerTime) : timerTime;
    
    if (duration > 0) {
      await addTimeSession({
        name: timerSessionName || 'Focus Session',
        duration,
        date: new Date().toISOString()
      });
    }
    
    setIsSaving(false);
    handleReset();
  };

  const switchMode = (newMode: TimerMode) => {
    setTimerMode(newMode);
    setTimerIsActive(false);
    setTimerTime(newMode === 'Stopwatch' ? 0 : timerDurations[newMode]);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bg-card border border-border-subtle flex items-center justify-center shadow-lg">
            <TimerIcon className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-main">Focus Timer</h1>
            <p className="text-sm text-text-muted">Track your deep work and view the current time.</p>
          </div>
        </div>
        
        {/* Mode Selector */}
        <div className="hidden md:flex bg-bg-card border border-border-subtle rounded-xl p-1 shadow-sm">
          <button 
            onClick={() => switchMode('Stopwatch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timerMode === 'Stopwatch' ? 'bg-blue-500/20 text-blue-400' : 'text-text-muted hover:text-text-main'
            }`}
          >
            <TimerIcon className="w-4 h-4" /> Stopwatch
          </button>
          <button 
            onClick={() => switchMode('Timer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timerMode === 'Timer' ? 'bg-purple-500/20 text-purple-400' : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Hourglass className="w-4 h-4" /> Timer
          </button>
          <button 
            onClick={() => switchMode('Focus')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timerMode === 'Focus' ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Brain className="w-4 h-4" /> Focus
          </button>
          <button 
            onClick={() => switchMode('Break')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timerMode === 'Break' ? 'bg-warning/20 text-warning' : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Coffee className="w-4 h-4" /> Break
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Timer */}
        <div className="lg:col-span-2 flex flex-col">
          
          {/* Stopwatch / Pomodoro */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-bg-card border border-border-subtle rounded-3xl p-8 shadow-xl relative overflow-hidden flex-1 flex flex-col min-h-[500px] items-center justify-center"
          >
            {/* Top Label */}
            <h2 className="text-sm font-bold tracking-widest text-text-muted uppercase mb-12 relative z-10">
              {timerMode === 'Stopwatch' ? 'Stopwatch' : timerMode === 'Timer' ? 'Timer' : timerMode === 'Focus' ? 'Work Session' : 'Break Time'}
            </h2>

            {/* Circular Timer */}
            <div className="w-80 h-80 rounded-full border border-border-subtle flex flex-col items-center justify-center relative mb-8 z-10">
              {isEditingTime && timerMode !== 'Stopwatch' ? (
                <form onSubmit={handleTimeSubmit} className="flex flex-col items-center">
                  <input
                    autoFocus
                    type="number"
                    min="0"
                    max="1440"
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(e.target.value)}
                    onBlur={() => handleTimeSubmit()}
                    className="text-7xl font-black font-mono tracking-tighter text-text-main bg-transparent text-center focus:outline-none w-32 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none selection:bg-accent/30"
                  />
                  <span className="text-sm font-bold text-text-muted mt-2">min</span>
                </form>
              ) : (
                <div 
                  className={`text-7xl font-black font-mono tracking-tighter text-text-main tabular-nums ${!timerIsActive && timerMode !== 'Stopwatch' ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`}
                  onClick={() => !timerIsActive && timerMode !== 'Stopwatch' && setIsEditingTime(true)}
                  title={!timerIsActive && timerMode !== 'Stopwatch' ? "Click to edit time" : ""}
                >
                  {formatTime(timerTime)}
                </div>
              )}
            </div>

            {/* Session Name / Info */}
            <div className="mb-10 text-center relative z-10">
              {(timerMode === 'Focus' || timerMode === 'Stopwatch' || timerMode === 'Timer') ? (
                <input 
                  type="text" 
                  value={timerSessionName}
                  onChange={(e) => setTimerSessionName(e.target.value)}
                  placeholder="Session 1"
                  className="bg-transparent text-center text-sm font-medium text-text-muted focus:outline-none focus:text-text-main transition-colors w-64 placeholder-text-muted/50"
                />
              ) : (
                <p className="text-sm font-medium text-text-muted">Break</p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mb-12 relative z-10">
              {!timerIsActive ? (
                <button 
                  onClick={handleStart}
                  className="px-8 py-2.5 rounded-full bg-text-main text-bg-main font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Start
                </button>
              ) : (
                <button 
                  onClick={handlePause}
                  className="px-8 py-2.5 rounded-full border border-border-subtle bg-transparent text-text-main font-semibold text-sm hover:bg-border-subtle/30 transition-colors"
                >
                  Pause
                </button>
              )}

              {((timerMode === 'Stopwatch' && timerTime > 0) || (timerMode !== 'Stopwatch' && timerTime < timerDurations[timerMode])) && !timerIsActive && (
                <>
                  <button 
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-full bg-transparent text-text-muted font-medium text-sm hover:text-text-main transition-colors"
                  >
                    Reset
                  </button>
                  {timerMode !== 'Break' && (
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-full bg-transparent text-accent font-medium text-sm hover:text-accent/80 transition-colors disabled:opacity-50"
                    >
                      Save
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Settings Summary at bottom */}
            <div className="flex items-center gap-8 text-sm font-medium text-text-main relative z-10">
              <span className="flex gap-2">
                <span className="text-text-muted">Work:</span>
                {Math.floor(timerDurations['Focus'] / 60)}
              </span>
              <span className="flex gap-2">
                <span className="text-text-muted">Break:</span>
                {Math.floor(timerDurations['Break'] / 60)}
              </span>
            </div>
          </motion.section>

        </div>

        {/* Right Column: Clock and History */}
        <div className="space-y-6 flex flex-col">
          
          {/* Live Digital Clock (Mini Version) */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-card border border-border-subtle rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-xl"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-2 relative z-10 opacity-80">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">Current Time</span>
            </div>
            
            <div className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-text-main to-text-muted tabular-nums relative z-10">
              {format(currentTime, 'HH:mm:ss')}
            </div>
            <div className="text-sm font-medium text-text-muted mt-1 tracking-wide uppercase relative z-10">
              {format(currentTime, 'EEEE, MMMM do')}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-bg-card border border-border-subtle rounded-3xl p-6 h-full min-h-[500px] flex flex-col shadow-xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <List className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-text-main">Session History</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {timeSessions.length === 0 ? (
                <div className="text-center py-12 text-text-muted flex flex-col items-center">
                  <TimerIcon className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-sm">No recorded sessions yet.</p>
                  <p className="text-xs mt-1">Start a timer to begin tracking.</p>
                </div>
              ) : (
                timeSessions.map((session, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={session.id} 
                    className="p-4 rounded-xl bg-bg-app border border-border-subtle hover:border-accent transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-text-main text-sm truncate pr-2">{session.name}</h3>
                      <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                        {formatTime(session.duration)}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-text-muted">
                      {format(new Date(session.date), 'MMM d, yyyy • h:mm a')}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>
        </div>

      </div>
    </div>
  );
};
