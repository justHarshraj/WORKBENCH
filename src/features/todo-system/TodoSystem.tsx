import { useState } from 'react';
import { useAppStore, type Todo } from '../../store';
import { Plus, Search, Filter, CheckCircle2, Circle, Clock } from 'lucide-react';
import { TodoModal } from './components/TodoModal';

export function TodoSystem() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<'All' | 'Todo' | 'In Progress' | 'Done'>('All');
  const [search, setSearch] = useState('');

  const todos = useAppStore((state) => state.todos) || [];
  const updateTodo = useAppStore((state) => state.updateTodo);
  const deleteTodo = useAppStore((state) => state.deleteTodo);

  const filteredTodos = todos
    .filter(t => filter === 'All' || t.status === filter)
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingTodo(null);
    setIsModalOpen(true);
  };

  const toggleComplete = (todo: Todo) => {
    const newStatus = todo.status === 'Done' ? 'Todo' : 'Done';
    updateTodo(todo.id, { 
      status: newStatus,
      completed: newStatus === 'Done'
    });
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'Critical': return 'text-error';
      case 'High': return 'text-warning';
      case 'Medium': return 'text-accent';
      default: return 'text-text-muted';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 max-w-5xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-md text-text-main">Smart Todo System</h1>
          <p className="text-body-sm text-text-muted mt-1">Manage your tasks efficiently.</p>
        </div>
        
        <button 
          onClick={handleAddNew}
          className="bg-text-main text-bg-app px-4 py-2 rounded-pill text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-bg-card p-4 rounded-md border border-border-subtle">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-app border border-border-subtle rounded-sm pl-9 pr-4 py-2 text-sm text-text-main focus:outline-none focus:border-text-muted transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-text-muted hidden md:block" />
          {['All', 'Todo', 'In Progress', 'Done'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1.5 rounded-pill text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f ? 'bg-text-main text-bg-app' : 'bg-bg-app text-text-muted hover:text-text-main border border-border-subtle'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Todo List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12 text-text-muted bg-bg-card rounded-lg border border-border-subtle">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No tasks found in this view.</p>
          </div>
        ) : (
          filteredTodos.map(todo => (
            <div 
              key={todo.id} 
              className={`flex items-start gap-4 p-4 rounded-md bg-bg-card border transition-colors group ${
                todo.status === 'Done' ? 'border-border-subtle opacity-60' : 'border-border-subtle hover:border-text-muted'
              }`}
            >
              <button 
                onClick={() => toggleComplete(todo)}
                className="mt-1 flex-shrink-0 text-text-muted hover:text-accent transition-colors"
              >
                {todo.status === 'Done' ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Circle className="w-5 h-5" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-body-md font-medium truncate ${todo.status === 'Done' ? 'line-through text-text-muted' : 'text-text-main'}`}>
                    {todo.title}
                  </h3>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-border-subtle ${getPriorityColor(todo.priority)}`}>
                    {todo.priority}
                  </span>
                </div>
                {todo.description && (
                  <p className="text-body-sm text-text-muted truncate">{todo.description}</p>
                )}
                <div className="flex items-center gap-3 mt-3 text-caption text-text-muted">
                  <span className="bg-bg-app px-2 py-0.5 rounded border border-border-subtle">{todo.category}</span>
                  {todo.dueDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {todo.dueDate}
                    </div>
                  )}
                  <span>Status: {todo.status}</span>
                </div>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => handleEdit(todo)} className="text-xs text-text-muted hover:text-text-main">Edit</button>
                <button onClick={() => deleteTodo(todo.id)} className="text-xs text-error hover:text-error-deep">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <TodoModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          todoToEdit={editingTodo}
        />
      )}
    </div>
  );
}
