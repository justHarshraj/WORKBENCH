import { useState, useEffect } from 'react';
import { Play, Pause, Square, Coffee, Brain, Timer as TimerIcon, Hourglass } from 'lucide-react';
import { useAppStore, type TimerMode } from '../../../store';

export function TimerWidget() {
  const {
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

  const toggleTimer = () => {
    setTimerIsActive(!timerIsActive);
  };

  const resetTimer = () => {
    setTimerIsActive(false);
    if (timerTime > 0) {
      const isCountdown = timerMode !== 'Stopwatch';
      const duration = isCountdown ? (timerDurations[timerMode] - timerTime) : timerTime;
      
      if (duration > 0) {
        addTimeSession({
          name: timerSessionName || 'Untitled Session',
          duration,
          date: new Date().toISOString()
        });
      }
    }
    setTimerTime(timerMode === 'Stopwatch' ? 0 : timerDurations[timerMode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setTimerMode(newMode);
    setTimerIsActive(false);
    setTimerTime(newMode === 'Stopwatch' ? 0 : timerDurations[newMode]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = timerMode === 'Stopwatch'
    ? 100 
    : timerDurations[timerMode] === 0 
      ? 100 
      : ((timerDurations[timerMode] - timerTime) / timerDurations[timerMode]) * 100;

  return (
    <div className="bg-bg-card rounded-lg border border-border-subtle overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-bg-app/50">
        <h2 className="text-body-md font-medium text-text-main flex items-center gap-2">
          {timerMode === 'Stopwatch' ? (
            <TimerIcon className="w-4 h-4 text-blue-400" />
          ) : timerMode === 'Timer' ? (
            <Hourglass className="w-4 h-4 text-purple-400" />
          ) : timerMode === 'Focus' ? (
            <Brain className="w-4 h-4 text-accent" />
          ) : (
            <Coffee className="w-4 h-4 text-warning" />
          )}
          {timerMode === 'Stopwatch' ? 'Stopwatch' : timerMode === 'Timer' ? 'Timer' : timerMode === 'Focus' ? 'Focus Session' : 'Take a Break'}
        </h2>
        
        <div className="flex bg-bg-app rounded-md border border-border-subtle p-0.5">
          <button 
            onClick={() => switchMode('Stopwatch')}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
              timerMode === 'Stopwatch' ? 'bg-blue-500/20 text-blue-400' : 'text-text-muted hover:text-text-main'
            }`}
          >
            Stopwatch
          </button>
          <button 
            onClick={() => switchMode('Timer')}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
              timerMode === 'Timer' ? 'bg-purple-500/20 text-purple-400' : 'text-text-muted hover:text-text-main'
            }`}
          >
            Timer
          </button>
          <button 
            onClick={() => switchMode('Focus')}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
              timerMode === 'Focus' ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-main'
            }`}
          >
            Focus
          </button>
          <button 
            onClick={() => switchMode('Break')}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
              timerMode === 'Break' ? 'bg-warning/20 text-warning' : 'text-text-muted hover:text-text-main'
            }`}
          >
            Break
          </button>
        </div>
      </div>

      {/* Timer Body */}
      <div className="p-6 flex flex-col items-center justify-center relative">
        {isEditingTime && timerMode !== 'Stopwatch' ? (
          <form onSubmit={handleTimeSubmit} className="flex flex-col items-center mb-2">
            <div className="flex items-baseline justify-center">
              <input
                autoFocus
                type="number"
                min="0"
                max="1440"
                value={editMinutes}
                onChange={(e) => setEditMinutes(e.target.value)}
                onBlur={() => handleTimeSubmit()}
                className="text-display-lg font-bold text-text-main font-mono tracking-wider bg-transparent text-center focus:outline-none w-24 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none selection:bg-accent/30"
              />
              <span className="text-sm font-medium text-text-muted ml-1">m</span>
            </div>
          </form>
        ) : (
          <div 
            className={`text-display-lg font-bold text-text-main font-mono tracking-wider mb-2 tabular-nums ${!timerIsActive && timerMode !== 'Stopwatch' ? 'cursor-pointer hover:text-accent transition-colors' : ''}`}
            onClick={() => !timerIsActive && timerMode !== 'Stopwatch' && setIsEditingTime(true)}
            title={!timerIsActive && timerMode !== 'Stopwatch' ? "Click to edit time" : ""}
          >
            {formatTime(timerTime)}
          </div>
        )}
        
        {(timerMode === 'Focus' || timerMode === 'Stopwatch' || timerMode === 'Timer') && (
          <input 
            type="text" 
            value={timerSessionName}
            onChange={(e) => setTimerSessionName(e.target.value)}
            placeholder="What are you working on?"
            className="w-full max-w-[200px] text-center bg-transparent border-b border-border-subtle focus:border-accent outline-none text-body-sm text-text-muted focus:text-text-main transition-colors pb-1 mb-6 placeholder:text-text-muted/50"
          />
        )}
        
        {timerMode === 'Break' && (
          <div className="text-body-sm text-text-muted mb-6 h-[25px] flex items-center">
            Time to recharge!
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTimer}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 ${
              timerIsActive ? 'bg-warning/20 text-warning border border-warning/30' : 'bg-accent/20 text-accent border border-accent/30'
            }`}
          >
            {timerIsActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
          </button>
          
          <button 
            onClick={resetTimer}
            disabled={timerTime === (timerMode === 'Stopwatch' ? 0 : timerDurations[timerMode])}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-bg-app border border-border-subtle text-text-muted hover:text-text-main transition-colors disabled:opacity-50 disabled:hover:text-text-muted disabled:cursor-not-allowed"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-bg-app">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${timerMode === 'Stopwatch' ? 'bg-blue-500' : timerMode === 'Timer' ? 'bg-purple-500' : timerMode === 'Focus' ? 'bg-accent' : 'bg-warning'}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
