# MenuProfit — Release Checklist

## Security
- [x] PROTOTYPE_MODE flag exists (set to `false` for production)
- [x] RLS policies on ALL tables
- [x] `user_roles` table with RBAC (no client escalation)
- [x] `subscriptions` table with plan gating
- [x] AI edge function verifies: auth, tenant, plan, monthly cap
- [x] Import validation: size limits, formula injection, encoding
- [x] Audit logging for all mutations
- [x] Admin access logging with reason tracking
- [x] Stripe webhook idempotency table ready

## Tenant Isolation
- [x] All tables use `is_restaurant_owner()` or `is_recipe_owner()` in RLS
- [x] AI chat verifies restaurant ownership before fetching data
- [x] No cross-tenant data leakage possible via RLS

## Plan Gating (4 layers)
- [x] Layer 1: Sidebar hides locked features
- [x] Layer 2: Route guard shows upgrade prompt
- [x] Layer 3: AI edge function rejects non-Elite
- [x] Layer 4: Database RLS on subscriptions

## Admin Panel
- [x] Separate admin routes
- [x] Role-based access (master_admin, billing_admin, support_agent, auditor)
- [x] Audit log viewer
- [x] Access log viewer
- [ ] Admin reason modal for exports (future)
- [ ] Impersonation with logging (future)

## Import Pipeline
- [x] File size validation (10MB limit)
- [x] Row count validation (50,000 max)
- [x] Formula injection prevention
- [x] Date format validation
- [x] Negative quantity correction
- [x] Duplicate detection warning
- [x] Batch insertion (500 rows)
- [x] Audit logging on import

## AI Assistant
- [x] JWT auth verification via getClaims()
- [x] Tenant ownership verification
- [x] Elite plan enforcement
- [x] Monthly token cap (100K)
- [x] Input truncation (4000 chars)
- [x] Token usage logging
- [x] Rate limit error handling (429/402)

## Arabic RTL
- [x] Cairo font applied globally
- [x] `direction: rtl` on html
- [x] Sidebar on right side
- [x] All labels in Arabic
- [x] Landing page fully Arabic
- [x] Error messages in Arabic

## Stripe (Deferred)
- [x] `stripe_processed_events` table for idempotency
- [x] `subscriptions` table ready
- [x] Webhook endpoint implementation
- [x] Signature verification
- [ ] Portal link generation

## Tests
- [x] Unit tests for cost formulas
- [x] Unit tests for import validation
- [x] Unit tests for Saturday week aggregation
- [x] Unit tests for plan gating
- [x] Unit tests for export sanitization
- [ ] Integration tests for tenant isolation (requires real DB)
- [ ] E2E tests for critical workflows (requires Playwright)
