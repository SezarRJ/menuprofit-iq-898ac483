# MenuProfit — Threat Model

## 1. Tenant Isolation Attack Vectors

| Vector | Risk | Mitigation |
|--------|------|------------|
| Direct Supabase query with another restaurant_id | **CRITICAL** — Data leak | RLS policies enforce `owner_id = auth.uid()` via `is_restaurant_owner()` |
| Staff accessing wrong restaurant | **HIGH** — Cross-tenant read | Staff role scoped to assigned restaurant_id only |
| IDOR on recipe/ingredient IDs | **HIGH** — Enumerate & read | RLS + security definer functions validate ownership chain |
| Client-side restaurant context manipulation | **MEDIUM** — UI bypass | Server-side RLS is the real guard, not client context |

## 2. Plan Gating Bypass Vectors

| Vector | Risk | Mitigation |
|--------|------|------------|
| Free user navigates to /ai-assistant directly | **HIGH** — Feature theft | Server-side plan check in edge function + client route guard |
| Free user calls AI edge function directly | **HIGH** — Quota bypass | Edge function validates subscription tier before processing |
| Free user calls sales import API | **MEDIUM** — Feature theft | Edge function + RLS check subscription status |
| User modifies localStorage plan data | **MEDIUM** — UI bypass | Plan data fetched from DB, never trusted from client |

## 3. Admin Escalation Vectors

| Vector | Risk | Mitigation |
|--------|------|------------|
| User adds admin role via client | **CRITICAL** — Full access | user_roles table has RLS: only service_role can insert |
| Admin URL guessing (/admin/*) | **HIGH** — Admin access | Server-side role verification via `has_role()` function |
| Prototype mode left enabled | **CRITICAL** — Auth bypass | PROTOTYPE_MODE must be false in production |
| JWT tampering for role claim | **LOW** — Supabase handles | JWT verification via `getClaims()` in edge functions |

## 4. Import Pipeline Poisoning Vectors

| Vector | Risk | Mitigation |
|--------|------|------------|
| CSV with script injection (=CMD()) | **HIGH** — XSS/RCE | Sanitize cell values, strip leading `=`, `+`, `-`, `@` |
| Malformed UTF-8 / encoding attacks | **MEDIUM** — Crash/corrupt | Detect encoding, normalize to UTF-8 |
| Extremely large file (100MB+) | **MEDIUM** — DoS | Client-side 10MB limit + server validation |
| Duplicate import flooding | **LOW** — Data pollution | Duplicate detection by file hash + warning |
| Negative quantities | **MEDIUM** — Financial errors | Validate quantity >= 0 |
| Invalid date formats | **MEDIUM** — Data corruption | Parse with multiple format support, reject unknowns |

## 5. Stripe Webhook Forgery Vectors

| Vector | Risk | Mitigation |
|--------|------|------------|
| Fake webhook POST | **CRITICAL** — Plan manipulation | Verify Stripe signature with webhook secret |
| Replay attack | **HIGH** — Duplicate processing | Idempotency key tracking in processed_events table |
| Subscription state desync | **HIGH** — Access after cancel | Webhook updates DB; cron job as fallback sync |
| Missing webhook events | **MEDIUM** — Stale state | Periodic Stripe API reconciliation |

## 6. AI Quota Abuse Vectors

| Vector | Risk | Mitigation |
|--------|------|------------|
| Rapid-fire requests | **HIGH** — Cost explosion | Rate limiting per restaurant (10 req/min) |
| Large context injection | **MEDIUM** — Token waste | Truncate input messages to 4000 chars |
| Non-Elite user direct function call | **HIGH** — Feature theft | Edge function checks subscription tier |
| Token count manipulation | **LOW** — Billing fraud | Server-side token counting via API response |

## 7. Authentication Vectors

| Vector | Risk | Mitigation |
|--------|------|------------|
| Prototype mode in production | **CRITICAL** — Full bypass | Environment variable, never hardcoded true |
| Session hijacking | **MEDIUM** — Account takeover | Supabase handles secure session management |
| Brute force login | **MEDIUM** — Account access | Supabase rate limiting on auth endpoints |
