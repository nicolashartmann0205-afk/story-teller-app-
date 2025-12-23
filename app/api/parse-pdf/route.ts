/**
 * Separate API route for PDF parsing
 * This isolates pdfjs-dist from the main application bundle
 */

import { NextRequest, NextResponse } from "next/server";

// Set up polyfills immediately when this route module loads
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
      multiply(other: any) {
        const result = new DOMMatrix();
        result.a = this.a * other.a + this.c * other.b;
        result.b = this.b * other.a + this.d * other.b;
        result.c = this.a * other.c + this.c * other.d;
        result.d = this.b * other.c + this.d * other.d;
        result.e = this.a * other.e + this.c * other.f + this.e;
        result.f = this.b * other.e + this.d * other.f + this.f;
        return result;
      }
      translate(tx: number, ty: number) { return new DOMMatrix(); }
      scale(sx: number, sy?: number) { return new DOMMatrix(); }
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
})();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Dynamically import pdf-parse after polyfills are set up
    // pdf-parse is an ESM module - handle the import structure
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as { default?: any } & any).default || pdfParseModule;
    
    const data = await pdfParse(buffer, { max: 0 });
    const text = data.text.trim();
    
    return NextResponse.json({
      text,
      wordCount: text.split(/\s+/).length,
    });
  } catch (error) {
    console.error('[API] PDF parsing error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      text: "",
      wordCount: 0,
      error: "PDF parsing failed. Please use DOCX or TXT files instead, or paste your content directly.",
    }, { status: 200 }); // Return 200 so client can handle the error
  }
}

