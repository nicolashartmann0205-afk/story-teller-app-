"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useReview } from './review-context';
import { useEffect } from 'react';

export function DraftEditor() {
    const { draftContent, setDraftContent, saveDraft, isGenerating } = useReview();

    const editor = useEditor({
        extensions: [StarterKit],
        content: draftContent,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            // Tiptap returns HTML, but our fallback is Markdown/Plaintext. 
            // We should store what the user sees.
            setDraftContent(editor.getHTML());
        },
        onBlur: () => {
            saveDraft();
        }
    });

    useEffect(() => {
        if (editor && draftContent) {
            const currentHTML = editor.getHTML();
            // Simple check: if content is drastically different, update it.
            // This handles the "Generate Draft" case where draftContent becomes a new large string
            // while preserving small user edits if they match.
            if (currentHTML !== draftContent) {
                 // Force update if we are not focused (external update)
                 // OR if the content is completely different (likely a new generation replacing the old one)
                 const isNewGeneration = Math.abs(currentHTML.length - draftContent.length) > 20;
                 
                 if (!editor.isFocused || isNewGeneration) {
                     // Parse HTML if it looks like HTML (starts with <)
                     if (draftContent.trim().startsWith('<')) {
                         editor.commands.setContent(draftContent, { emitUpdate: true });
                     } else {
                         // Treat as Markdown/Text
                         editor.commands.setContent(draftContent, { emitUpdate: true });
                     }
                 }
            }
        }
    }, [draftContent, editor]);

    if (!editor) return null;

    return (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-2 flex gap-2 bg-zinc-50 dark:bg-zinc-800/50 overflow-x-auto">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-2 py-1 text-sm rounded ${editor.isActive('bold') ? 'bg-zinc-200 dark:bg-zinc-700' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>Bold</button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-2 py-1 text-sm rounded ${editor.isActive('italic') ? 'bg-zinc-200 dark:bg-zinc-700' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>Italic</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`px-2 py-1 text-sm rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-200 dark:bg-zinc-700' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>H1</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 py-1 text-sm rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-200 dark:bg-zinc-700' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>H2</button>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-2 py-1 text-sm rounded ${editor.isActive('bulletList') ? 'bg-zinc-200 dark:bg-zinc-700' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>List</button>
            </div>
            <div className="relative">
                 {isGenerating && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10 backdrop-blur-sm">
                        <div className="text-indigo-600 font-medium animate-pulse">Generating Draft...</div>
                    </div>
                )}
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}


