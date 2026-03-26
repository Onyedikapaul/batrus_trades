import InvestmentPlan from "../model/InvestmentPlan.js";

// GET /api/investment/plans
export const fetchInvestmentPlan = async (req, res) => {
  try {
    const plans = await InvestmentPlan.find({ is_active: true });
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};