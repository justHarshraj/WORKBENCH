import { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Circle, Clock, Plus, Target } from 'lucide-react';
import { TodoModal } from '../todo-system/components/TodoModal';
import { HyperlinkWidget } from './components/HyperlinkWidget';
import { TimerWidget } from './components/TimerWidget';

export function Dashboard() {
  const [greeting, setGreeting] = useState('');
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  
  const todos = useAppStore((state) => state.todos) || [];
  const events = useAppStore((state) => state.events) || [];
  const updateTodo = useAppStore((state) => state.updateTodo);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Today's Progress Logic
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaysEvents = events.filter(e => e.date === todayStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  const totalTasks = todos.length;
  const completedTasks = todos.filter(t => t.status === 'Done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const progressData = [
    { name: 'Completed', value: completedTasks, color: 'var(--color-success)' },
    { name: 'Remaining', value: totalTasks - completedTasks, color: 'var(--color-border-subtle)' }
  ];
  if (totalTasks === 0) progressData[1].value = 1; // Default ring

  // Active Task Logic
  const activeTask = todos.find(t => t.status === 'In Progress') || 
                     todos.find(t => t.priority === 'Critical' && t.status !== 'Done') ||
                     todos.find(t => t.status !== 'Done');

  const toggleComplete = (id: string, currentStatus: string) => {
    updateTodo(id, { status: currentStatus === 'Done' ? 'Todo' : 'Done', completed: currentStatus !== 'Done' });
  };

  return (
    <div className="space-y-5 flex flex-col h-full animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-display-md text-text-main">{greeting}, {user?.name || 'User'}</h1>
          <p className="text-body-sm text-text-muted mt-1">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-0">
        
        {/* Today's Overview */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <div className="bg-bg-card rounded-lg border border-border-subtle p-5 flex flex-col sm:flex-row gap-5 shadow-sm">
            <div className="w-full sm:w-1/3 flex flex-col items-center justify-center">
              <h2 className="text-body-md font-semibold text-text-main mb-2 w-full text-center">Task Progress</h2>
              <div className="h-32 w-32 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={progressData}
                      cx="50%" cy="50%"
                      innerRadius={45} outerRadius={60}
                      startAngle={90} endAngle={-270}
                      dataKey="value" stroke="none"
                    >
                      {progressData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-body-lg font-bold text-text-main">{completionRate}%</span>
                </div>
              </div>
              <p className="text-caption text-text-muted mt-2">{completedTasks} of {totalTasks} completed</p>
            </div>
            
            <div className="w-full sm:w-2/3 border-t sm:border-t-0 sm:border-l border-border-subtle pt-5 sm:pt-0 sm:pl-5 flex flex-col">
              <h2 className="text-body-md font-semibold text-text-main mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" /> Today's Schedule
              </h2>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {todaysEvents.length === 0 ? (
                  <p className="text-body-sm text-text-muted italic">No events scheduled for today.</p>
                ) : (
                  todaysEvents.map(event => (
                    <div key={event.id} className="flex gap-3 text-sm">
                      <span className="text-text-muted font-mono whitespace-nowrap">{event.startTime}</span>
                      <div className="w-1 rounded-full" style={{ backgroundColor: event.color || 'var(--color-accent)' }}></div>
                      <span className="text-text-main truncate">{event.title}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-bg-card rounded-lg border border-border-subtle p-5 flex-1 shadow-sm flex flex-col">
            <h2 className="text-body-md font-semibold text-text-main mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-warning" /> Current Active Task
            </h2>
            {activeTask ? (
              <div className="flex items-start gap-4 p-4 rounded-md bg-bg-app border border-border-subtle">
                <button 
                  onClick={() => toggleComplete(activeTask.id, activeTask.status)}
                  className="mt-1 flex-shrink-0 text-text-muted hover:text-accent transition-colors"
                >
                  {activeTask.status === 'Done' ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Circle className="w-5 h-5" />}
                </button>
                <div className="flex-1">
                  <h3 className="text-body-md font-medium text-text-main">{activeTask.title}</h3>
                  {activeTask.description && <p className="text-body-sm text-text-muted mt-1">{activeTask.description}</p>}
                  <div className="flex gap-2 mt-3 text-xs">
                    <span className="px-2 py-0.5 rounded border border-border-subtle bg-bg-card text-text-muted">{activeTask.category}</span>
                    <span className="px-2 py-0.5 rounded border border-border-subtle bg-bg-card text-text-muted">{activeTask.priority}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-text-muted border border-dashed border-border-subtle rounded-md p-6">
                <CheckCircle2 className="w-8 h-8 mb-2 opacity-30" />
                <p>No active tasks right now. You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar Actions */}
        <div className="space-y-5">
          <div className="bg-bg-card rounded-lg border border-border-subtle p-5 shadow-sm">
            <h2 className="text-body-md font-semibold text-text-main mb-3">Quick Add</h2>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setIsTodoModalOpen(true)}
                className="w-full bg-bg-app hover:bg-border-subtle flex items-center justify-between px-4 py-3 rounded-md text-sm border border-border-subtle transition-colors text-text-main group"
              >
                <span className="flex items-center gap-2"><Plus className="w-4 h-4 text-text-muted group-hover:text-text-main transition-colors" /> New Task</span>
                <span className="text-xs text-text-muted border border-border-subtle px-1.5 rounded bg-bg-card shadow-sm">T</span>
              </button>
            </div>
          </div>
          
          <TimerWidget />
          
          <HyperlinkWidget />
        </div>
        
      </div>

      {isTodoModalOpen && <TodoModal isOpen={isTodoModalOpen} onClose={() => setIsTodoModalOpen(false)} todoToEdit={null} />}
    </div>
  );
}
