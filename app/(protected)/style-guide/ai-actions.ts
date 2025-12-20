"use server";

import { createClient } from "@/lib/supabase/server";
import { parsePDF, parseDOCX, parseText, parseURL, cleanText, truncateText } from "@/lib/ai/content-parser";
import { analyzeStyleFromText, StyleAnalysisResult } from "@/lib/ai/style-analyzer";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TEXT_LENGTH = 50000; // ~50K characters for AI analysis

interface AnalysisResponse {
  success: boolean;
  data?: StyleAnalysisResult;
  error?: string;
}

/**
 * Analyze a document file (PDF, DOCX, TXT) and extract style characteristics
 */
export async function analyzeDocumentAction(
  formData: FormData
): Promise<AnalysisResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const file = formData.get("file") as File;
    
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { 
        success: false, 
        error: `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)` 
      };
    }

    // Get file extension
    const fileName = file.name.toLowerCase();
    const fileType = fileName.endsWith('.pdf') 
      ? 'pdf' 
      : fileName.endsWith('.docx') 
      ? 'docx' 
      : fileName.endsWith('.txt') 
      ? 'txt' 
      : null;

    if (!fileType) {
      return { 
        success: false, 
        error: "Unsupported file type. Please upload PDF, DOCX, or TXT files." 
      };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse based on file type
    let parsedContent;
    switch (fileType) {
      case 'pdf':
        parsedContent = await parsePDF(buffer);
        break;
      case 'docx':
        parsedContent = await parseDOCX(buffer);
        break;
      case 'txt':
        parsedContent = parseText(buffer.toString('utf-8'));
        break;
      default:
        return { success: false, error: "Unsupported file type" };
    }

    if (parsedContent.error) {
      return { success: false, error: parsedContent.error };
    }

    if (!parsedContent.text || parsedContent.text.length < 100) {
      return { 
        success: false, 
        error: "Document appears to be empty or too short for analysis (minimum 100 characters)" 
      };
    }

    // Clean and truncate text for AI analysis
    const cleanedText = cleanText(parsedContent.text);
    const truncatedText = truncateText(cleanedText, MAX_TEXT_LENGTH);

    // Analyze with AI
    const analysis = await analyzeStyleFromText(truncatedText);

    return { success: true, data: analysis };
  } catch (error) {
    console.error("Document analysis error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to analyze document" 
    };
  }
}

/**
 * Analyze content from a URL and extract style characteristics
 */
export async function analyzeUrlAction(url: string): Promise<AnalysisResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    if (!url || url.trim().length === 0) {
      return { success: false, error: "No URL provided" };
    }

    // Parse URL content
    const parsedContent = await parseURL(url.trim());

    if (parsedContent.error) {
      return { success: false, error: parsedContent.error };
    }

    if (!parsedContent.text || parsedContent.text.length < 100) {
      return { 
        success: false, 
        error: "URL content appears to be empty or too short for analysis (minimum 100 characters)" 
      };
    }

    // Clean and truncate text for AI analysis
    const cleanedText = cleanText(parsedContent.text);
    const truncatedText = truncateText(cleanedText, MAX_TEXT_LENGTH);

    // Analyze with AI
    const analysis = await analyzeStyleFromText(truncatedText);

    return { success: true, data: analysis };
  } catch (error) {
    console.error("URL analysis error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to analyze URL" 
    };
  }
}

/**
 * Analyze pasted text and extract style characteristics
 */
export async function analyzeTextAction(text: string): Promise<AnalysisResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    if (!text || text.trim().length === 0) {
      return { success: false, error: "No text provided" };
    }

    if (text.trim().length < 100) {
      return { 
        success: false, 
        error: "Text is too short for analysis (minimum 100 characters)" 
      };
    }

    // Clean and truncate text for AI analysis
    const cleanedText = cleanText(text);
    const truncatedText = truncateText(cleanedText, MAX_TEXT_LENGTH);

    // Analyze with AI
    const analysis = await analyzeStyleFromText(truncatedText);

    return { success: true, data: analysis };
  } catch (error) {
    console.error("Text analysis error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to analyze text" 
    };
  }
}


