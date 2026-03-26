import mongoose from "mongoose";

const earningSchema = new mongoose.Schema(
  {
    depositAmount: {
      type: Number,
      required: true,
    },

    percentage: {
      type: Number,
      required: true,
    },

    earned: {
      type: Number,
      required: true, // (percentage / 100) * depositAmount
    },
  },
  { timestamps: true }, // each earning has its own createdAt
);

const referralSchema = new mongoose.Schema(
  {
    // Who shared the referral link
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Who signed up using the referral link
    referred: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // a user can only be referred once
    },

    percentage: {
      type: Number,
      default: 10, // 10% of each deposit
    },

    // List of earnings from each deposit
    earnings: {
      type: [earningSchema],
      default: [],
    },

    // Running total — updated on every deposit
    totalEarned: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Referral", referralSchema);
