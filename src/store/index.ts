import { create } from 'zustand';
import { useAuthStore } from '../features/auth/store/useAuthStore';

export const API_URL = 'http://localhost:5001/api';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
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

export type TimerMode = 'Stopwatch' | 'Focus' | 'Break';

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
  timerIsActive: boolean;
  timerSessionName: string;
  setTimerMode: (mode: TimerMode) => void;
  setTimerTime: (time: number | ((prev: number) => number)) => void;
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
  timerMode: 'Stopwatch',
  timerTime: 0,
  timerIsActive: false,
  timerSessionName: 'Deep Work',

  setTimerMode: (mode) => set({ timerMode: mode }),
  setTimerTime: (timeOrUpdater) => set((state) => ({
    timerTime: typeof timeOrUpdater === 'function' ? timeOrUpdater(state.timerTime) : timeOrUpdater
  })),
  setTimerIsActive: (isActive) => set({ timerIsActive: isActive }),
  setTimerSessionName: (name) => set({ timerSessionName: name }),
  
  fetchInitialData: async () => {
    try {
      const [todosRes, eventsRes, linksRes, sessionsRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/tasks`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/events`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/links`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/time-sessions`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/settings`, { headers: getAuthHeaders() })
      ]);
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
  },

  // Settings
  updateSettings: async (updates) => {
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      const updatedSettings = await res.json();
      set({ settings: updatedSettings });
    } catch (e) {
      console.error(e);
    }
  },

  // Todos
  addTodo: async (todo) => {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(todo),
      });
      const newTodo = await res.json();
      set((state) => ({ todos: [newTodo, ...state.todos] }));
    } catch (e) {
      console.error(e);
    }
  },
  updateTodo: async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      const updatedTodo = await res.json();
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? updatedTodo : t)),
      }));
    } catch (e) {
      console.error(e);
    }
  },
  deleteTodo: async (id) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      set((state) => ({
        todos: state.todos.filter((t) => t.id !== id),
      }));
    } catch (e) {
      console.error(e);
    }
  },

  // Events
  addEvent: async (event) => {
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(event),
      });
      const newEvent = await res.json();
      set((state) => ({ events: [newEvent, ...state.events] }));
    } catch (e) {
      console.error(e);
    }
  },
  updateEvent: async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      const updatedEvent = await res.json();
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? updatedEvent : e)),
      }));
    } catch (e) {
      console.error(e);
    }
  },
  deleteEvent: async (id) => {
    try {
      await fetch(`${API_URL}/events/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      }));
    } catch (e) {
      console.error(e);
    }
  },

  // Links
  addLink: async (link) => {
    try {
      const res = await fetch(`${API_URL}/links`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(link),
      });
      const newLink = await res.json();
      set((state) => ({ links: [newLink, ...state.links] }));
    } catch (e) {
      console.error(e);
    }
  },
  updateLink: async (id, updates) => {
    set((state) => ({
      links: state.links.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  },
  deleteLink: async (id) => {
    try {
      await fetch(`${API_URL}/links/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      set((state) => ({
        links: state.links.filter((l) => l.id !== id),
      }));
    } catch (e) {
      console.error(e);
    }
  },

  // Time Sessions
  addTimeSession: async (session) => {
    try {
      const res = await fetch(`${API_URL}/time-sessions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(session),
      });
      const newSession = await res.json();
      set((state) => ({ timeSessions: [newSession, ...state.timeSessions] }));
    } catch (e) {
      console.error(e);
    }
  }
}));
