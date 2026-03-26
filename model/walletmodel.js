import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    coin: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      // e.g. "bitcoin", "ethereum", "tether usdt trc20"
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      // e.g. "BTC", "ETH", "USDT"
    },
    network: {
      type: String,
      default: null,
      trim: true,
      // e.g. "TRC20", "ERC20", null
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Wallet", walletSchema);
