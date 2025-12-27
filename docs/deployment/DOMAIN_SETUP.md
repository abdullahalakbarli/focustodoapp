# 🌐 Setting Up focusstudio.app for Email

This guide explains how to set up your domain `focusstudio.app` for sending emails through Postmark.

## 📋 Option 1: If You Already Own the Domain

If you already own `focusstudio.app`, skip to **Step 2: Verify Domain in Postmark**.

## 📋 Option 2: If You Need to Register the Domain

### Step 1: Register the Domain

1. **Check Domain Availability**
   - Go to a domain registrar (Namecheap, GoDaddy, Google Domains, etc.)
   - Search for `focusstudio.app`
   - If available, purchase it (usually $10-30/year for `.app` domains)

2. **Popular Domain Registrars**
   - [Namecheap](https://www.namecheap.com) - Recommended
   - [GoDaddy](https://www.godaddy.com)
   - [Google Domains](https://domains.google)
   - [Cloudflare Registrar](https://www.cloudflare.com/products/registrar)

3. **After Purchase**
   - You'll get access to DNS management
   - Keep your registrar account details safe

## 🔧 Step 2: Verify Domain in Postmark

### For Domain Verification (Recommended)

1. **Go to Postmark Dashboard**
   - Visit [Postmark Dashboard](https://account.postmarkapp.com)
   - Navigate to **Senders** → **Domains** → **Add a Domain**

2. **Add Your Domain**
   - Enter: `focusstudio.app`
   - Click **Add Domain**

3. **Get DNS Records**
   - Postmark will show you DNS records to add:
     - **SPF Record** (TXT)
     - **DKIM Records** (CNAME)
     - **Return-Path** (CNAME)
     - **DMARC Record** (TXT) - Optional but recommended

4. **Add DNS Records to Your Domain**
   - Go to your domain registrar's DNS management
   - Add each record Postmark provides
   - Wait 5-30 minutes for DNS propagation

5. **Verify in Postmark**
   - Click **Verify Domain** in Postmark
   - Once verified, you can use any email address like:
     - `noreply@focusstudio.app`
     - `support@focusstudio.app`
     - `hello@focusstudio.app`

### For Single Sender Verification (Easier, but limited)

If you don't want to verify the whole domain:

1. **Go to Postmark Dashboard**
   - **Senders** → **Add a Sender**

2. **Add Email Address**
   - Enter: `noreply@focusstudio.app`
   - Postmark will send a verification email

3. **Verify Email**
   - Check your email inbox
   - Click the verification link
   - Done!

**Note**: Single sender verification is easier but you can only use that one email address. Domain verification lets you use any email address on your domain.

## 📝 Step 3: Update Your .env File

Once verified, update your `.env`:

```env
FROM_EMAIL=noreply@focusstudio.app
FROM_NAME=Focus Studio
```

## 🔍 Step 4: Test Email Sending

1. **Start your backend server:**
   ```bash
   npm run server
   ```

2. **Test password reset:**
   - Use the "Forgot Password" feature in your app
   - Check if email arrives

3. **Check Postmark Dashboard:**
   - Go to **Activity** → **Sent**
   - See if emails are being sent successfully

## 🚨 Common Issues & Solutions

### "Domain not verified"
- Make sure all DNS records are added correctly
- Wait 24-48 hours for DNS propagation
- Use [DNS Checker](https://dnschecker.org) to verify records globally

### "Email bounced"
- Check Postmark **Activity** → **Bounces**
- Verify recipient email is valid
- Check spam folder

### "Can't add DNS records"
- Make sure you have access to DNS management
- Some registrars require you to use their nameservers
- Contact your registrar support if needed

## 📚 DNS Records Explained

### SPF Record
- Prevents email spoofing
- Format: `v=spf1 include:spf.mtasv.net ~all`

### DKIM Records
- Adds cryptographic signature to emails
- Multiple CNAME records (usually 2-3)

### Return-Path
- Sets the bounce address
- CNAME record pointing to Postmark

### DMARC Record (Optional)
- Email authentication policy
- Format: `v=DMARC1; p=none; rua=mailto:dmarc@focusstudio.app`

## 🎯 Quick Checklist

- [ ] Domain registered (if needed)
- [ ] DNS records added to domain
- [ ] Domain verified in Postmark
- [ ] `.env` file updated with `FROM_EMAIL`
- [ ] Test email sent successfully

## 💡 Alternative: Use a Subdomain

If you don't want to use the main domain, you can use a subdomain:

- `mail.focusstudio.app`
- `noreply.focusstudio.app`
- `app.focusstudio.app`

Just verify the subdomain in Postmark the same way!

## 🔗 Useful Links

- [Postmark Domain Setup Guide](https://postmarkapp.com/support/article/1006-how-do-i-verify-my-domain)
- [Postmark DNS Records Guide](https://postmarkapp.com/support/article/1007-what-dns-records-do-i-need-to-add)
- [DNS Checker Tool](https://dnschecker.org)

---

**Need Help?** Check Postmark's support documentation or their support team!

