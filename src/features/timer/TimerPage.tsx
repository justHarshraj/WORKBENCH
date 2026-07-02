import { useState, useEffect } from 'react';
import { useAppStore, type TimerMode } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Play, Pause, Square, Save, Timer as TimerIcon, List, Brain, Coffee } from 'lucide-react';
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
    setEditMinutes(Math.floor(timerDurations[timerMode] / 60).toString());
  }, [timerMode, timerDurations]);

  const handleTimeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const mins = parseInt(editMinutes);
    if (!isNaN(mins) && mins >= 0) {
      const newDuration = mins * 60;
      setTimerDuration(timerMode, newDuration);
      if (!timerIsActive) {
        setTimerTime(newDuration);
      }
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
    setTimerTime(timerDurations[timerMode]);
  };

  const handleSave = async () => {
    if (timerTime === 0 && timerMode === 'Stopwatch' && timerDurations.Stopwatch === 0) return;
    
    setIsSaving(true);
    
    const isCountdown = timerMode !== 'Stopwatch' || timerDurations.Stopwatch > 0;
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
    setTimerTime(timerDurations[newMode]);
  };

  const getModeColor = () => {
    if (timerMode === 'Stopwatch') return 'text-blue-400 border-blue-400/30 bg-blue-400/10 hover:bg-blue-400/20';
    if (timerMode === 'Focus') return 'text-accent border-accent/30 bg-accent/10 hover:bg-accent/20';
    return 'text-warning border-warning/30 bg-warning/10 hover:bg-warning/20';
  };

  const progress = timerDurations[timerMode] === 0 
    ? 100 
    : ((timerDurations[timerMode] - timerTime) / timerDurations[timerMode]) * 100;

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
        
        {/* Left Column: Clock and Timer */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Live Digital Clock */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-card border border-border-subtle rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-xl"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <Clock className="w-6 h-6 text-accent mb-4 opacity-80" />
            
            <div className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-text-main to-text-muted tabular-nums">
              {format(currentTime, 'HH:mm:ss')}
            </div>
            <div className="text-lg md:text-xl font-medium text-text-muted mt-2 tracking-wide uppercase">
              {format(currentTime, 'EEEE, MMMM do')}
            </div>
          </motion.section>

          {/* Stopwatch / Pomodoro */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-bg-card border border-border-subtle rounded-3xl p-8 shadow-xl relative overflow-hidden"
          >
            {/* Progress Bar Background */}
            <div 
              className={`absolute bottom-0 left-0 h-1.5 transition-all duration-1000 ease-linear ${timerMode === 'Stopwatch' ? 'bg-blue-500' : timerMode === 'Focus' ? 'bg-accent' : 'bg-warning'}`}
              style={{ width: `${progress}%` }}
            ></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-lg font-semibold text-text-main flex items-center gap-2">
                {timerMode === 'Stopwatch' ? (
                  <><TimerIcon className="w-5 h-5 text-blue-400" /> Stopwatch</>
                ) : timerMode === 'Focus' ? (
                  <><Brain className="w-5 h-5 text-accent" /> Focus Session</>
                ) : (
                  <><Coffee className="w-5 h-5 text-warning" /> Take a Break</>
                )}
              </h2>
              {(timerMode === 'Focus' || timerMode === 'Stopwatch') && (
                <input 
                  type="text" 
                  value={timerSessionName}
                  onChange={(e) => setTimerSessionName(e.target.value)}
                  placeholder="What are you working on?"
                  className="bg-bg-app border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-main focus:outline-none focus:border-accent transition-colors w-48"
                />
              )}
            </div>

            <div className="flex flex-col items-center justify-center py-8 relative z-10">
              {isEditingTime ? (
                <form onSubmit={handleTimeSubmit} className="flex flex-col items-center mb-12">
                  <div className="flex items-baseline justify-center">
                    <input
                      autoFocus
                      type="number"
                      min="0"
                      value={editMinutes}
                      onChange={(e) => setEditMinutes(e.target.value)}
                      onBlur={() => handleTimeSubmit()}
                      className="text-7xl md:text-9xl font-black font-mono tracking-tighter text-text-main bg-transparent text-center focus:outline-none w-32 md:w-48 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none selection:bg-accent/30"
                    />
                    <span className="text-2xl font-bold text-text-muted ml-2">min</span>
                  </div>
                  <p className="text-sm text-accent mt-4 animate-pulse">Press Enter to save</p>
                </form>
              ) : (
                <div className="flex flex-col items-center mb-12">
                  <div 
                    className={`text-7xl md:text-9xl font-black font-mono tracking-tighter text-text-main tabular-nums ${!timerIsActive ? 'cursor-pointer hover:text-accent transition-colors' : ''}`}
                    onClick={() => !timerIsActive && setIsEditingTime(true)}
                    title={!timerIsActive ? "Click to edit time" : ""}
                  >
                    {formatTime(timerTime)}
                  </div>
                  {!timerIsActive && (
                    <p className="text-sm text-text-muted mt-4 opacity-70">Click the time to set duration</p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4">
                {!timerIsActive ? (
                  <button 
                    onClick={handleStart}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg border ${getModeColor()} hover:scale-105 active:scale-95`}
                  >
                    <Play className="w-8 h-8 ml-1 fill-current" />
                  </button>
                ) : (
                  <button 
                    onClick={handlePause}
                    className="w-16 h-16 rounded-full bg-border-subtle border border-text-muted hover:opacity-90 text-text-main flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95"
                  >
                    <Pause className="w-8 h-8 fill-current" />
                  </button>
                )}

                <AnimatePresence>
                  {((timerMode === 'Stopwatch' && (timerDurations.Stopwatch === 0 ? timerTime > 0 : timerTime < timerDurations.Stopwatch)) || (timerMode !== 'Stopwatch' && timerTime < timerDurations[timerMode])) && !timerIsActive && (
                    <>
                      {timerMode !== 'Break' && (
                        <motion.button 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={handleSave}
                          disabled={isSaving}
                          className="w-16 h-16 rounded-full bg-success hover:opacity-90 text-white flex items-center justify-center transition-all shadow-lg shadow-success/20 hover:scale-105 active:scale-95 disabled:opacity-50"
                          title="Save Session"
                        >
                          <Save className="w-7 h-7" />
                        </motion.button>
                      )}
                      
                      <motion.button 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleReset}
                        className="w-16 h-16 rounded-full bg-border-subtle border border-border-subtle/50 hover:bg-border-subtle/80 text-text-main flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                        title="Reset"
                      >
                        <Square className="w-6 h-6" />
                      </motion.button>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>

        </div>

        {/* Right Column: History */}
        <div className="space-y-6">
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
