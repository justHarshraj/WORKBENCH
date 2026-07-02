import { useState, useEffect } from 'react';
import { useAppStore, type Todo } from '../../../store';
import { X } from 'lucide-react';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  todoToEdit: Todo | null;
}

export function TodoModal({ isOpen, onClose, todoToEdit }: TodoModalProps) {
  const addTodo = useAppStore((state) => state.addTodo);
  const updateTodo = useAppStore((state) => state.updateTodo);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'Todo' | 'In Progress' | 'Done'>('Todo');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (todoToEdit) {
      setTitle(todoToEdit.title);
      setDescription(todoToEdit.description || '');
      setPriority(todoToEdit.priority as 'Low' | 'Medium' | 'High' | 'Critical');
      setCategory(todoToEdit.category);
      setStatus(todoToEdit.status as 'Todo' | 'In Progress' | 'Done');
      setDueDate(todoToEdit.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setCategory('General');
      setStatus('Todo');
      setDueDate('');
    }
  }, [todoToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category) return;

    if (todoToEdit) {
      updateTodo(todoToEdit.id, {
        title,
        description,
        priority,
        category,
        status,
        dueDate,
        completed: status === 'Done'
      });
    } else {
      addTodo({
        id: crypto.randomUUID(),
        title,
        description,
        priority,
        category,
        status,
        dueDate,
        completed: status === 'Done',
        createdAt: new Date().toISOString()
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-app/80 backdrop-blur-sm p-4">
      <div className="bg-bg-card border border-border-subtle rounded-lg w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border-subtle">
          <h2 className="text-body-lg font-medium text-text-main">
            {todoToEdit ? 'Edit Task' : 'Add Task'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-caption text-text-muted mb-1">Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-bg-app border border-border-subtle rounded-sm px-3 py-2 text-body-sm text-text-main focus:outline-none focus:border-text-muted"
              placeholder="Design landing page"
              required
            />
          </div>
          
          <div>
            <label className="block text-caption text-text-muted mb-1">Description (Optional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-bg-app border border-border-subtle rounded-sm px-3 py-2 text-body-sm text-text-main focus:outline-none focus:border-text-muted h-20 resize-none"
              placeholder="Include sections for features and pricing..."
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-caption text-text-muted mb-1">Priority</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-bg-app border border-border-subtle rounded-sm px-3 py-2 text-body-sm text-text-main focus:outline-none focus:border-text-muted appearance-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-caption text-text-muted mb-1">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-bg-app border border-border-subtle rounded-sm px-3 py-2 text-body-sm text-text-main focus:outline-none focus:border-text-muted appearance-none"
                required
              >
                <option value="General">General</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Health">Health</option>
                <option value="Daily">Daily</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-caption text-text-muted mb-1">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-bg-app border border-border-subtle rounded-sm px-3 py-2 text-body-sm text-text-main focus:outline-none focus:border-text-muted appearance-none"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-caption text-text-muted mb-1">Deadline (Optional)</label>
              <input 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-bg-app border border-border-subtle rounded-sm px-3 py-2 text-body-sm text-text-main focus:outline-none focus:border-text-muted"
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-pill text-sm font-medium bg-bg-app text-text-main hover:bg-bg-card transition-colors border border-border-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-pill text-sm font-medium bg-text-main text-bg-app hover:opacity-90 transition-opacity"
            >
              {todoToEdit ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
