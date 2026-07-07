import { create } from 'zustand';
import { useAuthStore } from '../features/auth/store/useAuthStore';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
export const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const apiFetch = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  if (res.status === 401) {
    useAuthStore.getState().logout();
    throw new Error('Unauthorized');
  }
  return res;
};

export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  category: string;
  dueDate?: string;
  status: 'Todo' | 'In Progress' | 'Done' | string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | string;
  completed: boolean;
  createdAt: string;
}

export interface DayEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO String or HH:mm
  endTime: string; // ISO String or HH:mm
  date: string; // YYYY-MM-DD
  color?: string;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  category: string;
  createdAt: string;
}

export interface TimeSession {
  id: string;
  name: string;
  duration: number; // in seconds
  date: string; // ISO string
}

export interface Settings {
  id: string;
  theme: string;
  focusMode: boolean;
}

export type TimerMode = 'Stopwatch' | 'Timer' | 'Focus' | 'Break';

export interface AppState {
  todos: Todo[];
  events: DayEvent[];
  links: LinkItem[];
  timeSessions: TimeSession[];
  settings: Settings | null;
  lastLoginDate: string | null;

  // Global Timer State
  timerMode: TimerMode;
  timerTime: number;
  timerDurations: {
    Timer: number;
    Focus: number;
    Break: number;
  };
  timerIsActive: boolean;
  timerSessionName: string;
  setTimerMode: (mode: TimerMode) => void;
  setTimerTime: (time: number | ((prev: number) => number)) => void;
  setTimerDuration: (mode: TimerMode, duration: number) => void;
  setTimerIsActive: (isActive: boolean) => void;
  setTimerSessionName: (name: string) => void;
  
  // App initialization
  fetchInitialData: () => Promise<void>;
  checkDailyReset: () => void;

  // Settings
  updateSettings: (updates: Partial<Settings>) => Promise<void>;

  // Todos
  addTodo: (todo: Partial<Todo>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  
  // Events
  addEvent: (event: Partial<DayEvent>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<DayEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Links
  addLink: (link: Partial<LinkItem>) => Promise<void>;
  updateLink: (id: string, updates: Partial<LinkItem>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;

  // Time Sessions
  addTimeSession: (session: Partial<TimeSession>) => Promise<void>;
}

export const useAppStore = create<AppState>()((set) => ({
  todos: [],
  events: [],
  links: [],
  timeSessions: [],
  settings: null,
  lastLoginDate: null,

  // Global Timer Initial State
  timerMode: 'Focus', // Changed default to Focus as it's a Focus Timer app
  timerTime: 25 * 60,
  timerDurations: {
    Timer: 10 * 60,
    Focus: 25 * 60,
    Break: 5 * 60,
  },
  timerIsActive: false,
  timerSessionName: 'Deep Work',

  setTimerMode: (mode) => set({ timerMode: mode }),
  setTimerTime: (timeOrUpdater) => set((state) => ({
    timerTime: typeof timeOrUpdater === 'function' ? timeOrUpdater(state.timerTime) : timeOrUpdater
  })),
  setTimerDuration: (mode, duration) => set((state) => ({
    timerDurations: { ...state.timerDurations, [mode]: duration }
  })),
  setTimerIsActive: (isActive) => set({ timerIsActive: isActive }),
  setTimerSessionName: (name) => set({ timerSessionName: name }),
  
  fetchInitialData: async () => {
    try {
      const [todosRes, eventsRes, linksRes, sessionsRes, settingsRes] = await Promise.all([
        apiFetch(`${API_URL}/tasks`, { headers: getAuthHeaders() }),
        apiFetch(`${API_URL}/events`, { headers: getAuthHeaders() }),
        apiFetch(`${API_URL}/links`, { headers: getAuthHeaders() }),
        apiFetch(`${API_URL}/time-sessions`, { headers: getAuthHeaders() }),
        apiFetch(`${API_URL}/settings`, { headers: getAuthHeaders() })
      ]);

      if (!todosRes.ok || !eventsRes.ok || !linksRes.ok || !sessionsRes.ok || !settingsRes.ok) {
        throw new Error('One or more API requests failed');
      }

      const todos = await todosRes.json();
      const events = await eventsRes.json();
      const links = await linksRes.json();
      const timeSessions = await sessionsRes.json();
      const settings = await settingsRes.json();
      set({ todos, events, links, timeSessions, settings });
    } catch (e) {
      console.error('Failed to fetch initial data', e);
    }
  },

  checkDailyReset: () => {
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = localStorage.getItem('workbench_last_login_date');
    
    if (lastLogin !== today) {
      const state = useAppStore.getState();
      const dailyTasks = state.todos.filter(t => t.category === 'Daily' && t.completed);
      
      dailyTasks.forEach(task => {
        state.updateTodo(task.id, { completed: false, status: 'Todo' });
      });
      
      localStorage.setItem('workbench_last_login_date', today);
      set({ lastLoginDate: today });
    }
  },

  // Settings
  updateSettings: async (updates) => {
    let originalSettings: Settings | null = null;
    set((state) => {
      originalSettings = state.settings;
      return { settings: state.settings ? { ...state.settings, ...updates } : updates as Settings };
    });
    
    try {
      const res = await apiFetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      const updatedSettings = await res.json();
      set({ settings: updatedSettings });
    } catch (e) {
      console.error(e);
      if (originalSettings) set({ settings: originalSettings });
    }
  },

  // Todos
  addTodo: async (todo) => {
    const tempId = todo.id || crypto.randomUUID();
    const tempTodo = { ...todo, id: tempId, createdAt: new Date().toISOString() } as Todo;
    set((state) => ({ todos: [tempTodo, ...state.todos] }));
    try {
      const res = await apiFetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(todo),
      });
      if (!res.ok) throw new Error('Failed to create task');
      const newTodo = await res.json();
      set((state) => ({ todos: state.todos.map(t => t.id === tempId ? newTodo : t) }));
    } catch (e) {
      console.error(e);
      set((state) => ({ todos: state.todos.filter(t => t.id !== tempId) }));
    }
  },
  updateTodo: async (id, updates) => {
    let originalTodo: Todo | undefined;
    set((state) => {
      originalTodo = state.todos.find(t => t.id === id);
      return { todos: state.todos.map(t => t.id === id ? { ...t, ...updates } as Todo : t) };
    });
    try {
      const res = await apiFetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update task');
    } catch (e) {
      console.error(e);
      if (originalTodo) set((state) => ({ todos: state.todos.map(t => t.id === id ? originalTodo! : t) }));
    }
  },
  deleteTodo: async (id) => {
    let originalTodo: Todo | undefined;
    set((state) => {
      originalTodo = state.todos.find(t => t.id === id);
      return { todos: state.todos.filter(t => t.id !== id) };
    });
    try {
      const res = await apiFetch(`${API_URL}/tasks/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete task');
    } catch (e) {
      console.error(e);
      if (originalTodo) set((state) => ({ todos: [...state.todos, originalTodo!] }));
    }
  },

  // Events
  addEvent: async (event) => {
    const tempId = event.id || crypto.randomUUID();
    const tempEvent = { ...event, id: tempId, createdAt: new Date().toISOString() } as DayEvent;
    set((state) => ({ events: [tempEvent, ...state.events] }));
    try {
      const res = await apiFetch(`${API_URL}/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(event),
      });
      if (!res.ok) throw new Error('Failed to create event');
      const newEvent = await res.json();
      set((state) => ({ events: state.events.map(e => e.id === tempId ? newEvent : e) }));
    } catch (e) {
      console.error(e);
      set((state) => ({ events: state.events.filter(e => e.id !== tempId) }));
    }
  },
  updateEvent: async (id, updates) => {
    let originalEvent: DayEvent | undefined;
    set((state) => {
      originalEvent = state.events.find(e => e.id === id);
      return { events: state.events.map(e => e.id === id ? { ...e, ...updates } as DayEvent : e) };
    });
    try {
      const res = await apiFetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update event');
    } catch (e) {
      console.error(e);
      if (originalEvent) set((state) => ({ events: state.events.map(e => e.id === id ? originalEvent! : e) }));
    }
  },
  deleteEvent: async (id) => {
    let originalEvent: DayEvent | undefined;
    set((state) => {
      originalEvent = state.events.find(e => e.id === id);
      return { events: state.events.filter(e => e.id !== id) };
    });
    try {
      const res = await apiFetch(`${API_URL}/events/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete event');
    } catch (e) {
      console.error(e);
      if (originalEvent) set((state) => ({ events: [...state.events, originalEvent!] }));
    }
  },

  // Links
  addLink: async (link) => {
    const tempId = link.id || crypto.randomUUID();
    const tempLink = { ...link, id: tempId, createdAt: new Date().toISOString() } as LinkItem;
    set((state) => ({ links: [tempLink, ...state.links] }));
    try {
      const res = await apiFetch(`${API_URL}/links`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(link),
      });
      if (!res.ok) throw new Error('Failed to create link');
      const newLink = await res.json();
      set((state) => ({ links: state.links.map(l => l.id === tempId ? newLink : l) }));
    } catch (e) {
      console.error(e);
      set((state) => ({ links: state.links.filter(l => l.id !== tempId) }));
    }
  },
  updateLink: async (id, updates) => {
    let originalLink: LinkItem | undefined;
    set((state) => {
      originalLink = state.links.find(l => l.id === id);
      return { links: state.links.map(l => l.id === id ? { ...l, ...updates } as LinkItem : l) };
    });
    try {
      const res = await apiFetch(`${API_URL}/links/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update link');
    } catch (e) {
      console.error(e);
      if (originalLink) set((state) => ({ links: state.links.map(l => l.id === id ? originalLink! : l) }));
    }
  },
  deleteLink: async (id) => {
    let originalLink: LinkItem | undefined;
    set((state) => {
      originalLink = state.links.find(l => l.id === id);
      return { links: state.links.filter(l => l.id !== id) };
    });
    try {
      const res = await apiFetch(`${API_URL}/links/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete link');
    } catch (e) {
      console.error(e);
      if (originalLink) set((state) => ({ links: [...state.links, originalLink!] }));
    }
  },

  // Time Sessions
  addTimeSession: async (session) => {
    const tempId = session.id || crypto.randomUUID();
    const tempSession = { ...session, id: tempId, createdAt: new Date().toISOString() } as TimeSession;
    set((state) => ({ timeSessions: [tempSession, ...state.timeSessions] }));
    try {
      const res = await apiFetch(`${API_URL}/time-sessions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(session),
      });
      if (!res.ok) throw new Error('Failed to create session');
      const newSession = await res.json();
      set((state) => ({ timeSessions: state.timeSessions.map(s => s.id === tempId ? newSession : s) }));
    } catch (e) {
      console.error(e);
      set((state) => ({ timeSessions: state.timeSessions.filter(s => s.id !== tempId) }));
    }
  }
}));
