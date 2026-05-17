
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import "./config/env.js";
import { db } from "./config/database.js";
import { hashToken } from "./utils/security.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./services/email.service.js";

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Supabase Admin Client (for server-side operations)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const app = express();
const PORT = process.env.PORT || 4000;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many admin attempts. Please try again later." },
});

async function getUserFromBearer(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }
  return data.user;
}

// Middleware
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "32kb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================
// ADMIN ENDPOINTS (server-side secret only)
// ============================================

app.post("/admin/elevate", adminLimiter, async (req, res) => {
  try {
    const adminCode = process.env.ADMIN_CODE?.trim();
    if (!adminCode) {
      return res.status(503).json({ error: "Admin elevation is not configured on the server" });
    }

    const user = await getUserFromBearer(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { code } = req.body as { code?: string };
    if (!code || code.trim() !== adminCode) {
      return res.status(403).json({ error: "Invalid admin code" });
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);

    if (error) {
      console.error("[admin/elevate]", error);
      return res.status(500).json({ error: "Failed to grant admin access" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("[admin/elevate]", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/admin/revoke", adminLimiter, async (req, res) => {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role: "user" })
      .eq("id", user.id);

    if (error) {
      console.error("[admin/revoke]", error);
      return res.status(500).json({ error: "Failed to revoke admin access" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("[admin/revoke]", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============================================
// PASSWORD RESET ENDPOINTS
// ============================================

/**
 * POST /auth/request-password-reset
 * Request a password reset token
 */
app.post("/auth/request-password-reset", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Check if user exists in Supabase auth
    const { data: authUser, error: authError } = await supabaseAdmin
      .auth.admin
      .getUserByEmail(normalizedEmail);

    if (authError || !authUser?.user) {
      // Don't reveal if email exists (security best practice)
      return res.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate secure token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Delete old tokens for this user, then insert new one
    await db.none(
      `DELETE FROM password_reset_tokens WHERE user_id = $1`,
      [authUser.user.id]
    );
    await db.none(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used)
       VALUES ($1, $2, $3, false)`,
      [authUser.user.id, hashedToken, expiresAt]
    );

    // Send email with reset link
    const resetUrl = `${allowedOrigins[0]}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(normalizedEmail, resetUrl, authUser.user.email);

    res.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("[request-password-reset]", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /auth/reset-password
 * Reset password using token
 */
app.post("/auth/reset-password", authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Hash the provided token
    const hashedToken = hashToken(token);

    // Find valid token
    const tokenRecord = await db.oneOrNone(
      `SELECT prt.*, p.email
       FROM password_reset_tokens prt
       JOIN auth.users au ON prt.user_id = au.id
       JOIN profiles p ON p.id = au.id
       WHERE prt.token_hash = $1 
         AND prt.used = false 
         AND prt.expires_at > NOW()`,
      [hashedToken]
    );

    if (!tokenRecord) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenRecord.user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("[reset-password] Supabase update error:", updateError);
      return res.status(500).json({ error: "Failed to update password" });
    }

    // Mark token as used
    await db.none(
      `UPDATE password_reset_tokens SET used = true WHERE token_hash = $1`,
      [hashedToken]
    );

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("[reset-password]", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============================================
// EMAIL VERIFICATION ENDPOINTS
// ============================================

/**
 * POST /auth/send-verification
 * Send email verification token
 */
app.post("/auth/send-verification", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const { data: authUser, error: authError } = await supabaseAdmin
      .auth.admin
      .getUserByEmail(normalizedEmail);

    if (authError || !authUser?.user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already verified
    const profile = await db.oneOrNone(
      `SELECT email_verified FROM profiles WHERE id = $1`,
      [authUser.user.id]
    );

    if (profile?.email_verified) {
      return res.json({
        success: true,
        message: "Email is already verified",
      });
    }

    // Generate verification token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 86400000); // 24 hours

    // Delete old tokens for this user, then insert new one
    await db.none(
      `DELETE FROM email_verification_tokens WHERE user_id = $1`,
      [authUser.user.id]
    );
    await db.none(
      `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at, used)
       VALUES ($1, $2, $3, false)`,
      [authUser.user.id, hashedToken, expiresAt]
    );

    // Send verification email
    const verifyUrl = `${allowedOrigins[0]}/email-verification?token=${rawToken}`;
    await sendVerificationEmail(normalizedEmail, verifyUrl, authUser.user.email);

    res.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    console.error("[send-verification]", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /auth/verify-email
 * Verify email using token
 */
app.get("/auth/verify-email", authLimiter, async (req, res) => {
  try {
    const token = req.query.token;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Token is required" });
    }

    // Hash the provided token
    const hashedToken = hashToken(token);

    // Find valid token
    const tokenRecord = await db.oneOrNone(
      `SELECT evt.*, p.email
       FROM email_verification_tokens evt
       JOIN auth.users au ON evt.user_id = au.id
       JOIN profiles p ON p.id = au.id
       WHERE evt.token_hash = $1 
         AND evt.used = false 
         AND evt.expires_at > NOW()`,
      [hashedToken]
    );

    if (!tokenRecord) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Mark email as verified in profiles table
    await db.none(
      `UPDATE profiles SET email_verified = true WHERE id = $1`,
      [tokenRecord.user_id]
    );

    // Update Supabase Auth email verification status
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenRecord.user_id,
      { email_confirm: true }
    );

    if (updateError) {
      console.error("[verify-email] Supabase update error:", updateError);
      // Continue even if Supabase update fails
    }

    // Mark token as used
    await db.none(
      `UPDATE email_verification_tokens SET used = true WHERE token_hash = $1`,
      [hashedToken]
    );

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("[verify-email]", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "Origin not allowed" });
    return;
  }
  console.error("[server error]", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📧 Email service: Postmark`);
  console.log(`🔗 Allowed frontend origins: ${allowedOrigins.join(", ")}`);
});
