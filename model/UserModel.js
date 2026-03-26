import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["active", "suspended", "closed"],
      default: "active",
    },

    suspensionReason: {
      type: String,
      default: null,
    },

    account_balance: {
      type: Number,
      required: true,
      default: 0,
    },

    isAllowedToWithdraw: {
      type: Boolean,
      default: true,
    },

    blockedWithdrawalReason: {
      type: String,
      default: null,
    },

    isAllowedToDeposit: {
      type: Boolean,
      default: true,
    },

    blockedDepositReason: {
      type: String,
      default: null,
    },

    // ─── Referral ──────────────────────────────────────────────────────────────
    referralCode: {
      type: String,
      unique: true,
      sparse: true, // allows null without unique conflict
      default: null,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    referralCount: {
      type: Number,
      default: 0,
    },

    // ─── Security PIN ──────────────────────────────────────────────────────────
    securityPin: {
      type: String, // stored as hashed value
      default: null,
    },

    securityPinEnabled: {
      type: Boolean,
      default: false,
    },

    // ─── Email Verification ────────────────────────────────────────────────────
    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifyCodeHash: {
      type: String,
      default: null,
    },

    emailVerifyCodeExpiresAt: {
      type: Date,
      default: null,
    },

    // ─── Activity Logs ─────────────────────────────────────────────────────────
    saveActivityLogs: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    lastLoginIp: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
