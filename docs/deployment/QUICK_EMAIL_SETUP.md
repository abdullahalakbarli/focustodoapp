# ⚡ Quick Email Setup Guide

## 🎯 Fastest Way to Start Sending Emails

### Option A: Use Your Personal Email (Quickest - 2 minutes)

1. **Go to Postmark Dashboard**
   - [Postmark Senders](https://account.postmarkapp.com/signatures)
   - Click **Add a Sender**

2. **Add Your Email**
   - Enter your personal email (e.g., `yourname@gmail.com`)
   - Postmark sends verification email
   - Click verification link
   - ✅ Done!

3. **Update `.env`**
   ```env
   FROM_EMAIL=yourname@gmail.com
   FROM_NAME=Focus Studio
   ```

4. **Start Sending!**
   ```bash
   npm run server
   ```

**Note**: This works for testing, but for production, use a custom domain.

---

### Option B: Use a Custom Domain (Production - 15 minutes)

1. **Register Domain** (if needed)
   - Buy `focusstudio.app` from Namecheap/GoDaddy (~$15/year)

2. **Verify Domain in Postmark**
   - Postmark Dashboard → **Senders** → **Domains** → **Add Domain**
   - Add DNS records Postmark provides
   - Wait 5-30 minutes
   - Click **Verify**

3. **Update `.env`**
   ```env
   FROM_EMAIL=noreply@focusstudio.app
   FROM_NAME=Focus Studio
   ```

4. **Start Sending!**

---

## 🚀 Right Now: Test with Your Email

**Quickest path to test:**

1. Open: https://account.postmarkapp.com/signatures
2. Click **Add a Sender**
3. Enter your email address
4. Verify the email Postmark sends
5. Update `.env` with your verified email
6. Run: `npm run server`
7. Test password reset in your app!

---

## 📧 Current Configuration

Your `.env` currently has:
```env
FROM_EMAIL=noreply@focusstudio.app
FROM_NAME=Focus Studio
```

**To use this**, you need to:
- Own `focusstudio.app` domain, OR
- Change `FROM_EMAIL` to a verified email in Postmark

---

## ✅ Recommended Next Steps

1. **For Testing**: Use your personal email (Option A above)
2. **For Production**: Set up `focusstudio.app` domain (Option B above)

See `DOMAIN_SETUP.md` for detailed domain setup instructions.

