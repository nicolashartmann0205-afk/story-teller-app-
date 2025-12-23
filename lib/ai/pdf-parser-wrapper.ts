/**
 * Wrapper for PDF parsing that ensures polyfills are set up and handles errors gracefully
 * This isolates pdfjs-dist from the rest of the codebase
 */

// Set up polyfills immediately when this module loads
(function setupPolyfills() {
  const globalObj = globalThis as any;
  
  if (typeof globalObj.DOMMatrix === 'undefined') {
    globalObj.DOMMatrix = class DOMMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      constructor(init?: any) {
        if (init && typeof init === 'string') {
          const values = init.match(/matrix\(([^)]+)\)/)?.[1]?.split(',').map(Number) || [];
          if (values.length >= 6) {
            this.a = values[0]; this.b = values[1]; this.c = values[2];
            this.d = values[3]; this.e = values[4]; this.f = values[5];
          }
        } else if (init && Array.isArray(init) && init.length >= 6) {
          this.a = init[0]; this.b = init[1]; this.c = init[2];
          this.d = init[3]; this.e = init[4]; this.f = init[5];
        }
      }
      multiply() { return new DOMMatrix(); }
      translate() { return new DOMMatrix(); }
      scale() { return new DOMMatrix(); }
      invertSelf() { return this; }
    };
  }
  
  if (typeof globalObj.ImageData === 'undefined') {
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
  }
  
  if (typeof globalObj.Path2D === 'undefined') {
    globalObj.Path2D = class Path2D {
      constructor() {}
      moveTo() {}
      lineTo() {}
      closePath() {}
      rect() {}
    };
  }
  
  // #region agent log
  try {
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'pdf-parser-wrapper.ts:module-level',
        message: 'Module IIFE executed',
        data: {
          hasDOMMatrix: typeof (globalThis as any).DOMMatrix !== 'undefined',
          hasImageData: typeof (globalThis as any).ImageData !== 'undefined',
          hasPath2D: typeof (globalThis as any).Path2D !== 'undefined',
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'initial',
        hypothesisId: 'module-iife-execution',
      }),
    }).catch(() => {});
  } catch (e) {}
  // #endregion
})();

// Move interface to avoid any potential type-related imports
// This interface is defined here but also exported from content-parser.ts
export type ParsedContent = {
  text: string;
  wordCount: number;
  error?: string;
}

/**
 * Parse PDF with error handling and polyfill setup
 */
export async function parsePDFSafe(buffer: Buffer): Promise<ParsedContent> {
  // #region agent log
  try {
    fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'pdf-parser-wrapper.ts:parsePDFSafe',
        message: 'parsePDFSafe called',
        data: {
          bufferLength: buffer.length,
          hasDOMMatrixBefore: typeof (globalThis as any).DOMMatrix !== 'undefined',
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'initial',
        hypothesisId: 'pdf-parsing-attempt',
      }),
    }).catch(() => {});
  } catch (e) {}
  // #endregion
  
  try {
    // CRITICAL: Ensure polyfills are set up RIGHT NOW, before importing pdf-parse
    // This must be synchronous and happen before the dynamic import
    const globalObj = globalThis as any;
    
    if (typeof globalObj.DOMMatrix === 'undefined') {
      globalObj.DOMMatrix = class DOMMatrix {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        constructor(init?: any) {
          if (init && typeof init === 'string') {
            const values = init.match(/matrix\(([^)]+)\)/)?.[1]?.split(',').map(Number) || [];
            if (values.length >= 6) {
              this.a = values[0]; this.b = values[1]; this.c = values[2];
              this.d = values[3]; this.e = values[4]; this.f = values[5];
            }
          } else if (init && Array.isArray(init) && init.length >= 6) {
            this.a = init[0]; this.b = init[1]; this.c = init[2];
            this.d = init[3]; this.e = init[4]; this.f = init[5];
          }
        }
        multiply() { return new DOMMatrix(); }
        translate() { return new DOMMatrix(); }
        scale() { return new DOMMatrix(); }
        invertSelf() { return this; }
      };
    }
    
    if (typeof globalObj.ImageData === 'undefined') {
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
    }
    
    if (typeof globalObj.Path2D === 'undefined') {
      globalObj.Path2D = class Path2D {
        constructor() {}
        moveTo() {}
        lineTo() {}
        closePath() {}
        rect() {}
      };
    }
    
    // #region agent log
    try {
      fetch('http://127.0.0.1:7242/ingest/712fc693-8823-4212-b37e-89ae6bcbbd97', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'pdf-parser-wrapper.ts:parsePDFSafe',
          message: 'Before pdf-parse import',
          data: {
            hasDOMMatrix: typeof globalObj.DOMMatrix !== 'undefined',
            hasImageData: typeof globalObj.ImageData !== 'undefined',
            hasPath2D: typeof globalObj.Path2D !== 'undefined',
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'initial',
          hypothesisId: 'before-pdf-import',
        }),
      }).catch(() => {});
    } catch (e) {}
    // #endregion
    
    // Now that polyfills are guaranteed to be in place, import pdf-parse
    // pdf-parse is externalized, so it will be loaded from node_modules at runtime
    // Try ESM import first, then fall back to CommonJS if needed
    let pdfParse: any;
    
    try {
      // Try ESM import - pdf-parse might export as namespace
      const pdfParseModule: any = await import("pdf-parse");
      
      console.log('[PDF Parser] Module type:', typeof pdfParseModule);
      console.log('[PDF Parser] Module keys:', pdfParseModule ? Object.keys(pdfParseModule).slice(0, 10).join(', ') : 'none');
      
      // Try various export patterns
      if (typeof pdfParseModule === 'function') {
        pdfParse = pdfParseModule;
      } else if (pdfParseModule && typeof pdfParseModule.default === 'function') {
        pdfParse = pdfParseModule.default;
      } else if (pdfParseModule && pdfParseModule.default && typeof pdfParseModule.default.default === 'function') {
        // Double default export (some bundlers do this)
        pdfParse = pdfParseModule.default.default;
      } else {
        // Try using createRequire for CommonJS
        console.log('[PDF Parser] Trying CommonJS require fallback');
        const { createRequire } = await import('module');
        const requireFunc = createRequire(import.meta.url || __filename);
        pdfParse = requireFunc('pdf-parse');
      }
    } catch (esmError) {
      console.error('[PDF Parser] ESM import failed:', esmError);
      // Fallback to CommonJS require if ESM import fails
      // @ts-ignore - require might be available in some contexts
      if (typeof require !== 'undefined') {
        pdfParse = require('pdf-parse');
      } else {
        throw new Error(`Failed to import pdf-parse: ${esmError instanceof Error ? esmError.message : String(esmError)}`);
      }
    }
    
    if (!pdfParse || typeof pdfParse !== 'function') {
      throw new Error(`pdfParse is not a function. Type: ${typeof pdfParse}, module keys: ${pdfParse ? Object.keys(pdfParse).slice(0, 5).join(', ') : 'none'}`);
    }
    
    const data = await pdfParse(buffer, { max: 0 });
    const text = data.text.trim();
    
    return {
      text,
      wordCount: text.split(/\s+/).length,
    };
  } catch (error) {
    console.error("[PDF Parser Wrapper] Error:", error);
    return {
      text: "",
      wordCount: 0,
      error: "PDF parsing is not available. Please use DOCX or TXT files instead, or paste your content directly.",
    };
  }
}

