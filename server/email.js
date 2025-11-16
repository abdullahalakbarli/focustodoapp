import postmark from "postmark";
import dotenv from "dotenv";

dotenv.config();

// Initialize Postmark
const postmarkClient = process.env.POSTMARK_API_TOKEN
  ? new postmark.ServerClient(process.env.POSTMARK_API_TOKEN)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@focusstudio.app";
const FROM_NAME = process.env.FROM_NAME || "Focus Studio";

/**
 * Send email verification email
 */
export async function sendVerificationEmail(email, verifyUrl, displayEmail) {
  if (!postmarkClient) {
    console.warn("[email] POSTMARK_API_TOKEN not set. Email not sent.");
    console.log(`[email] Verification link for ${email}: ${verifyUrl}`);
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Focus Studio</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Focus Studio</h1>
        </div>
        <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
          <p style="color: #666; font-size: 16px;">
            Hi there! 👋
          </p>
          <p style="color: #666; font-size: 16px;">
            Thank you for signing up for Focus Studio. To complete your registration, please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verifyUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #667eea; font-size: 12px; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
            ${verifyUrl}
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} Focus Studio. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
    Verify Your Email Address - Focus Studio

    Hi there!

    Thank you for signing up for Focus Studio. To complete your registration, please verify your email address by visiting this link:

    ${verifyUrl}

    This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.

    © ${new Date().getFullYear()} Focus Studio. All rights reserved.
  `;

  try {
    await postmarkClient.sendEmail({
      From: `${FROM_NAME} <${FROM_EMAIL}>`,
      To: email,
      Subject: "Verify Your Email - Focus Studio",
      TextBody: text,
      HtmlBody: html,
      MessageStream: "outbound",
    });
    console.log(`[email] Verification email sent to ${email}`);
  } catch (error) {
    console.error("[email] Postmark error:", error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, resetUrl, displayEmail) {
  if (!postmarkClient) {
    console.warn("[email] POSTMARK_API_TOKEN not set. Email not sent.");
    console.log(`[email] Password reset link for ${email}: ${resetUrl}`);
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Focus Studio</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Focus Studio</h1>
        </div>
        <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #666; font-size: 16px;">
            Hi there! 👋
          </p>
          <p style="color: #666; font-size: 16px;">
            We received a request to reset your password for your Focus Studio account. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #667eea; font-size: 12px; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
            ${resetUrl}
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email and your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} Focus Studio. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
    Reset Your Password - Focus Studio

    Hi there!

    We received a request to reset your password for your Focus Studio account. Visit this link to create a new password:

    ${resetUrl}

    This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email and your password will remain unchanged.

    © ${new Date().getFullYear()} Focus Studio. All rights reserved.
  `;

  try {
    await postmarkClient.sendEmail({
      From: `${FROM_NAME} <${FROM_EMAIL}>`,
      To: email,
      Subject: "Reset Your Password - Focus Studio",
      TextBody: text,
      HtmlBody: html,
      MessageStream: "outbound",
    });
    console.log(`[email] Password reset email sent to ${email}`);
  } catch (error) {
    console.error("[email] Postmark error:", error);
    throw error;
  }
}

