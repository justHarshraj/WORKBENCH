import React, { useState, useEffect } from 'react';
import { useAppStore, type LinkItem } from '../../../store';
import { X } from 'lucide-react';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkToEdit?: LinkItem | null;
}

export function LinkModal({ isOpen, onClose, linkToEdit }: LinkModalProps) {
  const addLink = useAppStore((state) => state.addLink);
  const updateLink = useAppStore((state) => state.updateLink);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (linkToEdit) {
      setTitle(linkToEdit.title);
      setUrl(linkToEdit.url);
      setCategory(linkToEdit.category);
    } else {
      setTitle('');
      setUrl('');
      setCategory('');
    }
  }, [linkToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    // Basic URL format check
    let finalUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      finalUrl = 'https://' + url;
    }

    if (linkToEdit) {
      updateLink(linkToEdit.id, { title, url: finalUrl, category });
    } else {
      addLink({
        id: crypto.randomUUID(),
        title,
        url: finalUrl,
        category,
        createdAt: new Date().toISOString()
      });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-app/80 backdrop-blur-sm p-4">
      <div className="bg-bg-card border border-border-subtle rounded-lg w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border-subtle">
          <h2 className="text-body-lg font-medium text-text-main">{linkToEdit ? 'Edit Link' : 'Add New Link'}</h2>
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
              placeholder="Framer Motion Docs"
              required
            />
          </div>
          
          <div>
            <label className="block text-caption text-text-muted mb-1">URL</label>
            <input 
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-bg-app border border-border-subtle rounded-sm px-3 py-2 text-body-sm text-text-main focus:outline-none focus:border-text-muted"
              placeholder="https://framer.com/motion"
              required
            />
          </div>
          
          <div>
            <label className="block text-caption text-text-muted mb-1">Category (Optional)</label>
            <input 
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-bg-app border border-border-subtle rounded-sm px-3 py-2 text-body-sm text-text-main focus:outline-none focus:border-text-muted"
              placeholder="e.g. Design, Development, Reading"
            />
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
              {linkToEdit ? 'Save Changes' : 'Add Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
