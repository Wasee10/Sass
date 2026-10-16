# SaaS Core

A responsive SaaS starter built with Next.js 16, React, and Supabase. It includes a marketing site, email/password and Google authentication, a protected account dashboard, account security controls, legal-page templates, and subscription UI.

## Design

- Cool porcelain backgrounds, deep navy text, and cobalt accents, with dark mode.
- Bricolage Grotesque headings and DM Sans body text, self-hosted through `next/font`.
- Responsive navigation and dashboard, visible keyboard focus, and reduced-motion support.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and fill in the values below.
3. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql).
4. Add `http://localhost:3000/auth/callback` and `http://localhost:3000/reset-password` to Supabase Auth's allowed redirect URLs.
5. If enabling Google sign-in, configure the Google provider in Supabase Auth and add its Supabase callback URL to the Google OAuth client's authorized redirect URIs.
6. Start the app with `npm run dev`.

The app uses a local demo account when Supabase keys are missing. Demo mode is not authentication and must not be used as production access control. A demo account has a free plan and no real billing history.

## Environment checklist

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes for Supabase features | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes for Supabase features | Browser-safe Supabase publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for account deletion | Server-only Supabase admin key; never prefix with `NEXT_PUBLIC_` or expose to the browser |
| `NEXT_PUBLIC_APP_URL` | Yes outside local development | Canonical app origin, e.g. `https://app.example.com` |

Keep `.env.local` out of version control. Rotate any key that has been exposed.

## Supabase data and seed

Run [`supabase/schema.sql`](./supabase/schema.sql) once to create profiles, subscriptions, invoices, RLS policies, and the new-user trigger.

Optional development seed:

1. Create/sign up `demo@saas-core.local` in your **local** Supabase Auth project.
2. Run [`supabase/seed.sql`](./supabase/seed.sql) against that local database.

The seed is idempotent and inserts clearly marked development invoices. Do not run it against production data.

Users can read their own subscription and invoice rows under RLS. Subscription writes are intentionally left to trusted server-side payment webhooks; no browser service-role key or direct subscription write is used.

## Authentication and rate limiting

Email/password registration, login, verification resend, password reset, password update, Google OAuth, and account deletion use Supabase Auth. In Supabase, configure the production site URL and callback allowlist for `/auth/callback` and `/reset-password`.

Supabase Auth applies platform rate limits, but this repository does not add a custom rate limiter. Before public launch, review the current limits in Supabase and configure suitable per-IP/per-account throttling at the edge (for example, Vercel Firewall or an appropriately configured rate-limit service) for sign-in, registration, password reset, and verification resend. Monitor rejected requests and avoid leaking whether an email address has an account.

## Billing status

No payment provider has been selected or connected. The checkout page does not collect card details; `/api/billing` verifies a Supabase session and returns `501 Payments are not configured`. The existing Stripe webhook placeholder also returns `501` rather than accepting unverified events. Prices in the marketing UI are placeholders.

Once a provider is selected (Stripe, Paddle, or Lemon Squeezy), implement that provider's verified webhook and customer portal. Webhook events must be signature-verified before using a server-only service-role client to write subscription and invoice rows.

## Deploy to Vercel

1. Import the project into Vercel and select the repository root.
2. Add the environment variables above to the appropriate Preview and Production environments. Set `NEXT_PUBLIC_APP_URL` to the corresponding canonical origin for each environment.
3. In Supabase Auth, set the production site URL and add the Vercel callback and password-reset URLs to the redirect allowlist. Add preview URLs only if you intend to test auth on previews.
4. Configure Google OAuth in Supabase and Google Cloud, using the callback URL shown in the Supabase provider settings.
5. Run the schema against the intended Supabase project, then validate signup, email verification, Google sign-in, password reset, protected dashboard access, and account deletion.
6. Run `npm run build` locally and deploy. In Vercel, verify the production deployment and review function logs for server-side configuration errors.
7. Before enabling paid billing, choose a provider and configure its secrets, verified webhook endpoint, and customer portal; do not treat the current checkout screen as a payment flow.

## Scripts

- `npm run dev` — local development
- `npm run lint` — ESLint
- `npm run build` — production build
- `npm run start` — serve a production build
