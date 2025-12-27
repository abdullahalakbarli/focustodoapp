# ✅ Setup Complete - Next Steps

Your backend is now fully configured with Postmark! Here's what to do next:

## ✅ What's Been Done

1. ✅ `.env` file created with all credentials
2. ✅ Email service switched from SendGrid to Postmark
3. ✅ Postmark package installed (`postmark@^3.0.23`)
4. ✅ Backend code updated to use Postmark API
5. ✅ Database tables already exist in Supabase
6. ✅ All syntax checks passed

## 🚀 Next Steps

### 1. Verify Postmark Sender Email

**Important**: Before sending emails, you need to verify your sender email in Postmark:

1. Go to [Postmark Dashboard](https://account.postmarkapp.com)
2. Navigate to **Senders** → **Add a Sender**
3. Add and verify: `noreply@focusstudio.app`
   - You'll receive a verification email
   - Click the verification link
4. Once verified, emails will work!

**Alternative**: If you have a different verified sender email, update `FROM_EMAIL` in `.env`

### 2. Start the Backend Server

```bash
npm run server
```

You should see:
```
🚀 Backend server running on http://localhost:4000
📧 Email service: Postmark
🔗 Frontend URL: http://localhost:5173
```

### 3. Update Frontend .env (if needed)

Make sure your frontend `.env` has:

```env
VITE_API_BASE_URL=http://localhost:4000
```

For production, change to your deployed backend URL.

### 4. Test the System

#### Test Password Reset:
1. Start the backend: `npm run server`
2. Start the frontend: `npm run dev`
3. Go to the app → Click "Forgot Password"
4. Enter your email
5. Check your email for the reset link
6. Click the link and reset your password

#### Test Email Verification:
1. Sign up a new account
2. Check your email for verification link
3. Click the link to verify

### 5. Deploy Backend (Production)

When ready to deploy:

#### Option 1: Railway (Recommended)
1. Sign up at [Railway](https://railway.app)
2. **New Project** → **Deploy from GitHub**
3. Select your repository
4. Add all environment variables from `.env`
5. Deploy!

#### Option 2: Render
1. Sign up at [Render](https://render.com)
2. **New** → **Web Service**
3. Connect GitHub repo
4. Build: `npm install`
5. Start: `node server/index.js`
6. Add environment variables
7. Deploy!

**Important**: Update `FRONTEND_URL` in production `.env` to your production frontend URL.

## 🔍 Troubleshooting

### "POSTMARK_API_TOKEN not set"
- Check `.env` file exists in project root
- Verify `POSTMARK_API_TOKEN` is set correctly

### "Email not sent" / Postmark errors
- Verify sender email in Postmark dashboard
- Check Postmark account limits
- Verify `FROM_EMAIL` matches verified sender in Postmark

### "Database connection failed"
- Check `DATABASE_URL` in `.env`
- Verify Supabase database is accessible
- Check if password is correct

### "Invalid token" errors
- Tokens expire: 1 hour (password reset), 24 hours (email verification)
- Each token can only be used once
- Request a new token if expired

## 📝 Environment Variables Summary

Your `.env` file contains:
- ✅ `SUPABASE_URL` - Your Supabase project URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Service role key for backend
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `POSTMARK_API_TOKEN` - Postmark server API token
- ✅ `FROM_EMAIL` - Verified sender email in Postmark
- ✅ `FROM_NAME` - Display name for emails
- ✅ `FRONTEND_URL` - Frontend URL for email links
- ✅ `PORT` - Backend server port (4000)

## 🎯 Quick Test Command

Test if the server starts correctly:

```bash
npm run server
```

Then in another terminal, test the health endpoint:

```bash
curl http://localhost:4000/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## 📚 Documentation

- Backend setup: `BACKEND_SETUP.md`
- Supabase config: `SUPABASE_CONFIG.md`
- Server docs: `server/README.md`

---

**You're all set!** Start the server and test the email flows! 🚀

