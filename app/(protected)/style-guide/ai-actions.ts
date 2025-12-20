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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-actions.ts:18',message:'analyzeDocumentAction ENTRY',data:{hasFormData:!!formData},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  console.log('[AI Actions] Starting document analysis');
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('[AI Actions] Unauthorized access attempt');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-actions.ts:29',message:'Unauthorized user',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    return { success: false, error: "Unauthorized" };
  }

  try {
    const file = formData.get("file") as File;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-actions.ts:36',message:'File extracted from formData',data:{hasFile:!!file,fileName:file?.name,fileSize:file?.size,fileType:file?.type},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    
    if (!file) {
      console.error('[AI Actions] No file provided');
      return { success: false, error: "No file provided" };
    }

    console.log('[AI Actions] Processing file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      console.error('[AI Actions] File too large:', sizeMB, 'MB');
      return { 
        success: false, 
        error: `File size exceeds 5MB limit (${sizeMB}MB)` 
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
      console.error('[AI Actions] Unsupported file type:', fileName);
      return { 
        success: false, 
        error: "Unsupported file type. Please upload PDF, DOCX, or TXT files." 
      };
    }

    console.log('[AI Actions] File type detected:', fileType);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('[AI Actions] File converted to buffer, size:', buffer.length);

    // Parse based on file type
    let parsedContent;
    console.log('[AI Actions] Starting file parsing...');
    
    switch (fileType) {
      case 'pdf':
        console.log('[AI Actions] Parsing PDF...');
        parsedContent = await parsePDF(buffer);
        break;
      case 'docx':
        console.log('[AI Actions] Parsing DOCX...');
        parsedContent = await parseDOCX(buffer);
        break;
      case 'txt':
        console.log('[AI Actions] Parsing TXT...');
        parsedContent = parseText(buffer.toString('utf-8'));
        break;
      default:
        return { success: false, error: "Unsupported file type" };
    }

    console.log('[AI Actions] Parsing complete:', {
      hasError: !!parsedContent.error,
      textLength: parsedContent.text.length,
      wordCount: parsedContent.wordCount
    });

    if (parsedContent.error) {
      console.error('[AI Actions] Parsing error:', parsedContent.error);
      return { success: false, error: parsedContent.error };
    }

    if (!parsedContent.text || parsedContent.text.length < 100) {
      console.error('[AI Actions] Document too short:', parsedContent.text.length);
      return { 
        success: false, 
        error: "Document appears to be empty or too short for analysis (minimum 100 characters)" 
      };
    }

    // Clean and truncate text for AI analysis
    console.log('[AI Actions] Cleaning and truncating text...');
    const cleanedText = cleanText(parsedContent.text);
    const truncatedText = truncateText(cleanedText, MAX_TEXT_LENGTH);
    console.log('[AI Actions] Text prepared for AI:', {
      originalLength: parsedContent.text.length,
      cleanedLength: cleanedText.length,
      finalLength: truncatedText.length
    });

    // Analyze with AI
    console.log('[AI Actions] Starting AI analysis...');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-actions.ts:123',message:'Before AI analysis',data:{textLength:truncatedText.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    const analysis = await analyzeStyleFromText(truncatedText);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-actions.ts:127',message:'After AI analysis',data:{hasAnalysis:!!analysis,toneId:analysis?.toneId,suggestedTermsCount:analysis?.suggestedTerms?.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    console.log('[AI Actions] AI analysis complete');

    const result = { success: true, data: analysis };
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-actions.ts:133',message:'Returning success result',data:{resultKeys:Object.keys(result),dataKeys:Object.keys(result.data||{})},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    return result;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-actions.ts:138',message:'CAUGHT ERROR in try-catch',data:{errorName:error?.constructor?.name,errorMessage:error?.message,errorStack:error?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    console.error("[AI Actions] Document analysis error:", error);
    
    // Provide detailed error information
    let errorMessage = "Failed to analyze document";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("[AI Actions] Error stack:", error.stack);
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
}

/**
 * Analyze content from a URL and extract style characteristics
 */
export async function analyzeUrlAction(url: string): Promise<AnalysisResponse> {
  console.log('[AI Actions] Starting URL analysis:', url);
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('[AI Actions] Unauthorized URL analysis attempt');
    return { success: false, error: "Unauthorized" };
  }

  try {
    if (!url || url.trim().length === 0) {
      console.error('[AI Actions] No URL provided');
      return { success: false, error: "No URL provided" };
    }

    console.log('[AI Actions] Fetching URL content...');
    // Parse URL content
    const parsedContent = await parseURL(url.trim());

    console.log('[AI Actions] URL parsing complete:', {
      hasError: !!parsedContent.error,
      textLength: parsedContent.text.length,
      wordCount: parsedContent.wordCount
    });

    if (parsedContent.error) {
      console.error('[AI Actions] URL parsing error:', parsedContent.error);
      return { success: false, error: parsedContent.error };
    }

    if (!parsedContent.text || parsedContent.text.length < 100) {
      console.error('[AI Actions] URL content too short:', parsedContent.text.length);
      return { 
        success: false, 
        error: "URL content appears to be empty or too short for analysis (minimum 100 characters)" 
      };
    }

    // Clean and truncate text for AI analysis
    console.log('[AI Actions] Preparing URL content for AI...');
    const cleanedText = cleanText(parsedContent.text);
    const truncatedText = truncateText(cleanedText, MAX_TEXT_LENGTH);

    // Analyze with AI
    console.log('[AI Actions] Starting AI analysis of URL content...');
    const analysis = await analyzeStyleFromText(truncatedText);
    console.log('[AI Actions] URL analysis complete');

    return { success: true, data: analysis };
  } catch (error) {
    console.error("URL analysis error:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
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
  console.log('[AI Actions] Starting text analysis, length:', text.length);
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('[AI Actions] Unauthorized text analysis attempt');
    return { success: false, error: "Unauthorized" };
  }

  try {
    if (!text || text.trim().length === 0) {
      console.error('[AI Actions] No text provided');
      return { success: false, error: "No text provided" };
    }

    if (text.trim().length < 100) {
      console.error('[AI Actions] Text too short:', text.trim().length);
      return { 
        success: false, 
        error: "Text is too short for analysis (minimum 100 characters)" 
      };
    }

    // Clean and truncate text for AI analysis
    console.log('[AI Actions] Cleaning and preparing text...');
    const cleanedText = cleanText(text);
    const truncatedText = truncateText(cleanedText, MAX_TEXT_LENGTH);
    console.log('[AI Actions] Text prepared, final length:', truncatedText.length);

    // Analyze with AI
    console.log('[AI Actions] Starting AI analysis of text...');
    const analysis = await analyzeStyleFromText(truncatedText);
    console.log('[AI Actions] Text analysis complete');

    return { success: true, data: analysis };
  } catch (error) {
    console.error("Text analysis error:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to analyze text" 
    };
  }
}


