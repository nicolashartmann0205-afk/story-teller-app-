# Vercel PDF Parsing Fix

## Problem
The AI style guide analysis was failing on Vercel when uploading PDF documents due to missing `@napi-rs/canvas` dependency, which is required by `pdfjs-dist` for PDF rendering but not available in serverless environments.

## Solutions Implemented

### 1. **Canvas Dependency (package.json)**
- Added `canvas` as an **optional dependency**
- This tells Vercel/npm that canvas is optional and the app can work without it
- PDF parsing will attempt text extraction only (no rendering)

```json
"optionalDependencies": {
  "canvas": "^2.11.2"
}
```

### 2. **Improved PDF Parser (lib/ai/content-parser.ts)**
- Added serverless environment detection
- Configured `pdf-parse` to work without canvas
- Enhanced error handling with specific canvas-related error messages
- Added comprehensive logging for debugging
- Graceful degradation: suggests alternative formats if PDF fails

**Key Changes:**
- Detects Vercel environment via `process.env.VERCEL`
- Passes serverless-friendly options to pdf-parse
- Catches canvas errors and provides user-friendly alternative suggestions

### 3. **Enhanced Server Actions (app/(protected)/style-guide/ai-actions.ts)**
- Added detailed logging at every step of the analysis pipeline
- Logs include:
  - File metadata (name, size, type)
  - Parsing progress
  - Text extraction results
  - AI analysis status
  - Full error stacks for debugging

**Benefits:**
- Easy to diagnose issues from Vercel logs
- Track progress through the entire pipeline
- Identify exactly where failures occur

### 4. **Better Frontend Feedback (style-guide-editor.tsx)**
- Added progress state to show analysis steps
- Visual progress indicator with spinner
- Detailed error messages
- Try-catch blocks to handle unexpected failures
- Time estimate for user expectations (10-30 seconds)

**User-visible improvements:**
- "Uploading and parsing document..."
- "Extracting text content..."
- "Analyzing writing style..."
- Clear error messages with actionable suggestions

## Deployment Steps

### 1. Install Dependencies
```bash
pnpm install
```

This will install the new optional canvas dependency.

### 2. Test Locally
```bash
pnpm dev
```

Test PDF upload in the AI Import tab of a style guide.

### 3. Deploy to Vercel
```bash
git add .
git commit -m "Fix PDF parsing for Vercel serverless environment"
git push
```

Vercel will automatically deploy.

### 4. Monitor Logs
After deployment, test PDF upload and check Vercel logs:
- Go to Vercel Dashboard → Your Project → Logs
- Look for `[PDF Parser]` and `[AI Actions]` log entries
- Verify the flow completes successfully

## Expected Behavior

### Success Case (PDF with text):
1. User uploads PDF
2. Logs show: "Starting PDF parsing"
3. Text is extracted successfully
4. AI analyzes the content
5. User sees style suggestions

### Fallback Case (PDF parsing fails):
1. User uploads PDF
2. Parser encounters canvas error
3. Error message suggests: "PDF parsing temporarily unavailable. Please try uploading a text or DOCX file instead, or paste your content directly."
4. User can use alternative methods

### Alternative Methods Always Work:
- DOCX upload (uses mammoth library)
- TXT upload (direct text)
- URL analysis (HTML parsing)
- Text paste (direct input)

## Troubleshooting

### If PDF still fails on Vercel:

1. **Check Vercel logs** for the exact error:
   ```
   [PDF Parser] Starting PDF parsing...
   [PDF Parser] PDF parsing error: <error message>
   ```

2. **Verify canvas is optional**:
   ```bash
   cat package.json | grep -A 2 "optionalDependencies"
   ```

3. **Alternative: Disable PDF parsing temporarily**:
   In `ai-actions.ts`, return early for PDF files:
   ```typescript
   if (fileType === 'pdf') {
     return { 
       success: false, 
       error: "PDF parsing is temporarily disabled. Please use DOCX or TXT files." 
     };
   }
   ```

4. **Long-term solution**: Consider replacing `pdf-parse` with a more serverless-friendly library like:
   - `pdf2json` (pure JavaScript, no canvas)
   - API-based solution (PDF.co, Adobe PDF Services)
   - Client-side PDF.js extraction

## Testing Checklist

- [ ] PDF upload shows progress indicator
- [ ] DOCX upload works
- [ ] TXT upload works
- [ ] URL analysis works
- [ ] Text paste works
- [ ] Error messages are clear and actionable
- [ ] Vercel logs show detailed progress
- [ ] Analysis completes within 30 seconds
- [ ] Results appear correctly in the review panel

## Files Modified

1. `lib/ai/content-parser.ts` - Enhanced PDF parsing with serverless support
2. `app/(protected)/style-guide/ai-actions.ts` - Added comprehensive logging
3. `app/(protected)/style-guide/[id]/style-guide-editor.tsx` - Better progress feedback
4. `package.json` - Added optional canvas dependency

## Notes

- Canvas is only needed for PDF rendering (visual output)
- We only need text extraction, which works without canvas
- All other file types (DOCX, TXT, URL, text paste) work perfectly
- Users have multiple alternative options if PDF fails

