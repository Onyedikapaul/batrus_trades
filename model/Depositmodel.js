import mongoose from "mongoose";

const depositSchema = new mongoose.Schema(
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

    paymentMethod: {
      type: String,
      required: true, // e.g. "bitcoin", "ethereum", "usdt trc20"
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled"],
      default: "pending",
    },

    // Admin who actioned the deposit
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

    note: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, strict: false },
);

export default mongoose.model("Deposit", depositSchema);