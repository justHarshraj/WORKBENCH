import { useAppStore } from '../../store';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';
import { Activity, Target, CheckCircle2, Timer, Brain } from 'lucide-react';

export function Statistics() {
  const todos = useAppStore((state) => state.todos) || [];
  const timeSessions = useAppStore((state) => state.timeSessions) || [];

  // Tasks Logic
  const totalTasks = todos.length;
  const completedTasks = todos.filter(t => t.status === 'Done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Timer Logic
  const totalFocusSeconds = timeSessions.reduce((acc, curr) => acc + curr.duration, 0);
  const totalFocusHours = Math.floor(totalFocusSeconds / 3600);
  const totalFocusMins = Math.floor((totalFocusSeconds % 3600) / 60);
  const formattedFocusTime = totalFocusHours > 0 
    ? `${totalFocusHours}h ${totalFocusMins}m`
    : `${totalFocusMins}m`;

  const subjectMap = timeSessions.reduce((acc, curr) => {
    acc[curr.name] = (acc[curr.name] || 0) + curr.duration;
    return acc;
  }, {} as Record<string, number>);
  
  let topSubject = 'No Data';
  let maxTime = 0;
  Object.entries(subjectMap).forEach(([name, time]) => {
    if (time > maxTime) {
      maxTime = time;
      topSubject = name;
    }
  });

  const timeDistributionData = Object.entries(subjectMap).map(([name, time]) => ({
    name,
    time: Math.round(time / 60) // in minutes
  })).sort((a, b) => b.time - a.time).slice(0, 5);

  if (timeDistributionData.length === 0) {
    timeDistributionData.push({ name: 'No Data', time: 1 });
  }

  // Area Chart: Tasks completed per day over the last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => format(subDays(new Date(), 6 - i), 'MM/dd'));
  const completionData = last7Days.map(date => {
    const completedOnThisDay = todos.filter(t => t.status === 'Done' && t.createdAt && format(new Date(t.createdAt), 'MM/dd') === date).length;
    return { name: date, completed: completedOnThisDay };
  });

  const hasCompletionData = completionData.some(d => d.completed > 0);

  // Pie Chart: Tasks by Priority
  const priorityData = [
    { name: 'Critical', value: todos.filter(t => t.priority === 'Critical').length, color: 'var(--color-error)' },
    { name: 'High', value: todos.filter(t => t.priority === 'High').length, color: 'var(--color-warning)' },
    { name: 'Medium', value: todos.filter(t => t.priority === 'Medium').length, color: 'var(--color-accent)' },
    { name: 'Low', value: todos.filter(t => t.priority === 'Low').length, color: 'var(--color-text-muted)' },
  ].filter(d => d.value > 0);

  if (priorityData.length === 0) {
    priorityData.push({ name: 'No Data', value: 1, color: 'var(--color-border-subtle)' });
  }

  const hasTimeData = timeDistributionData.some(d => d.name !== 'No Data');

  return (
    <div className="flex flex-col h-full space-y-8 max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-display-md text-text-main">Productivity Statistics</h1>
        <p className="text-body-sm text-text-muted mt-1">Analyze your workflow and focus patterns.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-bg-card border border-border-subtle p-5 rounded-xl shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-text-muted">
            <Target className="w-4 h-4 text-accent" />
            <span className="text-caption">Total Tasks</span>
          </div>
          <p className="text-display-md text-text-main font-semibold">{totalTasks}</p>
        </div>
        
        <div className="bg-bg-card border border-border-subtle p-5 rounded-xl shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-text-muted">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="text-caption">Completed</span>
          </div>
          <p className="text-display-md text-text-main font-semibold">{completedTasks}</p>
        </div>
        
        <div className="bg-bg-card border border-border-subtle p-5 rounded-xl shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-text-muted">
            <Activity className="w-4 h-4 text-warning" />
            <span className="text-caption">Win Rate</span>
          </div>
          <p className="text-display-md text-text-main font-semibold">{completionRate}%</p>
        </div>

        <div className="bg-bg-card border border-border-subtle p-5 rounded-xl shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-text-muted">
            <Timer className="w-4 h-4 text-blue-400" />
            <span className="text-caption">Focus Time</span>
          </div>
          <p className="text-display-md text-text-main font-semibold">{formattedFocusTime}</p>
        </div>

        <div className="bg-bg-card border border-border-subtle p-5 rounded-xl shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-text-muted">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-caption">Top Subject</span>
          </div>
          <p className="text-body-lg text-text-main font-semibold truncate mt-1" title={topSubject}>{topSubject}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* Completion History */}
        <div className="bg-bg-card border border-border-subtle p-6 rounded-xl flex flex-col shadow-sm">
          <h2 className="text-body-lg font-medium text-text-main mb-6">Completion History (7 Days)</h2>
          {hasCompletionData ? (
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={completionData}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-subtle)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-accent)' }}
                  />
                  <Area type="monotone" dataKey="completed" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted min-h-[250px]">
              <CheckCircle2 className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-body-sm">No completions yet this week.</p>
              <p className="text-caption mt-1 opacity-70">Complete some tasks to see your trends!</p>
            </div>
          )}
        </div>

        {/* Time Distribution */}
        <div className="bg-bg-card border border-border-subtle p-6 rounded-xl flex flex-col shadow-sm">
          <h2 className="text-body-lg font-medium text-text-main mb-6">Time Spent (Minutes)</h2>
          {hasTimeData ? (
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeDistributionData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'var(--color-border-subtle)', opacity: 0.2 }}
                    contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-subtle)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-blue-400)' }}
                  />
                  <Bar dataKey="time" fill="#60A5FA" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted min-h-[250px]">
              <Timer className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-body-sm">No focus sessions recorded.</p>
              <p className="text-caption mt-1 opacity-70">Start a timer to begin tracking!</p>
            </div>
          )}
        </div>

        {/* Tasks by Priority (Moved to bottom or 3rd item if using 3 cols, let's keep it clean as 3rd block spanning full if needed, or replace pie chart? User might like priority pie. Let's add it below) */}
        <div className="bg-bg-card border border-border-subtle p-6 rounded-xl flex flex-col shadow-sm lg:col-span-2">
          <h2 className="text-body-lg font-medium text-text-main mb-6 text-center">Tasks by Priority</h2>
          <div className="w-full flex items-center justify-center h-[250px]">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-subtle)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-text-main)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            {priorityData.map(entry => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-body-sm text-text-main font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
