import { useState } from 'react';
import { useAppStore } from '../../../store';
import { Search, Zap, Link as LinkIcon, Plus, Pencil, X } from 'lucide-react';
import { LinkModal } from '../../link-vault/components/LinkModal';
import { type LinkItem } from '../../../store';

export function HyperlinkWidget() {
  const [search, setSearch] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<LinkItem | null>(null);
  
  const links = useAppStore((state) => state.links) || [];
  const deleteLink = useAppStore((state) => state.deleteLink);

  const filteredLinks = links
    .filter(l => l.title.toLowerCase().includes(search.toLowerCase()) || l.url.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 8); // Only show top 8 in widget

  const getFaviconUrl = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return `https://s2.googleusercontent.com/s2/favicons?domain=${hostname}&sz=64`;
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div 
        className="w-full rounded-xl overflow-hidden shadow-sm border border-border-subtle bg-bg-card relative flex flex-col h-[400px]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-border-subtle backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <LinkIcon className="w-5 h-5 text-green-400" />
            <h2 className="text-body-lg font-semibold text-green-400 tracking-wide">Hyperlink</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setLinkToEdit(null);
                setIsLinkModalOpen(true);
              }}
              className="p-1.5 rounded-md bg-bg-app hover:bg-bg-card-hover text-text-muted hover:text-text-main transition-colors border border-border-subtle"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search your saved links..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-app border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors shadow-inner"
            />
          </div>
        </div>

        {/* Links Grid */}
        <div className="p-4 pt-2 flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 pb-4">
            {filteredLinks.length === 0 ? (
              <div className="col-span-4 text-center py-6 text-text-muted text-sm">
                No links found. Click '+' to add one!
              </div>
            ) : (
              filteredLinks.map(link => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-bg-app border border-border-subtle flex items-center justify-center group-hover:scale-105 group-hover:border-accent transition-all shadow-lg backdrop-blur-sm relative">
                    {getFaviconUrl(link.url) ? (
                      <img src={getFaviconUrl(link.url)} alt={link.title} className="w-8 h-8 rounded" />
                    ) : (
                      <LinkIcon className="w-6 h-6 text-text-muted" />
                    )}
                    
                    {/* Hover Actions */}
                    <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setLinkToEdit(link);
                          setIsLinkModalOpen(true);
                        }}
                        className="w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center text-white shadow-md transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          deleteLink(link.id);
                        }}
                        className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center text-white shadow-md transition-colors"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <span className="text-[10px] text-text-muted group-hover:text-text-main truncate w-full text-center px-1 font-medium transition-colors">
                    {link.title}
                  </span>
                </a>
              ))
            )}
          </div>
        </div>
      </div>

      {isLinkModalOpen && (
        <LinkModal 
          isOpen={isLinkModalOpen} 
          onClose={() => {
            setIsLinkModalOpen(false);
            setLinkToEdit(null);
          }} 
          linkToEdit={linkToEdit}
        />
      )}
    </div>
  );
}
