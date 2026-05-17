# Security Policy

## Reporting a Vulnerability

If you discover a security issue, please **do not** open a public GitHub issue with exploit details. Contact the maintainer privately so it can be addressed before disclosure.

## Secrets and Configuration

Never commit real credentials. This repository uses example env files only:

| File | Purpose |
|------|---------|
| `apps/web/.env.example` | Frontend (public anon key only) |
| `services/api/.env.example` | Backend secrets template |
| `apps/mobile/android/keystore.properties.example` | Release signing template |
| `apps/mobile/android/app/google-services.json.example` | Firebase config template |

Copy each `.example` to the real filename locally and fill in your values. Real `.env`, keystores, and `google-services.json` are gitignored.

### Required backend variables

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — server-side only
- `DATABASE_URL` — PostgreSQL connection
- `POSTMARK_API_TOKEN`, `FROM_EMAIL`, `FROM_NAME` — transactional email
- `FRONTEND_URL` — CORS and email link origin
- `ADMIN_CODE` — **server-only** secret for unlocking admin (do not use `VITE_` prefix)

## Admin access

Admin elevation is handled by `POST /admin/elevate` on the API using `ADMIN_CODE` and the user's session JWT. Clients cannot set `profiles.role` to `admin` directly; a database trigger blocks privilege escalation.

Apply `database/migrations/20260517000001_secure_profiles_role.sql` in your Supabase project.

## If credentials were ever committed

Rotate immediately in this order:

1. Supabase **database password** and **service_role** key  
2. Postmark (or email provider) API token  
3. Android signing keystore (if exposed)  
4. Firebase API key restrictions in Google Cloud Console  
5. `ADMIN_CODE` and any former `VITE_ADMIN_CODE`

Consider rewriting git history (`git filter-repo`) if secrets reached a public remote.

## Production checklist

- [ ] RLS enabled on all public tables  
- [ ] `ADMIN_CODE` is long and random  
- [ ] `FRONTEND_URL` matches your deployed web origin  
- [ ] Firebase/Android API keys restricted by package name  
- [ ] Supabase Auth redirect URLs configured for production domains  
