import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../model/UserModel.js";
import { handleReferralOnSignup } from "./ReferralController.js";
import crypto from "crypto";
import resend from "../lib/resend.js";
import { verificationEmailTemplate } from "../lib/email-templates/email-verification-templates.js";
import { forgotPasswordEmailTemplate } from "../lib/email-templates/forgot-password-template.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ── Cloudflare Turnstile verification helper ──
const verifyTurnstile = async (token) => {
  if (!token) return false;

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    },
  );

  const data = await res.json();
  return data.success === true;
};

// ─── REGISTER ────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
      "confirm-password": confirmPassword,
      ac,
      ref,
    } = req.body;

    // ── Turnstile check ──
    const turnstileValid = await verifyTurnstile(
      req.body["cf-turnstile-response"],
    );
    if (!turnstileValid) {
      return res.status(400).json({
        ok: false,
        message: "Captcha verification failed. Please try again.",
      });
    }

    if (!name || !username || !email || !password || !confirmPassword)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    if (!ac)
      return res
        .status(400)
        .json({ success: false, message: "You must agree to the terms." });
    if (password !== confirmPassword)
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match." });
    if (password.length < 6)
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });

    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return res
        .status(409)
        .json({ success: false, message: `${field} is already taken.` });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification code
    const rawCode = crypto.randomInt(100000, 999999).toString();
    const codeHash = crypto.createHash("sha256").update(rawCode).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    const user = await UserModel.create({
      name,
      username,
      email,
      password: hashedPassword,
      referralCode: username,
      emailVerified: false,
      emailVerifyCodeHash: codeHash,
      emailVerifyCodeExpiresAt: expiresAt,
    });

    await handleReferralOnSignup(user._id, ref);

    // Send verification email using template
    await resend.emails.send({
      from: "Batrus Trades <info@batrus-trades.pro>",
      to: [email],
      subject: "Verify your email address",
      html: verificationEmailTemplate({ name, code: rawCode }),
    });

    // Set cookie but user can't access account until verified
    // const token = generateToken(user._id);
    // res.cookie("token", token, cookieOptions);

    return res.status(201).json({
      success: true,
      message: "Account created! Check your email for the verification code.",
      redirectTo: `/auth/verify-email.html?email=${encodeURIComponent(email)}`,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { details, password } = req.body;

    // ── Turnstile check ──
    const turnstileValid = await verifyTurnstile(
      req.body["cf-turnstile-response"],
    );
    if (!turnstileValid) {
      return res.status(400).json({
        ok: false,
        message: "Captcha verification failed. Please try again.",
      });
    }

    if (!details || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });

    const user = await UserModel.findOne({
      $or: [
        { email: details.toLowerCase() },
        { username: details.toLowerCase() },
      ],
    });

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });

    // ✅ CHECK ACCOUNT STATUS
    const status = String(user.status || "active").toLowerCase();

    if (status === "suspended") {
      return res.status(403).json({
        success: false,
        message: `Your account is suspended. Reason: ${user.suspensionReason || "Please contact support."}`,
      });
    }

    if (status === "closed") {
      return res.status(403).json({
        success: false,
        message: "Your account is closed. Please contact support.",
      });
    }

    // ✅ CHECK EMAIL VERIFICATION
    if (!user.emailVerified) {
      // Generate and send a fresh code
      const rawCode = crypto.randomInt(100000, 999999).toString();
      const codeHash = crypto
        .createHash("sha256")
        .update(rawCode)
        .digest("hex");
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      await UserModel.findByIdAndUpdate(user._id, {
        emailVerifyCodeHash: codeHash,
        emailVerifyCodeExpiresAt: expiresAt,
      });

      try {
        await resend.emails.send({
          from: "Batrus Trades <info@batrus-trades.pro>",
          to: user.email,
          subject: "Verify Your Email - Batrus Trades",
          html: verificationEmailTemplate({ name: user.name, code: rawCode }),
        });
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
        return res.status(500).json({
          success: false,
          message: "Failed to send verification email. Please try again.",
        });
      }

      return res.status(403).json({
        success: false,
        message:
          "Email not verified. A verification code has been sent to your email.",
        needsVerification: true,
        redirectTo: `/auth/verify-email.html?email=${encodeURIComponent(user.email)}`,
      });
    }

    // ✅ ALL GOOD — log them in
    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful! Redirecting...",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

// ─── RESEND VERIFICATION CODE ───────────────────────────────────────────────
export const resendVerificationCode = async (req, res) => {
  try {
    const { user_email } = req.body;
    if (!user_email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });

    const user = await UserModel.findOne({ email: user_email.toLowerCase() });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    if (user.emailVerified)
      return res
        .status(400)
        .json({ success: false, message: "Email already verified." });

    // Check 1-minute cooldown
    if (
      user.emailVerifyCodeExpiresAt &&
      new Date() < user.emailVerifyCodeExpiresAt - 29 * 60 * 1000
    ) {
      return res.status(429).json({
        success: false,
        message: "You can request a new code after 1 minute.",
      });
    }

    const rawCode = crypto.randomInt(100000, 999999).toString();
    const codeHash = crypto.createHash("sha256").update(rawCode).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    user.emailVerifyCodeHash = codeHash;
    user.emailVerifyCodeExpiresAt = expiresAt;
    await user.save();

    await resend.emails.send({
      from: "Batrus Trades <info@batrus-trades.pro>",
      to: [user.email],
      subject: "Your new verification code",
      html: verificationEmailTemplate({ name: user.name, code: rawCode }),
    });

    return res.json({ success: true, message: "New code sent to your email." });
  } catch (err) {
    console.error("resendVerificationCode error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully." });
};

export const verifyEmail = async (req, res) => {
  try {
    const { code, email } = req.body;

    if (!code || !email)
      return res
        .status(400)
        .json({ success: false, message: "Code and email are required." });

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    if (user.emailVerified) {
      // Already verified — just log them in
      const token = generateToken(user._id);
      res.cookie("token", token, cookieOptions);
      return res.json({
        success: true,
        message: "Email already verified.",
        redirectTo: "/account",
      });
    }

    if (!user.emailVerifyCodeHash || !user.emailVerifyCodeExpiresAt)
      return res.status(400).json({
        success: false,
        message: "No verification code found. Request a new one.",
      });

    if (new Date() > user.emailVerifyCodeExpiresAt)
      return res.status(400).json({
        success: false,
        message: "Code has expired. Request a new one.",
      });

    const inputHash = crypto
      .createHash("sha256")
      .update(code.trim())
      .digest("hex");
    if (inputHash !== user.emailVerifyCodeHash)
      return res
        .status(400)
        .json({ success: false, message: "Invalid code. Please try again." });

    user.emailVerified = true;
    user.emailVerifyCodeHash = null;
    user.emailVerifyCodeExpiresAt = null;
    await user.save();

    // Now log them in
    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions);

    return res.json({
      success: true,
      message: "Email verified! Redirecting...",
      redirectTo: "/account",
    });
  } catch (err) {
    console.error("verifyEmail error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });

    const user = await UserModel.findOne({ email: email.toLowerCase() });

    // Don't reveal if email exists or not
    if (!user)
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });

    const rawCode = crypto.randomInt(100000, 999999).toString();
    const codeHash = crypto.createHash("sha256").update(rawCode).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    user.emailVerifyCodeHash = codeHash;
    user.emailVerifyCodeExpiresAt = expiresAt;
    await user.save();

    await resend.emails.send({
      from: "Batrus Trades <info@batrus-trades.pro>",
      to: [user.email],
      subject: "Password Reset Code - Batrus Trades",
      html: forgotPasswordEmailTemplate({ name: user.name, code: rawCode }),
    });

    return res.json({
      success: true,
      message: "Reset code sent to your email.",
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });

    if (newPassword.length < 6)
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    if (!user.emailVerifyCodeHash || !user.emailVerifyCodeExpiresAt)
      return res.status(400).json({
        success: false,
        message: "No reset code found. Request a new one.",
      });

    if (new Date() > user.emailVerifyCodeExpiresAt)
      return res.status(400).json({
        success: false,
        message: "Code has expired. Request a new one.",
      });

    const inputHash = crypto
      .createHash("sha256")
      .update(code.trim())
      .digest("hex");
    if (inputHash !== user.emailVerifyCodeHash)
      return res
        .status(400)
        .json({ success: false, message: "Invalid code. Please try again." });

    user.password = await bcrypt.hash(newPassword, 12);
    user.emailVerifyCodeHash = null;
    user.emailVerifyCodeExpiresAt = null;
    await user.save();

    return res.json({
      success: true,
      message: "Password reset successfully! You can now log in.",
    });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
