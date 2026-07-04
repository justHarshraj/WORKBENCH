import { useState } from 'react';
import { useAppStore, type DayEvent } from '../../store';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { EventModal } from './components/EventModal';

export function DayPlanner() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'timeline' | 'calendar'>('timeline');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DayEvent | null>(null);

  const events = useAppStore((state) => state.events) || [];
  const deleteEvent = useAppStore((state) => state.deleteEvent);

  const todaysEvents = events.filter((e) => e.date === format(currentDate, 'yyyy-MM-dd'))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const handleEdit = (event: DayEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full space-y-5 max-w-5xl mx-auto p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-md text-text-main">Day Planner</h1>
          <p className="text-body-sm text-text-muted mt-1">Organize your time effectively.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-bg-card p-1 rounded-pill border border-border-subtle w-fit">
          <button
            onClick={() => setView('timeline')}
            className={`px-4 py-1.5 rounded-pill text-sm font-medium transition-colors flex items-center gap-2 ${
              view === 'timeline' ? 'bg-text-main text-bg-app' : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Clock className="w-4 h-4" /> Timeline
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-1.5 rounded-pill text-sm font-medium transition-colors flex items-center gap-2 ${
              view === 'calendar' ? 'bg-text-main text-bg-app' : 'text-text-muted hover:text-text-main'
            }`}
          >
            <CalendarIcon className="w-4 h-4" /> Calendar
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-bg-card rounded-md p-3 md:p-4 border border-border-subtle">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentDate(addDays(currentDate, -1))} className="p-2 hover:bg-bg-app rounded-full transition-colors text-text-muted hover:text-text-main">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center min-w-[150px]">
            <h2 className="text-body-lg font-medium text-text-main">{format(currentDate, 'EEEE')}</h2>
            <p className="text-caption text-text-muted">{format(currentDate, 'MMMM d, yyyy')}</p>
          </div>
          <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:bg-bg-app rounded-full transition-colors text-text-muted hover:text-text-main">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-text-main text-bg-app px-4 py-2 rounded-pill text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-bg-card rounded-lg border border-border-subtle p-4 md:p-6 overflow-y-auto">
        {view === 'timeline' ? (
          <div className="space-y-4">
            {todaysEvents.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No events scheduled for this day.</p>
              </div>
            ) : (
              todaysEvents.map(event => (
                <div key={event.id} className="flex gap-4 p-4 rounded-md bg-bg-app border border-border-subtle group hover:border-text-muted transition-colors">
                  <div className="min-w-[100px] text-right">
                    <p className="text-body-md font-medium text-text-main">{event.startTime}</p>
                    <p className="text-caption text-text-muted">{event.endTime}</p>
                  </div>
                  <div className="w-1 bg-accent rounded-full opacity-50" style={{ backgroundColor: event.color || 'var(--color-accent)' }}></div>
                  <div className="flex-1">
                    <h3 className="text-body-md font-medium text-text-main">{event.title}</h3>
                    {event.description && <p className="text-body-sm text-text-muted mt-1">{event.description}</p>}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                    <button onClick={() => handleEdit(event)} className="text-xs text-text-muted hover:text-text-main">Edit</button>
                    <button onClick={() => deleteEvent(event.id)} className="text-xs text-error hover:text-error-deep">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="grid grid-cols-7 gap-2 min-w-[700px]">
              {weekDays.map((day, i) => (
                <div 
                  key={i} 
                  onClick={() => setCurrentDate(day)}
                  className={`p-4 border rounded-md cursor-pointer transition-colors ${
                    isSameDay(day, currentDate) 
                      ? 'border-accent bg-bg-app' 
                      : 'border-border-subtle hover:border-text-muted bg-bg-app'
                  }`}
                >
                  <div className="text-caption text-text-muted mb-1">{format(day, 'EEE')}</div>
                  <div className={`text-body-lg font-medium ${isSameDay(day, new Date()) ? 'text-accent' : 'text-text-main'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="mt-4 space-y-1">
                    {events
                      .filter(e => e.date === format(day, 'yyyy-MM-dd'))
                      .map(e => (
                        <div key={e.id} className="text-xs truncate bg-bg-card p-1 rounded" style={{ borderLeft: `2px solid ${e.color || 'var(--color-accent)'}`}}>
                          {e.title}
                        </div>
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <EventModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          selectedDate={currentDate}
          eventToEdit={editingEvent}
        />
      )}
    </div>
  );
}
