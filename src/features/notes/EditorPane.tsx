import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../../store';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { Image, Smile } from 'lucide-react';
import { API_URL } from '../../store';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

interface EditorPaneProps {
  pageId: string;
}

export const EditorPane = ({ pageId }: EditorPaneProps) => {
  const pages = useAppStore((state) => state.pages);
  const updatePage = useAppStore((state) => state.updatePage);
  const token = useAuthStore((state) => state.token);
  
  const page = pages.find((p) => p.id === pageId);
  const [title, setTitle] = useState(page?.title || '');
  const [icon, setIcon] = useState(page?.icon || '');
  const [coverImage, setCoverImage] = useState(page?.coverImage || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Ref for debouncing
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch full page content on mount
  const [initialContent, setInitialContent] = useState<string | undefined | null>(undefined);

  useEffect(() => {
    let isMounted = true;
    const fetchPageContent = async () => {
      try {
        const res = await fetch(`${API_URL}/pages/${pageId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch page');
        const data = await res.json();
        if (isMounted) {
          setInitialContent(data.content);
          setTitle(data.title);
          setIcon(data.icon || '');
          setCoverImage(data.coverImage || '');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPageContent();
    return () => { isMounted = false; };
  }, [pageId, token]);

  const editor = useCreateBlockNote({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
  }, [initialContent !== undefined]);

  const handleUpdate = (updates: any) => {
    setIsSaving(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(async () => {
      await updatePage(pageId, updates);
      setIsSaving(false);
    }, 1000);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    handleUpdate({ title: e.target.value });
  };

  const handleEditorChange = () => {
    if (!editor) return;
    const content = JSON.stringify(editor.document);
    handleUpdate({ content });
  };

  if (initialContent === undefined || editor === undefined) {
    return <div className="p-8 text-text-muted">Loading editor...</div>;
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col relative bg-bg-app">
      {/* Cover Image */}
      {coverImage ? (
        <div className="w-full h-48 relative group">
          <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button 
              onClick={() => {
                const url = prompt('Enter new cover image URL:');
                if (url) {
                  setCoverImage(url);
                  handleUpdate({ coverImage: url });
                }
              }}
              className="bg-bg-card/80 backdrop-blur text-text-main text-xs px-3 py-1.5 rounded-md border border-border-subtle"
            >
              Change cover
            </button>
            <button 
              onClick={() => {
                setCoverImage('');
                handleUpdate({ coverImage: '' });
              }}
              className="bg-bg-card/80 backdrop-blur text-text-main text-xs px-3 py-1.5 rounded-md border border-border-subtle"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="h-20" /> // Spacer when no cover
      )}

      <div className="max-w-4xl mx-auto w-full px-8 pb-32">
        {/* Page Header (Icon & Title) */}
        <div className="mb-8 group">
          {icon && (
            <div className="text-6xl mb-4 relative w-max -mt-12 z-10 group/icon">
              {icon}
              <button 
                onClick={() => {
                  setIcon('');
                  handleUpdate({ icon: '' });
                }}
                className="absolute -top-2 -right-2 bg-bg-card border border-border-subtle rounded-full p-1 opacity-0 group-hover/icon:opacity-100 transition-opacity"
              >
                <span className="text-xs text-text-muted px-1">Remove</span>
              </button>
            </div>
          )}

          {!icon || !coverImage ? (
            <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity mb-2 text-text-muted text-sm font-medium">
              {!icon && (
                <button 
                  onClick={() => {
                    const newIcon = prompt('Enter an emoji:');
                    if (newIcon) {
                      setIcon(newIcon);
                      handleUpdate({ icon: newIcon });
                    }
                  }}
                  className="flex items-center gap-1.5 hover:bg-bg-hover px-2 py-1 rounded transition-colors"
                >
                  <Smile className="w-4 h-4" /> Add icon
                </button>
              )}
              {!coverImage && (
                <button 
                  onClick={() => {
                    const url = prompt('Enter cover image URL:');
                    if (url) {
                      setCoverImage(url);
                      handleUpdate({ coverImage: url });
                    }
                  }}
                  className="flex items-center gap-1.5 hover:bg-bg-hover px-2 py-1 rounded transition-colors"
                >
                  <Image className="w-4 h-4" /> Add cover
                </button>
              )}
            </div>
          ) : null}

          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="text-4xl font-bold bg-transparent border-none outline-none w-full text-text-main placeholder-text-muted/30"
          />
        </div>

        {/* Editor Body */}
        <div className="editor-container" data-color-scheme="dark">
          <BlockNoteView 
            editor={editor} 
            onChange={handleEditorChange}
            theme="dark"
          />
        </div>
        
        {/* Save indicator */}
        <div className="fixed bottom-4 right-4 text-xs text-text-muted bg-bg-card/80 backdrop-blur px-3 py-1.5 rounded-full border border-border-subtle">
          {isSaving ? 'Saving...' : 'All changes saved'}
        </div>
      </div>
    </div>
  );
};

