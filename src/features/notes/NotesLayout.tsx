import { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { Plus, FileText, ChevronRight, ChevronDown, Trash2, GripVertical } from 'lucide-react';
import { EditorPane } from './EditorPane';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PageNodeProps {
  page: any;
  level: number;
  isActive: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  setActivePageId: (id: string) => void;
  toggleExpand: (e: React.MouseEvent, id: string) => void;
  handleCreatePage: (parentId: string | null) => void;
  deletePage: (id: string) => void;
  renderPageTree: (parentId: string | null, level: number) => React.ReactNode;
}

const PageNode = ({ page, level, isActive, isExpanded, hasChildren, setActivePageId, toggleExpand, handleCreatePage, deletePage, renderPageTree }: PageNodeProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div className="w-full" ref={setNodeRef} style={style}>
      <div 
        onClick={() => setActivePageId(page.id)}
        className={cn(
          "group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer text-sm font-medium transition-colors my-0.5",
          isActive ? "bg-bg-card text-text-main" : "text-text-muted hover:bg-bg-hover hover:text-text-main"
        )}
        style={{ paddingLeft: `${(level * 12) + 8}px` }}
      >
        <div className="flex items-center gap-1.5 truncate flex-1">
          <div {...attributes} {...listeners} className="cursor-grab hover:bg-bg-subtle p-0.5 rounded text-text-muted/50 hover:text-text-main opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          {hasChildren ? (
            <button onClick={(e) => toggleExpand(e, page.id)} className="p-0.5 rounded-sm hover:bg-bg-subtle text-text-muted">
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="w-[18px] h-[18px]" /> // Spacer
          )}
          {page.icon ? (
            <span className="w-4 h-4 text-center text-xs leading-none flex-shrink-0">{page.icon}</span>
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
                if (isActive) setActivePageId('');
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
            className="overflow-hidden relative"
          >
            <div className="absolute left-[21px] top-0 bottom-0 w-[1px] bg-border-subtle group-hover:bg-border-main transition-colors" style={{ marginLeft: `${level * 12}px` }} />
            {renderPageTree(page.id, level + 1)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const NotesLayout = () => {
  const pages = useAppStore((state) => state.pages);
  const addPage = useAppStore((state) => state.addPage);
  const deletePage = useAppStore((state) => state.deletePage);
  const movePage = useAppStore((state) => state.movePage);
  
  const topLevelPages = pages.filter(p => !p.parentId).sort((a,b) => (a.rank > b.rank ? 1 : -1));
  const [activePageId, setActivePageId] = useState<string | null>(topLevelPages.length > 0 ? topLevelPages[0].id : null);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    const currentTopLevel = pages.filter(p => !p.parentId);
    const firstTopLevelId = currentTopLevel.length > 0 ? currentTopLevel[0].id : null;

    if (!activePageId && firstTopLevelId) {
      setActivePageId(firstTopLevelId);
    } else if (activePageId && !pages.some(p => p.id === activePageId)) {
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
    if (newExpanded.has(pageId)) newExpanded.delete(pageId);
    else newExpanded.add(pageId);
    setExpandedPages(newExpanded);
  };

  const renderPageTree = (parentId: string | null = null, level: number = 0) => {
    const childPages = pages
      .filter(p => p.parentId === parentId)
      .sort((a, b) => (a.rank > b.rank ? 1 : -1));
      
    if (childPages.length === 0) return null;

    return (
      <SortableContext items={childPages.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div className="w-full relative">
          {childPages.map(page => (
            <PageNode 
              key={page.id}
              page={page}
              level={level}
              isActive={activePageId === page.id}
              isExpanded={expandedPages.has(page.id)}
              hasChildren={pages.some(p => p.parentId === page.id)}
              setActivePageId={setActivePageId}
              toggleExpand={toggleExpand}
              handleCreatePage={handleCreatePage}
              deletePage={deletePage}
              renderPageTree={renderPageTree}
            />
          ))}
        </div>
      </SortableContext>
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activePage = pages.find(p => p.id === active.id);
    const overPage = pages.find(p => p.id === over.id);
    
    if (!activePage || !overPage) return;

    // Check if dragging within the same list (reordering)
    if (activePage.parentId === overPage.parentId) {
      const siblings = pages
        .filter(p => p.parentId === activePage.parentId)
        .sort((a, b) => (a.rank > b.rank ? 1 : -1));
        
      const oldIndex = siblings.findIndex(p => p.id === active.id);
      const newIndex = siblings.findIndex(p => p.id === over.id);
      
      let previousRank = null;
      let nextRank = null;

      if (newIndex > oldIndex) {
        previousRank = siblings[newIndex].rank;
        nextRank = siblings[newIndex + 1]?.rank || null;
      } else {
        previousRank = siblings[newIndex - 1]?.rank || null;
        nextRank = siblings[newIndex].rank;
      }

      movePage(active.id as string, activePage.parentId || null, previousRank, nextRank);
    } else {
      // In a real SortableTree, we'd handle dropping across different depths. 
      // For now, if we drop on a different item, we make it a child of its parent (same level)
      // or we could make it a child of the overPage. 
      // To keep it simple, we just append it to the overPage's parent list.
      const siblings = pages
        .filter(p => p.parentId === overPage.parentId)
        .sort((a, b) => (a.rank > b.rank ? 1 : -1));
        
      const newIndex = siblings.findIndex(p => p.id === over.id);
      const previousRank = siblings[newIndex - 1]?.rank || null;
      const nextRank = siblings[newIndex].rank || null;

      movePage(active.id as string, overPage.parentId || null, previousRank, nextRank);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
    </DndContext>
  );
};

