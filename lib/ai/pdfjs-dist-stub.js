/**
 * Stub for pdfjs-dist during server-side bundling
 * Prevents pdfjs-dist from being evaluated during module bundling
 * This is a completely inert module that provides minimal exports
 * The actual pdfjs-dist will be loaded from node_modules at runtime via dynamic import
 */

// Completely inert stub - no code execution, just exports
module.exports = {
  // Minimal stub exports - pdf-parse might check for these during static analysis
  getDocument: function() { 
    throw new Error('pdfjs-dist stub - use dynamic import at runtime');
  },
  GlobalWorkerOptions: {},
  version: '0.0.0-stub',
  // Export anything else pdf-parse might access during module analysis
  PDFDocumentProxy: function() {},
  PDFPageProxy: function() {},
};

// Also export as ES module for compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports.default = module.exports;
}

