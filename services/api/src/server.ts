
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { db } from "./config/database.js";
import { hashToken, hashPassword } from "./utils/security.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./services/email.service.js";

dotenv.config();

// Supabase Admin Client (for server-side operations)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================
// PASSWORD RESET ENDPOINTS
// ============================================

/**
 * POST /auth/request-password-reset
 * Request a password reset token
 */
app.post("/auth/request-password-reset", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists in Supabase auth
    const { data: authUser, error: authError } = await supabaseAdmin
      .auth.admin
      .getUserByEmail(email);

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
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(email, resetUrl, authUser.user.email);

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
app.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    if (newPassword.length < 8) {
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
app.post("/auth/send-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    const { data: authUser, error: authError } = await supabaseAdmin
      .auth.admin
      .getUserByEmail(email);

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
    const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/email-verification?token=${rawToken}`;
    await sendVerificationEmail(email, verifyUrl, authUser.user.email);

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
app.get("/auth/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
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
app.use((err, req, res, next) => {
  console.error("[server error]", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📧 Email service: Postmark`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});

