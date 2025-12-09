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
            setDraftContent(editor.getHTML());
        },
        onBlur: () => {
            saveDraft();
        }
    });

    useEffect(() => {
        if (editor && draftContent && editor.getHTML() !== draftContent) {
            // Only update if significantly different to avoid cursor jumps?
            // Actually, if we type, onUpdate sets draftContent.
            // If draftContent changes from outside (AI), we must update editor.
            // We can check if editor is focused. If focused, maybe don't force update unless it's a big change?
            // For now, simple approach:
            if (!editor.isFocused) {
                 editor.commands.setContent(draftContent);
            } else {
                // If focused, it might be the user typing, so onUpdate handles it.
                // But if AI finishes while user is typing? Rare conflict.
                // We'll let user win if typing.
            }
            
            // Force update if isGenerating just finished (which we can't easily tell here without a flag).
            // But draftContent changing is the signal.
            // If user typed, editor.getHTML() == draftContent roughly.
            // If AI updated, draftContent is new.
            // Let's rely on content length diff?
            const current = editor.getHTML();
            if (Math.abs(current.length - draftContent.length) > 10) {
                 editor.commands.setContent(draftContent);
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


