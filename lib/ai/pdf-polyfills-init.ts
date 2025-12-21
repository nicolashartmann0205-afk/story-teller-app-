/**
 * CRITICAL: This file MUST be imported before ANY code that might use pdfjs-dist
 * It sets up polyfills synchronously at module evaluation time
 */

// Execute polyfill setup immediately when this module is imported
(function setupPolyfills() {
  const globalObj = globalThis as any;
  
  // Polyfill DOMMatrix
  if (typeof globalObj.DOMMatrix === 'undefined') {
    globalObj.DOMMatrix = class DOMMatrix {
      a: number = 1;
      b: number = 0;
      c: number = 0;
      d: number = 1;
      e: number = 0;
      f: number = 0;
      constructor(init?: string | number[]) {
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
      multiply(other: DOMMatrix): DOMMatrix {
        const result = new DOMMatrix();
        result.a = this.a * other.a + this.c * other.b;
        result.b = this.b * other.a + this.d * other.b;
        result.c = this.a * other.c + this.c * other.d;
        result.d = this.b * other.c + this.d * other.d;
        result.e = this.a * other.e + this.c * other.f + this.e;
        result.f = this.b * other.e + this.d * other.f + this.f;
        return result;
      }
      translate(tx: number, ty: number): DOMMatrix {
        return new DOMMatrix([this.a, this.b, this.c, this.d, this.e + tx, this.f + ty]);
      }
      scale(sx: number, sy?: number): DOMMatrix {
        const scaleY = sy !== undefined ? sy : sx;
        return new DOMMatrix([this.a * sx, this.b * sx, this.c * scaleY, this.d * scaleY, this.e, this.f]);
      }
      invertSelf(): DOMMatrix {
        const det = this.a * this.d - this.b * this.c;
        if (det === 0) return this;
        const a = this.d / det;
        const b = -this.b / det;
        const c = -this.c / det;
        const d = this.a / det;
        const e = (this.c * this.f - this.d * this.e) / det;
        const f = (this.b * this.e - this.a * this.f) / det;
        this.a = a; this.b = b; this.c = c; this.d = d; this.e = e; this.f = f;
        return this;
      }
    };
  }
  
  // Polyfill ImageData
  if (typeof globalObj.ImageData === 'undefined') {
    globalObj.ImageData = class ImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight?: number, height?: number) {
        if (dataOrWidth instanceof Uint8ClampedArray) {
          this.data = dataOrWidth;
          this.width = widthOrHeight || 0;
          this.height = height || 0;
        } else {
          this.width = dataOrWidth;
          this.height = widthOrHeight || 0;
          this.data = new Uint8ClampedArray(this.width * this.height * 4);
        }
      }
    };
  }
  
  // Polyfill Path2D
  if (typeof globalObj.Path2D === 'undefined') {
    globalObj.Path2D = class Path2D {
      constructor(init?: string | Path2D) {}
      moveTo(x: number, y: number): void {}
      lineTo(x: number, y: number): void {}
      closePath(): void {}
      rect(x: number, y: number, w: number, h: number): void {}
    };
  }
})();

// Export the polyfilled classes so webpack ProvidePlugin can use them
export const DOMMatrix = (globalThis as any).DOMMatrix;
export const ImageData = (globalThis as any).ImageData;
export const Path2D = (globalThis as any).Path2D;

