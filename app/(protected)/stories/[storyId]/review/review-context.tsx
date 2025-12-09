"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { saveStoryDraft, generateDraftAction, improveTextAction, recordExport } from "./actions";
import { exportStory as exportFile } from "@/lib/export";

interface ReviewContextType {
  storyId: string;
  story: any;
  scenes: any[];
  draftContent: string;
  setDraftContent: (content: string) => void;
  isGenerating: boolean;
  generateDraft: (options: any) => Promise<void>;
  saveDraft: () => Promise<void>;
  exportStory: (format: "pdf" | "docx" | "md" | "txt") => Promise<void>;
  improveText: (text: string, type: any) => Promise<string>;
}

const ReviewContext = createContext<ReviewContextType | null>(null);

export function ReviewProvider({ 
    children, 
    storyId, 
    story, 
    scenes 
}: { 
    children: ReactNode, 
    storyId: string, 
    story: any, 
    scenes: any[] 
}) {
    // Initialize with story.draftContent. If it's JSON object (from old saves?), stringify it?
    // Assume it's string (HTML or Markdown) for now.
    const [draftContent, setDraftContent] = useState<string>(
        typeof story.draftContent === 'string' ? story.draftContent : 
        (story.draftContent ? JSON.stringify(story.draftContent) : "")
    );
    const [isGenerating, setIsGenerating] = useState(false);

    const generateDraft = async (options: any) => {
        setIsGenerating(true);
        try {
            const draft = await generateDraftAction(storyId, options);
            setDraftContent(draft);
            await saveStoryDraft(storyId, draft); // Auto save
        } finally {
            setIsGenerating(false);
        }
    };

    const saveDraft = async () => {
        await saveStoryDraft(storyId, draftContent);
    };

    const improveText = async (text: string, type: any) => {
        return await improveTextAction(text, type);
    };

    const exportStoryHandler = async (format: "pdf" | "docx" | "md" | "txt") => {
         // Prepare content: if HTML, strip tags for simple formats, or handle accordingly.
         let contentToExport = draftContent;
         if (draftContent.trim().startsWith("<")) {
            const tmp = document.createElement("DIV");
            tmp.innerHTML = draftContent;
            contentToExport = tmp.textContent || tmp.innerText || "";
         }

         await exportFile(story.title, contentToExport, format);
         await recordExport(storyId, format);
    };

    return (
        <ReviewContext.Provider value={{
            storyId,
            story,
            scenes,
            draftContent,
            setDraftContent,
            isGenerating,
            generateDraft,
            saveDraft,
            exportStory: exportStoryHandler,
            improveText
        }}>
            {children}
        </ReviewContext.Provider>
    );
}

export function useReview() {
    const context = useContext(ReviewContext);
    if (!context) throw new Error("useReview must be used within ReviewProvider");
    return context;
}


