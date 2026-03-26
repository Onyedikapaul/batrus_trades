import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      required: true, // e.g. "bitcoin", "usdt trc20"
      trim: true,
    },

    walletAddress: {
      type: String,
      required: true,
      trim: true,
    },

    walletTitle: {
      type: String,
      default: null,
      trim: true,
    },

    description: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },

    // Admin who actioned the withdrawal
    actionedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    actionedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, strict: false },
);

export default mongoose.model("Withdrawal", withdrawalSchema);
