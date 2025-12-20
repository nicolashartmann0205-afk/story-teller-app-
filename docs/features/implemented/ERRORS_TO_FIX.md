# Errors to Fix

## 🔴 Critical TypeScript Build Errors

### 1. Type Error in `app/(protected)/create-story/create-story-form.tsx`
**Location:** Line 12  
**Error:** Type mismatch with `useActionState` hook  
**Details:**
```
Type error: No overload matches this call.
Argument of type 'CreateStoryAction' is not assignable to parameter of type '(state: void | { error?: string | undefined; } | null) => ...'
Types of parameters 'previousState' and 'state' are incompatible.
Type 'void | { error?: string | undefined; } | null' is not assignable to type '{ error?: string | undefined; } | null'.
Type 'void' is not assignable to type '{ error?: string | undefined; } | null'.
```

**Root Cause:** The `CreateStoryAction` type allows returning `void`, but `useActionState` expects the state type to not include `void`.

**Fix:** Update the `CreateStoryAction` type to always return `{ error?: string } | null` instead of allowing `void`.

---

## 🟡 Route Conflicts & Inconsistencies

### 2. Duplicate Route Handlers for `/`
**Conflict:**
- `app/page.tsx` handles `/` (takes precedence)
- `app/(protected)/page.tsx` also tries to handle `/` (route groups don't affect URLs)

**Issue:** Both files define page components for the root route, causing confusion about which one is actually used.

**Fix:** 
- Decide on a single route structure
- Either move `(protected)/page.tsx` to a different route (e.g., `/dashboard`), or
- Remove `(protected)/page.tsx` and use `app/stories/page.tsx` for `/stories`

### 3. Duplicate Create Story Routes
**Conflict:**
- `app/(protected)/create-story/page.tsx` handles `/create-story`
- `app/stories/new/page.tsx` handles `/stories/new`

**Issue:** Two different routes for the same functionality, leading to inconsistency.

**Fix:** 
- Choose one route and remove the other
- Recommended: Keep `/create-story` and remove `/stories/new`
- Update all links to use the single route

### 4. Inconsistent Route Usage Throughout App
**Issues:**
- Some pages link to `/create-story`
- Other pages link to `/stories/new`
- Delete action redirects to `/` instead of `/stories`
- Create story action redirects to `/` instead of `/stories`

**Fix:** Standardize all routes:
- Stories list: `/stories`
- Create story: `/create-story` (or `/stories/new`, but pick one)
- Edit story: `/stories/[storyId]/edit`
- After create/edit/delete operations: redirect to `/stories` (not `/`)

---

## 🟠 Incorrect Redirects

### 5. Wrong Redirect After Story Creation
**Location:** `app/(protected)/create-story/page.tsx` line 51  
**Issue:** Redirects to `/` instead of `/stories` after successful story creation  
**Fix:** Change `redirect("/")` to `redirect("/stories")`

### 6. Wrong Redirect After Story Deletion
**Location:** `app/(protected)/page.tsx` line 79  
**Issue:** Redirects to `/` instead of `/stories` after story deletion  
**Fix:** Change `redirect("/")` to `redirect("/stories")`

### 7. Wrong Redirect After Story Update
**Location:** `app/(protected)/stories/[storyId]/edit/page.tsx` line 74  
**Issue:** Redirects to `/` instead of `/stories` after story update  
**Fix:** Change `redirect("/")` to `redirect("/stories")`

### 8. Wrong Cancel/Back Links
**Location:** Multiple files  
**Issues:**
- `app/(protected)/create-story/page.tsx` line 64: Links to `/` (should be `/stories`)
- `app/(protected)/create-story/create-story-form.tsx` line 64: Links to `/` (should be `/stories`)

**Fix:** Update all "Cancel" and "Back to Stories" links to point to `/stories`

---

## 🟡 Deprecated Features

### 9. Deprecated Middleware Convention
**Location:** `middleware.ts`  
**Warning:** 
```
The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**Fix:** 
- Update middleware to use Next.js 16+ proxy convention
- Or acknowledge the warning and plan for future migration

---

## 🟢 Code Quality Issues (Non-Breaking)

### 10. Duplicate Code in Stories Pages
**Issue:** 
- `app/stories/page.tsx` and `app/(protected)/page.tsx` have very similar code
- Both fetch and display stories

**Fix:** 
- Consolidate to a single stories page
- Remove the duplicate

### 11. Multiple Console Error Statements
**Location:** Throughout the app (16 instances found)  
**Issue:** Many `console.error()` statements that should ideally use a logging service  
**Fix:** 
- Consider implementing a proper error logging service
- Or keep console.error for now (not critical)

---

## 📋 Summary of Required Actions

### High Priority (Blocks Build)
1. ✅ Fix TypeScript type error in `create-story-form.tsx`
2. ✅ Resolve route conflicts (remove duplicates)
3. ✅ Standardize route usage across the app

### Medium Priority (Functional Issues)
4. ✅ Fix redirect destinations (all should go to `/stories`, not `/`)
5. ✅ Fix Cancel/Back links to point to `/stories`
6. ✅ Remove duplicate create story route

### Low Priority (Cleanup)
7. ⚠️ Address deprecated middleware warning
8. ⚠️ Consolidate duplicate stories page code
9. ⚠️ Consider error logging improvements

---

## 🎯 Recommended Fix Order

1. **Fix TypeScript error** (prevents build)
2. **Standardize routes** (choose `/create-story` or `/stories/new`)
3. **Fix redirects** (change all `/` redirects to `/stories`)
4. **Remove duplicate routes** (clean up unused files)
5. **Update links** (ensure all navigation is consistent)

