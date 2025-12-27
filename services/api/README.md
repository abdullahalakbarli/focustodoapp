# Backend Server Setup Guide

This backend server handles custom email verification and password reset flows for Focus Studio.

## 📋 Prerequisites

1. **Node.js** (v20 or higher)
2. **Supabase Project** with database access
3. **SendGrid Account** (or another email provider)

## 🔑 Getting API Keys

### 1. Supabase Keys

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings → API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Database Connection String

1. In Supabase Dashboard, go to **Settings → Database**
2. Under **Connection string**, select **URI**
3. Copy the connection string → `DATABASE_URL`
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`
   - Replace `[PASSWORD]` with your database password

### 3. SendGrid API Key

1. Sign up at [SendGrid](https://sendgrid.com) (free tier: 100 emails/day)
2. Go to **Settings → API Keys**
3. Click **Create API Key**
4. Choose **Restricted Access** → **Mail Send** → **Full Access**
5. Copy the API key → `SENDGRID_API_KEY`
   - Format: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 4. Email Configuration

- `FROM_EMAIL`: Your verified sender email (e.g., `noreply@yourdomain.com`)
- `FROM_NAME`: Display name (e.g., `Focus Studio`)

**Note**: In SendGrid, you need to verify a sender email first:
1. Go to **Settings → Sender Authentication**
2. Click **Verify a Single Sender**
3. Follow the verification steps

## 🗄️ Database Setup

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add email_verified column to profiles (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_hash ON email_verification_tokens(token_hash);
```

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Connection (PostgreSQL - Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres

# Email Service (SendGrid)
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Focus Studio

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173

# Server Port
PORT=4000
```

## 🚀 Running the Server

### Development

```bash
# Install dependencies (if not already installed)
npm install

# Start the server
npm run server

# Or directly:
node server/index.js
```

The server will start on `http://localhost:4000` (or your `PORT` value).

### Test the Server

```bash
# Health check
curl http://localhost:4000/health
```

## 📡 API Endpoints

### Password Reset

- **POST** `/auth/request-password-reset`
  - Body: `{ "email": "user@example.com" }`
  - Response: `{ "success": true, "message": "..." }`

- **POST** `/auth/reset-password`
  - Body: `{ "token": "...", "newPassword": "..." }`
  - Response: `{ "success": true, "message": "Password reset successfully" }`

### Email Verification

- **POST** `/auth/send-verification`
  - Body: `{ "email": "user@example.com" }`
  - Response: `{ "success": true, "message": "Verification email sent" }`

- **GET** `/auth/verify-email?token=...`
  - Response: `{ "success": true, "message": "Email verified successfully" }`

## 🌐 Deployment Options

### Option 1: Railway (Recommended - Easy)

1. Sign up at [Railway](https://railway.app)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Add environment variables (from `.env`)
5. Railway auto-detects Node.js and deploys

### Option 2: Render

1. Sign up at [Render](https://render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
5. Add environment variables
6. Deploy

### Option 3: Vercel (Serverless)

1. Install Vercel CLI: `npm i -g vercel`
2. Create `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server/index.js"
       }
     ]
   }
   ```
3. Run: `vercel`

### Option 4: DigitalOcean App Platform

1. Sign up at [DigitalOcean](https://www.digitalocean.com)
2. Create **App** → **GitHub**
3. Configure build and start commands
4. Add environment variables
5. Deploy

## 🔒 Security Notes

- **Never commit `.env` file** to Git
- **Service Role Key** is secret - only use on backend
- Tokens expire after 1 hour (password reset) or 24 hours (email verification)
- Tokens are hashed before storage (SHA-256)
- Single-use tokens (marked as `used` after use)

## 🐛 Troubleshooting

### "SENDGRID_API_KEY not set"
- Check your `.env` file exists and has the correct key
- Restart the server after adding environment variables

### "DATABASE_URL is not set"
- Get the connection string from Supabase Dashboard
- Make sure the password is correct

### "Failed to send email"
- Verify your SendGrid sender email is verified
- Check SendGrid API key permissions
- Check SendGrid account limits (free tier: 100/day)

### "Invalid or expired token"
- Tokens expire after their time limit
- Each token can only be used once
- Request a new token if expired

## 📝 Frontend Configuration

After deploying, update your frontend `.env`:

```env
VITE_API_BASE_URL=https://your-backend-url.com
```

For local development:
```env
VITE_API_BASE_URL=http://localhost:4000
```

## ✅ Testing Checklist

- [ ] Server starts without errors
- [ ] Health check endpoint works (`/health`)
- [ ] Password reset email is sent
- [ ] Password reset link works
- [ ] Email verification email is sent
- [ ] Email verification link works
- [ ] Tokens expire correctly
- [ ] Used tokens cannot be reused

