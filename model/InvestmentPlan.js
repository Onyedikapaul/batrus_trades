import mongoose from "mongoose";

const investmentPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    min_amount: { type: Number, required: true },
    max_amount: { type: Number, required: true },
    duration_hours: { type: Number, required: true },
    return_percentage: { type: Number, required: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("InvestmentPlan", investmentPlanSchema);