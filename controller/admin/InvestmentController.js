import InvestmentPlan from "../../model/InvestmentPlan.js";

// Fetch ALL plans (including inactive) for admin
export const fetchAllPlans = async (req, res) => {
  try {
    const plans = await InvestmentPlan.find().sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create new plan
export const createPlan = async (req, res) => {
  try {
    const { name, min_amount, max_amount, duration_hours, return_percentage } =
      req.body;
    const plan = await InvestmentPlan.create({
      name,
      min_amount,
      max_amount,
      duration_hours,
      return_percentage,
    });
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Toggle is_active
export const togglePlan = async (req, res) => {
  try {
    const plan = await InvestmentPlan.findById(req.params.id);
    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    plan.is_active = !plan.is_active;
    await plan.save();
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const plan = await InvestmentPlan.findByIdAndDelete(req.params.id);
    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    res.json({ success: true, message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
