# ✅ Supabase Configuration - Already Set Up!

Great news! Your Supabase database is already configured for the custom email system.

## 📊 Database Status

### ✅ Tables Already Created

1. **`password_reset_tokens`** ✓
   - Columns: `id`, `user_id`, `token_hash`, `expires_at`, `used`, `used_at`, `created_at`
   - Foreign key to `auth.users`
   - Indexes on `user_id` and `token_hash`

2. **`email_verification_tokens`** ✓
   - Columns: `id`, `user_id`, `token_hash`, `expires_at`, `used`, `used_at`, `created_at`
   - Foreign key to `auth.users`
   - Indexes on `user_id` and `token_hash`

3. **`profiles.email_verified`** ✓
   - Column exists: `email_verified` (boolean, default: false)

### 🔗 Project Information

- **Project URL**: `https://your-project-ref.supabase.co`
- **Anon Key**: Already configured in your frontend

## 🔑 What You Still Need

### 1. Supabase Service Role Key (for backend)

This is needed for the backend server to:
- Look up users by email
- Update user passwords
- Update email verification status

**How to get it:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. **Settings → API**
4. Copy the **`service_role` key** (secret key, not the anon key)
5. Add it to your `.env` file as `SUPABASE_SERVICE_ROLE_KEY`

### 2. Database Connection String

**How to get it:**
1. Supabase Dashboard → **Settings → Database**
2. Under **Connection string**, select **URI**
3. Copy the connection string
4. It looks like: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
5. Add it to your `.env` file as `DATABASE_URL`

**Note**: You'll need your database password. If you forgot it:
- Go to **Settings → Database → Reset database password**

### 3. SendGrid API Key

1. Sign up at [SendGrid](https://sendgrid.com) (free tier: 100 emails/day)
2. **Settings → API Keys** → **Create API Key**
3. Choose **Restricted Access** → **Mail Send** → **Full Access**
4. Copy the key (starts with `SG.`)
5. Add to `.env` as `SENDGRID_API_KEY`

### 4. Verify Sender Email in SendGrid

1. **Settings → Sender Authentication**
2. Click **Verify a Single Sender**
3. Enter your email and verify it
4. Use this email in `.env` as `FROM_EMAIL`

## 📝 Complete .env File Template

Create `.env` in your project root:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Connection
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Email Service (SendGrid)
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Focus Studio

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Server Port
PORT=4000
```

## 🚀 Quick Setup

1. **Get Service Role Key** from Supabase Dashboard
2. **Get Database URL** from Supabase Dashboard
3. **Get SendGrid API Key** from SendGrid
4. **Create `.env` file** with the template above
5. **Start the server**: `npm run server`

## ✅ What's Already Done

- ✅ Database tables created
- ✅ Foreign keys configured
- ✅ Indexes created for performance
- ✅ Backend code updated to match your schema
- ✅ Frontend pages ready (`ResetPassword.tsx`, `EmailVerification.tsx`)
- ✅ Auth page updated to use backend API

## 🎯 Next Steps

1. Get the 3 API keys/credentials above
2. Create `.env` file
3. Test the server: `npm run server`
4. Test password reset flow in the app
5. Deploy backend (Railway, Render, etc.)

## 📚 More Info

- Backend setup: See `BACKEND_SETUP.md`
- Server documentation: See `server/README.md`

