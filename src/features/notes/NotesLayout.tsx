import { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import { Search, MoreHorizontal, SquarePen, PanelLeft, Pin } from 'lucide-react';
import { EditorPane } from './EditorPane';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

export const NotesLayout = () => {
  const pages = useAppStore((state) => state.pages);
  const addPage = useAppStore((state) => state.addPage);
  
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // We only show top level pages in the grid for now, or flat list
  const filteredPages = useMemo(() => {
    return pages
      .filter(p => !p.parentId) // Only top level for grid
      .filter(p => 
        (p.title?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [pages, searchQuery]);

  const handleCreatePage = async () => {
    const newPage = await addPage({ title: 'Untitled Note', parentId: null });
    if (newPage) {
      setActivePageId(newPage.id);
    }
  };

  // If a page is active, show the editor full-view
  if (activePageId) {
    return (
      <div className="flex-1 h-full flex flex-col relative bg-bg-app">
        <EditorPane 
          key={activePageId} 
          pageId={activePageId} 
          onClose={() => setActivePageId(null)} 
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#1C1C1E] overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-app shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <button className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted transition-colors">
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-col items-center">
          <h2 className="font-semibold text-sm text-text-main leading-tight">Notes</h2>
          <span className="text-xs text-text-muted">{filteredPages.length} notes</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button 
            onClick={handleCreatePage}
            className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted transition-colors"
          >
            <SquarePen className="w-4 h-4" />
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#2C2C2E] text-sm text-text-main rounded-md border border-transparent focus:border-border-subtle focus:outline-none w-48 placeholder:text-text-muted"
            />
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {filteredPages.map((page, index) => {
            const isPinned = index === 0; // Just mock pinning the first note like in screenshot
            const formattedDate = format(new Date(page.updatedAt || page.createdAt), 'dd/MM/yy');

            return (
              <div 
                key={page.id} 
                onClick={() => setActivePageId(page.id)}
                className="flex flex-col gap-3 group cursor-pointer"
              >
                {/* Preview Box */}
                <div className={cn(
                  "h-40 rounded-xl overflow-hidden relative transition-all duration-200",
                  "bg-[#2C2C2E] border-2",
                  isPinned ? "border-yellow-500" : "border-transparent group-hover:border-border-subtle"
                )}>
                  {/* Pinned Icon */}
                  {isPinned && (
                    <div className="absolute top-3 right-3 text-text-muted">
                      <Pin className="w-4 h-4 fill-current rotate-45" />
                    </div>
                  )}

                  {page.coverImage ? (
                    <img src={page.coverImage} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="p-4 w-full h-full text-xs text-text-muted break-words overflow-hidden opacity-70">
                      {/* Fake preview of content if it was flat text. Since it's JSON from blocknote, just render a snippet if possible */}
                      <p className="line-clamp-6 text-left">
                        {page.content?.title || "Empty Note Content"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Title & Date */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center gap-1.5">
                    {page.icon && <span className="text-sm">{page.icon}</span>}
                    <h3 className="text-sm font-medium text-text-main line-clamp-1">
                      {page.title || 'Untitled Note'}
                    </h3>
                  </div>
                  <span className="text-xs text-text-muted mt-0.5">{formattedDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


