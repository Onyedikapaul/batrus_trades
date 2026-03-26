import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvestmentPlan",
      required: true,
    },
    amount: { type: Number, required: true },
    return_amount: { type: Number }, // calculated on creation
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    expires_at: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model("Investment", investmentSchema);
