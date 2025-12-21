import type { NextConfig } from "next";
import path from "path";

// CRITICAL: Set up polyfills BEFORE any Next.js configuration code runs
// This ensures they're available during webpack configuration and module analysis
(function setupPolyfillsAtConfigLevel() {
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
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
        multiply(other: any) { return new DOMMatrix(); }
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
  }
})();

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Enable instrumentation hook
    instrumentationHook: true,
  },
  // Use output.standalone to help with serverless deployments
  output: 'standalone',
  // Externalize pdf-parse to prevent Next.js from analyzing it (we use alias for pdfjs-dist)
  serverComponentsExternalPackages: ['pdf-parse', '@napi-rs/canvas'],
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // Provide polyfills for browser APIs needed by pdfjs-dist on the server
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
      
      // CRITICAL: Use alias to completely replace pdfjs-dist with our stub during server bundling
      // This prevents webpack from even trying to resolve or analyze pdfjs-dist
      // The alias must be set up before other resolve configurations
      // CRITICAL: Set alias FIRST before spreading existing aliases to ensure precedence
      const stubPath = path.resolve(__dirname, 'lib/ai/pdfjs-dist-stub.js');
      config.resolve.alias = {
        // Our pdfjs-dist aliases must come first to take precedence
        'pdfjs-dist': stubPath,
        'pdfjs-dist/build/pdf': stubPath,
        'pdfjs-dist/build/pdf.worker': stubPath,
        'pdfjs-dist/build/pdf.worker.mjs': stubPath,
        // Then spread existing aliases (won't override our pdfjs-dist aliases)
        ...(config.resolve.alias || {}),
      };
      
      config.plugins = config.plugins || [];
      
      // CRITICAL: Ignore pdfjs-dist completely during server bundling
      // This prevents it from being analyzed or evaluated
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^pdfjs-dist$/,
        })
      );
      
      // Also replace it with a stub as backup
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^pdfjs-dist$/,
          path.resolve(__dirname, 'lib/ai/pdfjs-dist-stub.js')
        )
      );
      
      // Also use ProvidePlugin to inject polyfills as globals
      config.plugins.push(
        new webpack.ProvidePlugin({
          // This won't work for classes, but helps ensure globals are available
          'globalThis.DOMMatrix': [path.resolve(__dirname, 'lib/ai/pdf-polyfills-init.ts'), 'DOMMatrix'],
        })
      );
      
      // Inject polyfills at the very start of the bundle using BannerPlugin
      // This ensures they're available before any module evaluation
      const polyfillCode = `
(function() {
  if (typeof globalThis.DOMMatrix === 'undefined') {
    globalThis.DOMMatrix = class DOMMatrix {
      constructor(init) {
        this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
        if (init && typeof init === 'string') {
          const values = init.match(/matrix\\(([^)]+)\\)/)?.[1]?.split(',').map(Number) || [];
          if (values.length >= 6) {
            this.a = values[0]; this.b = values[1]; this.c = values[2];
            this.d = values[3]; this.e = values[4]; this.f = values[5];
          }
        } else if (init && Array.isArray(init) && init.length >= 6) {
          this.a = init[0]; this.b = init[1]; this.c = init[2];
          this.d = init[3]; this.e = init[4]; this.f = init[5];
        }
      }
      multiply(other) { 
        const result = new DOMMatrix();
        result.a = this.a * other.a + this.c * other.b;
        result.b = this.b * other.a + this.d * other.b;
        result.c = this.a * other.c + this.c * other.d;
        result.d = this.b * other.c + this.d * other.d;
        result.e = this.a * other.e + this.c * other.f + this.e;
        result.f = this.b * other.e + this.d * other.f + this.f;
        return result;
      }
      translate(tx, ty) { return new DOMMatrix([this.a, this.b, this.c, this.d, this.e + tx, this.f + ty]); }
      scale(sx, sy) { 
        const scaleY = sy !== undefined ? sy : sx;
        return new DOMMatrix([this.a * sx, this.b * sx, this.c * scaleY, this.d * scaleY, this.e, this.f]);
      }
      invertSelf() { 
        const det = this.a * this.d - this.b * this.c;
        if (det === 0) return this;
        const a = this.d / det; const b = -this.b / det; const c = -this.c / det; const d = this.a / det;
        const e = (this.c * this.f - this.d * this.e) / det; const f = (this.b * this.e - this.a * this.f) / det;
        this.a = a; this.b = b; this.c = c; this.d = d; this.e = e; this.f = f;
        return this;
      }
    };
  }
  if (typeof globalThis.ImageData === 'undefined') {
    globalThis.ImageData = class ImageData {
      constructor(dataOrWidth, widthOrHeight, height) {
        if (dataOrWidth instanceof Uint8ClampedArray) {
          this.data = dataOrWidth; this.width = widthOrHeight || 0; this.height = height || 0;
        } else {
          this.width = dataOrWidth; this.height = widthOrHeight || 0;
          this.data = new Uint8ClampedArray(this.width * this.height * 4);
        }
      }
    };
  }
  if (typeof globalThis.Path2D === 'undefined') {
    globalThis.Path2D = class Path2D {
      constructor(init) {}
      moveTo(x, y) {}
      lineTo(x, y) {}
      closePath() {}
      rect(x, y, w, h) {}
    };
  }
})();
`;
      
      // Inject polyfills at the very start of ALL server bundles
      // This must run before any module evaluation happens
      // Use BannerPlugin with entryOnly: true to ensure it runs on entry points
      config.plugins.push(
        new webpack.BannerPlugin({
          banner: polyfillCode,
          raw: true,
          entryOnly: true, // Only on entry points to ensure it runs first
        })
      );
      
      // Also inject on all chunks as backup
      config.plugins.push(
        new webpack.BannerPlugin({
          banner: polyfillCode,
          raw: true,
          entryOnly: false, // Also on all chunks
        })
      );
    }
    return config;
  },
};

export default nextConfig;
