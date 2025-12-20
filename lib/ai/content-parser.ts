import * as pdfParseModule from "pdf-parse";
import mammoth from "mammoth";

export interface ParsedContent {
  text: string;
  wordCount: number;
  error?: string;
}

/**
 * Configure pdfjs-dist for serverless environments
 * This prevents canvas-related errors in Vercel/AWS Lambda
 */
function configurePdfJs() {
  try {
    // Suppress canvas warnings in serverless environments
    if (typeof process !== 'undefined' && process.env.VERCEL) {
      // Running on Vercel - canvas is not available
      console.log('[PDF Parser] Running in Vercel serverless environment');
    }
  } catch (error) {
    console.warn('[PDF Parser] Could not configure pdfjs:', error);
  }
}

/**
 * Parse PDF file buffer and extract text content
 * Works in serverless environments without canvas dependencies
 */
export async function parsePDF(buffer: Buffer): Promise<ParsedContent> {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-parser.ts:30',message:'parsePDF ENTRY',data:{bufferSize:buffer.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    console.log('[PDF Parser] Starting PDF parsing, buffer size:', buffer.length);
    
    // Configure pdfjs for serverless
    configurePdfJs();
    
    // @ts-ignore - pdf-parse has complex ESM/CJS export structure
    const pdfParse = pdfParseModule.default || pdfParseModule;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-parser.ts:41',message:'Before pdfParse call',data:{hasPdfParse:!!pdfParse,pdfParseType:typeof pdfParse},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    
    // Parse with options that work in serverless environments
    const data = await pdfParse(buffer, {
      // Disable canvas-based rendering - we only need text
      max: 0, // No page limit
    });
    
    const text = data.text.trim();
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-parser.ts:52',message:'PDF parsed successfully',data:{textLength:text.length,wordCount:text.split(/\s+/).length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    console.log('[PDF Parser] Successfully parsed PDF, text length:', text.length);
    
    return {
      text,
      wordCount: text.split(/\s+/).length,
    };
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-parser.ts:63',message:'PDF parsing CAUGHT ERROR',data:{errorName:error?.constructor?.name,errorMessage:error?.message,includesCanvas:(error?.message||'').includes('canvas')},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    console.error("[PDF Parser] PDF parsing error:", error);
    
    // Provide more detailed error information
    let errorMessage = "Failed to parse PDF";
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific canvas-related errors
      if (errorMessage.includes('canvas') || errorMessage.includes('@napi-rs')) {
        errorMessage = "PDF parsing temporarily unavailable. Please try uploading a text or DOCX file instead, or paste your content directly.";
      }
    }
    
    return {
      text: "",
      wordCount: 0,
      error: errorMessage,
    };
  }
}

/**
 * Parse DOCX file buffer and extract text content
 */
export async function parseDOCX(buffer: Buffer): Promise<ParsedContent> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();
    
    return {
      text,
      wordCount: text.split(/\s+/).length,
    };
  } catch (error) {
    console.error("DOCX parsing error:", error);
    return {
      text: "",
      wordCount: 0,
      error: error instanceof Error ? error.message : "Failed to parse DOCX",
    };
  }
}

/**
 * Parse plain text file
 */
export function parseText(text: string): ParsedContent {
  const cleaned = text.trim();
  return {
    text: cleaned,
    wordCount: cleaned.split(/\s+/).length,
  };
}

/**
 * Fetch and parse content from URL
 */
export async function parseURL(url: string): Promise<ParsedContent> {
  try {
    // Validate URL format
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error("Only HTTP/HTTPS URLs are supported");
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StoryTellerBot/1.0)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Basic HTML text extraction (remove scripts, styles, and tags)
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    return {
      text,
      wordCount: text.split(/\s+/).length,
    };
  } catch (error) {
    console.error("URL parsing error:", error);
    return {
      text: "",
      wordCount: 0,
      error: error instanceof Error ? error.message : "Failed to fetch URL",
    };
  }
}

/**
 * Truncate text to a maximum character limit while preserving word boundaries
 */
export function truncateText(text: string, maxChars: number = 50000): string {
  if (text.length <= maxChars) {
    return text;
  }
  
  // Find last space before maxChars to avoid cutting words
  const truncated = text.substring(0, maxChars);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
}

/**
 * Clean and normalize text for AI analysis
 */
export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
    .replace(/[ \t]+/g, ' ') // Normalize spaces
    .replace(/^\s+|\s+$/gm, '') // Trim lines
    .trim();
}

