# Production Deployment Checklist & Strategies

This document provides the final verifications and configurations needed to bring the BloodConnect platform safely into a production state. It covers performance testing, backup strategies, and critical pre-flight checks.

---

## 1. Backup Strategy (Supabase)

To guarantee no data loss and maintain high availability:
1. Open the Supabase Dashboard and navigate to **Database > Backups**.
2. **Enable Point in Time Recovery (PITR)**: Provides the ability to restore the database to any specific second in the past up to your retention period.
3. **Set Retention Policy**: Ensure your plan supports a 7-day to 30-day retention scheme.
4. **Test Restore**: Setup a Staging project and run a test restore using yesterday's backup to verify data integrity.

---

## 2. Load Testing

Simulate high-concurrency environments to ensure the middleware, Next.js frontend, and Supabase PostGIS queries remain stable under pressure.

### Executing Load Tests
We've prepared a `load-test.js` script to be run with [k6](https://k6.io/).
1. Install k6 on your machine (`brew install k6`).
2. Open terminal at the project root.
3. Run the following command (substituting with a valid JWT if needed for authenticated requests):

\`\`\`bash
# Run against local production build
k6 run load-test.js -e BASE_URL=http://localhost:3000

# Run with authentication against staging
k6 run load-test.js -e BASE_URL=https://staging.domain.com -e JWT_TOKEN=your_token
\`\`\`

---

## 3. Environment & Secrets Management

Ensure you have created segregated environments (`Development`, `Staging`, `Production`) in Vercel (or your hosting provider). Set the following keys exclusively in production:

- **Supabase Credentials**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Sentry Observability**: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`.
- **Upstash Redis**: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (Triggers Rate Limiting Middleware).

> **Important**: Keep `SUPABASE_SERVICE_ROLE_KEY` completely secret. Never embed it in the client bundle.

---

## 4. Final Deployment Checklist

Before going live, verify the following checks have passed:

- [ ] **API Rate Limiting Configured:** Upstash Redis credentials injected and `middleware.ts` is protecting `/auth` and heavy `/api` routes against spam.
- [ ] **Strict Security Headers Verified:** Content-Security-Policy, HSTS, and X-Frame-Options are returned by the server on requests.
- [ ] **Input Validation Intact:** All frontend and backend APIs rigorously check schemas using Zod before any DB processing.
- [ ] **Automated Migrations Run:** Ensure `018_production_hardening.sql` (and all preceding migrations) has been successfully executed in the production Supabase database.
- [ ] **Indices Active:** Database is appropriately indexed against querying hotspots like `requests(status, created_at)`.
- [ ] **Background Jobs Verified:** Check Supabase logs to confirm pg_cron tasks (Emergency Escalation, Reminders) execute flawlessly without single points of failure interrupting iterations.
- [ ] **Sentry Telemetry:** Verify that application exceptions and unhandled promise rejections are streaming to your Sentry dashboard via `@sentry/nextjs`.
- [ ] **Storage Buckets Non-Public:** Check `prescriptions` and `org-documents` in Supabase Storage to ensure public access is disabled and RLS is shielding documents.
- [ ] **Zero Mock Data:** Validate that mock Zustand stores (if any) are fully purged and the codebase exclusively relies on real APIs.
- [ ] **Health Endpoint Operational:** Call `GET /api/health` and verify the connectivity logic returns the operational flag.
