# 🚀 Backend Setup - Quick Start

Your Node/Express backend is ready! Follow these steps to get it running.

## Step 1: Get Your API Keys

### Supabase Keys
1. Go to [Supabase Dashboard](https://app.supabase.com) → Your Project
2. **Settings → API**
   - Copy **Project URL** → `SUPABASE_URL`
   - Copy **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`
3. **Settings → Database**
   - Copy **Connection string** (URI format) → `DATABASE_URL`

### SendGrid API Key
1. Sign up at [SendGrid](https://sendgrid.com) (free: 100 emails/day)
2. **Settings → API Keys** → **Create API Key**
3. Choose **Restricted Access** → **Mail Send** → **Full Access**
4. Copy the key → `SENDGRID_API_KEY`
5. **Verify a sender email** in **Settings → Sender Authentication**

## Step 2: Set Up Database

Run this SQL in **Supabase SQL Editor**:

```sql
-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add email_verified to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_hash ON email_verification_tokens(token_hash);
```

## Step 3: Create .env File

**Option A: Use the setup script**
```bash
cd server
./setup-env.sh
```

**Option B: Create manually**

Create `.env` in the project root:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
SENDGRID_API_KEY=SG.your-api-key-here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Focus Studio
FRONTEND_URL=http://localhost:5173
PORT=4000
```

## Step 4: Start the Server

```bash
npm run server
```

You should see:
```
🚀 Backend server running on http://localhost:4000
📧 Email service: SendGrid
🔗 Frontend URL: http://localhost:5173
```

## Step 5: Update Frontend

Add to your frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

For production, use your deployed backend URL:
```env
VITE_API_BASE_URL=https://your-backend-url.com
```

## Step 6: Deploy (Optional)

### Railway (Easiest)
1. Sign up at [Railway](https://railway.app)
2. **New Project** → **Deploy from GitHub**
3. Add all environment variables
4. Deploy!

### Other Options
See `server/README.md` for Render, Vercel, DigitalOcean instructions.

## ✅ Test It

1. **Health Check**: `curl http://localhost:4000/health`
2. **Password Reset**: Use "Forgot Password" in the app
3. **Email Verification**: Sign up and check email

## 📚 Full Documentation

See `server/README.md` for detailed documentation.

## 🆘 Troubleshooting

- **"SENDGRID_API_KEY not set"** → Check `.env` file exists
- **"DATABASE_URL is not set"** → Get connection string from Supabase
- **"Failed to send email"** → Verify sender email in SendGrid
- **"Invalid token"** → Tokens expire after 1 hour (reset) or 24 hours (verification)

