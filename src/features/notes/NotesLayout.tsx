import { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { Plus, FileText, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { EditorPane } from './EditorPane';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const NotesLayout = () => {
  const pages = useAppStore((state) => state.pages);
  const addPage = useAppStore((state) => state.addPage);
  const deletePage = useAppStore((state) => state.deletePage);
  
  // Find top level pages to check if we have any pages at all
  const topLevelPages = pages.filter(p => !p.parentId);
  const [activePageId, setActivePageId] = useState<string | null>(topLevelPages.length > 0 ? topLevelPages[0].id : null);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentTopLevel = pages.filter(p => !p.parentId);
    const firstTopLevelId = currentTopLevel.length > 0 ? currentTopLevel[0].id : null;

    if (!activePageId && firstTopLevelId) {
      setActivePageId(firstTopLevelId);
    } else if (activePageId && !pages.some(p => p.id === activePageId)) {
      // Fallback if active page was deleted
      setActivePageId(firstTopLevelId);
    }
  }, [pages, activePageId]);

  const handleCreatePage = async (parentId: string | null = null) => {
    const newPage = await addPage({ title: '', parentId });
    if (newPage) {
      setActivePageId(newPage.id);
      if (parentId) {
        setExpandedPages(new Set([...expandedPages, parentId]));
      }
    }
  };

  const toggleExpand = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId);
    } else {
      newExpanded.add(pageId);
    }
    setExpandedPages(newExpanded);
  };

  const renderPageTree = (parentId: string | null = null, level: number = 0) => {
    const childPages = pages.filter(p => p.parentId === parentId);
    
    return childPages.map(page => {
      const hasChildren = pages.some(p => p.parentId === page.id);
      const isExpanded = expandedPages.has(page.id);
      const isActive = activePageId === page.id;

      return (
        <div key={page.id} className="w-full">
          <div 
            onClick={() => setActivePageId(page.id)}
            className={cn(
              "group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer text-sm font-medium transition-colors my-0.5",
              isActive ? "bg-bg-card text-text-main" : "text-text-muted hover:bg-bg-hover hover:text-text-main"
            )}
            style={{ paddingLeft: `${(level * 12) + 8}px` }}
          >
            <div className="flex items-center gap-2 truncate">
              {hasChildren ? (
                <button onClick={(e) => toggleExpand(e, page.id)} className="p-0.5 rounded-sm hover:bg-bg-subtle text-text-muted">
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <div className="w-[18px] h-[18px]" /> // Spacer
              )}
              {page.icon ? (
                <span className="w-4 h-4 text-center text-xs leading-none">{page.icon}</span>
              ) : (
                <FileText className="w-4 h-4 text-text-muted flex-shrink-0" />
              )}
              <span className="truncate">{page.title || 'Untitled'}</span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreatePage(page.id);
                }} 
                className="p-1 rounded hover:bg-bg-subtle text-text-muted hover:text-text-main"
                title="Add subpage"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this page?')) {
                    deletePage(page.id);
                    if (activePageId === page.id) setActivePageId(null);
                  }
                }} 
                className="p-1 rounded hover:bg-red-500/20 text-text-muted hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {hasChildren && isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {renderPageTree(page.id, level + 1)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg-app">
      {/* Secondary Sidebar for Pages */}
      <div className="w-64 border-r border-border-subtle bg-[#1C1C1E]/50 flex flex-col h-full flex-shrink-0 backdrop-blur-md">
        <div className="p-4 flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-text-muted">Private Pages</h2>
          <button 
            onClick={() => handleCreatePage(null)}
            className="p-1 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-main transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {pages.length === 0 ? (
            <div className="text-center p-4 mt-10">
              <p className="text-sm text-text-muted mb-4">No pages yet.</p>
              <button 
                onClick={() => handleCreatePage(null)}
                className="text-sm bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-xl font-medium transition-colors"
              >
                Create Page
              </button>
            </div>
          ) : (
            renderPageTree(null, 0)
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto bg-bg-app relative">
        {activePageId ? (
          <EditorPane key={activePageId} pageId={activePageId} />
        ) : (
          <div className="h-full flex items-center justify-center text-text-muted flex-col bg-bg-app/50 backdrop-blur-sm">
            <FileText className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-lg font-medium opacity-50">Select or create a page</p>
          </div>
        )}
      </div>
    </div>
  );
};

