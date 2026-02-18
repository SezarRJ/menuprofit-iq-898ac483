# MenuProfit — Security Audit Report

## Date: 2026-02-17
## Auditor: Automated Security Scan

---

## CRITICAL Issues

### 1. PROTOTYPE_MODE Hardcoded to `true`
- **File**: `src/App.tsx:24`
- **Severity**: 🔴 CRITICAL
- **Issue**: `const PROTOTYPE_MODE = true` bypasses ALL auth and setup guards
- **Impact**: Any visitor can access all routes without authentication
- **Fix**: Set to `false` for production; ideally use environment variable

### 2. No Server-Side Route Protection
- **Files**: All pages (`src/pages/*.tsx`)
- **Severity**: 🔴 CRITICAL
- **Issue**: Route protection is client-side only via `ProtectedRoute` wrapper
- **Impact**: Direct API calls bypass all UI guards
- **Fix**: All edge functions must verify auth via `getClaims()`; RLS already protects DB

### 3. No Subscription/Plan Gating
- **Files**: `src/pages/AIAssistant.tsx`, `src/pages/Sales.tsx`
- **Severity**: 🔴 CRITICAL
- **Issue**: No subscription tier enforcement exists anywhere
- **Impact**: All features accessible to all authenticated users
- **Fix**: Add `subscriptions` table + plan checks in edge functions + client guards

### 4. No Admin Role System
- **Severity**: 🔴 CRITICAL
- **Issue**: No admin roles, no admin panel, no access logging
- **Fix**: Add `user_roles` table with RLS + admin routes + access logging

---

## HIGH Issues

### 5. AI Edge Function Has No Auth Check
- **File**: `supabase/functions/ai-chat/index.ts`
- **Severity**: 🟠 HIGH
- **Issue**: No JWT verification; anyone with the anon key can call it
- **Fix**: Add `getClaims()` check + subscription tier validation

### 6. No Audit Trail
- **Severity**: 🟠 HIGH
- **Issue**: No mutation logging anywhere (CRUD operations are silent)
- **Fix**: Add `audit_logs` table + trigger-based logging

### 7. Sales Import Has No Input Validation
- **File**: `src/pages/Sales.tsx`
- **Severity**: 🟠 HIGH
- **Issue**: No file size limit, no encoding check, no value sanitization
- **Fix**: Add comprehensive client + server validation

### 8. No AI Usage Caps
- **File**: `supabase/functions/ai-chat/index.ts`
- **Severity**: 🟠 HIGH
- **Issue**: No token counting, no monthly limits, no usage logging
- **Fix**: Add `ai_usage_logs` table + monthly cap enforcement

---

## MEDIUM Issues

### 9. No CSRF Protection on Mutations
- **Files**: All pages with forms
- **Severity**: 🟡 MEDIUM
- **Issue**: Supabase handles this via JWT, but no explicit CSRF tokens
- **Mitigation**: Supabase auth tokens provide implicit CSRF protection

### 10. Breakeven Calculation Uses Internal Property
- **File**: `src/pages/RecipeDetail.tsx:103`
- **Severity**: 🟡 MEDIUM
- **Issue**: `(supabase as any)._recipes_count` — accessing non-existent internal
- **Fix**: Use actual count from query

### 11. Weekly Aggregation Doesn't Start on Saturday
- **File**: `src/pages/Dashboard.tsx:119-121`
- **Severity**: 🟡 MEDIUM
- **Issue**: Uses `d.getDay()` for week start but should start Saturday (Iraq market)
- **Fix**: Adjust to Saturday-based week calculation

### 12. No Input Length Limits on Forms
- **Files**: All form components
- **Severity**: 🟡 MEDIUM
- **Issue**: No maxLength on inputs; potential DoS via huge strings
- **Fix**: Add maxLength attributes + server-side validation

---

## LOW Issues

### 13. Export Functions Don't Sanitize Data
- **File**: `src/lib/export-utils.ts`
- **Severity**: ✅ FIXED
- **Issue**: Excel exports may contain formula injection
- **Fix**: Values starting with `=`, `+`, `-`, `@` are now prefixed with `'`

### 14. No Rate Limiting on Client-Side Actions
- **Severity**: 🟢 LOW
- **Issue**: User can spam delete/create buttons
- **Fix**: Add debouncing on mutation buttons

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 CRITICAL | 4 |
| 🟠 HIGH | 4 |
| 🟡 MEDIUM | 4 |
| 🟢 LOW | 2 |

## Remediation Priority
1. Disable PROTOTYPE_MODE
2. Add user_roles + subscriptions tables
3. Harden AI edge function (auth + caps)
4. Add audit logging
5. Validate import pipeline
6. Build admin panel
7. Add automated tests
