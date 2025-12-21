// DO NOT import pdf-polyfills here - it will be imported lazily when needed
// This prevents pdfjs-dist from being evaluated during module bundling

// #region agent log
fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-parser.ts:1',message:'Module loaded',data:{hasProcess:typeof process!=='undefined',env:typeof process!=='undefined'?process.env.NODE_ENV:'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
// #endregion
import mammoth from "mammoth";

export interface ParsedContent {
  text: string;
  wordCount: number;
  error?: string;
}


/**
 * Parse PDF file buffer and extract text content
 * Works in serverless environments without canvas dependencies
 * 
 * NOTE: PDF parsing may fail in some serverless environments due to pdfjs-dist
 * requiring browser APIs. If this fails, users should use DOCX or TXT files instead.
 */
export async function parsePDF(buffer: Buffer): Promise<ParsedContent> {
  // Early return if we can't set up polyfills (prevents module evaluation errors)
  const globalObj = globalThis as any;
  if (typeof globalObj.DOMMatrix === 'undefined') {
    // Try to set up polyfills synchronously before proceeding
    try {
      // Set up minimal DOMMatrix polyfill immediately
      globalObj.DOMMatrix = class DOMMatrix {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        constructor(init?: any) {}
        multiply() { return new DOMMatrix(); }
        translate() { return new DOMMatrix(); }
        scale() { return new DOMMatrix(); }
        invertSelf() { return this; }
      };
      globalObj.ImageData = class ImageData {
        data: any; width = 0; height = 0;
        constructor(a: any, b?: any, c?: any) {
          if (a instanceof Uint8ClampedArray) {
            this.data = a; this.width = b || 0; this.height = c || 0;
          } else {
            this.width = a; this.height = b || 0;
            this.data = new Uint8ClampedArray(this.width * this.height * 4);
          }
        }
      };
      globalObj.Path2D = class Path2D {
        constructor() {}
        moveTo() {}
        lineTo() {}
        closePath() {}
        rect() {}
      };
    } catch (e) {
      // If polyfills can't be set up, return error immediately
      return {
        text: "",
        wordCount: 0,
        error: "PDF parsing is not available in this environment. Please use DOCX or TXT files instead.",
      };
    }
  }
  
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-parser.ts:parsePDF',message:'parsePDF entry',data:{bufferLength:buffer.length},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.log('[PDF Parser] Starting PDF parsing, buffer size:', buffer.length);
    
    // Polyfills are already set up at the top of this function
    // Now proceed with dynamic import of pdf-parse
    // Use dynamic import to avoid loading pdfjs-dist at module evaluation time
    // Polyfills are now guaranteed to be in place
    const pdfParseModule = await import("pdf-parse");
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-parser.ts:parsePDF',message:'After pdf-parse import',data:{hasPdfParse:!!pdfParseModule},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // @ts-ignore - pdf-parse has complex ESM/CJS export structure
    const pdfParse = pdfParseModule.default || pdfParseModule;
    
    // Parse with options that work in serverless environments
    const data = await pdfParse(buffer, {
      // Disable canvas-based rendering - we only need text
      max: 0, // No page limit
    });
    
    const text = data.text.trim();
    
    console.log('[PDF Parser] Successfully parsed PDF, text length:', text.length);
    
    return {
      text,
      wordCount: text.split(/\s+/).length,
    };
  } catch (error) {
    console.error("[PDF Parser] PDF parsing error:", error);
    
    // Provide more detailed error information
    let errorMessage = "Failed to parse PDF";
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific canvas/DOMMatrix-related errors
      if (errorMessage.includes('canvas') || 
          errorMessage.includes('@napi-rs') || 
          errorMessage.includes('DOMMatrix') ||
          errorMessage.includes('ImageData') ||
          errorMessage.includes('Path2D')) {
        errorMessage = "PDF parsing is not available in this environment. Please try uploading a DOCX or TXT file instead, or paste your content directly.";
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

