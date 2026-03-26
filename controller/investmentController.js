import Investmentmodel from "../model/Investmentmodel.js";
import InvestmentPlan from "../model/InvestmentPlan.js";
import UserModel from "../model/UserModel.js";
import { requireKYC } from "./KYCController.js";

// GET /api/investment/plans/:id  — load single plan for the form page
export const fetchSinglePlan = async (req, res) => {
  try {
    const plan = await InvestmentPlan.findById(req.params.id);
    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/investment/invest  — user submits investment
export const createInvestment = async (req, res) => {
  try {
    const { planId, amount } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!planId || !amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid investment data" });
    }

    // Fetch plan
    const plan = await InvestmentPlan.findById(planId);
    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });

    // Validate amount range
    if (amount < plan.min_amount || amount > plan.max_amount) {
      return res.status(400).json({
        success: false,
        message: `Amount must be between $${plan.min_amount} and $${plan.max_amount}`,
      });
    }

    // Fetch user and check balance
    const user = await UserModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.account_balance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Your current balance is $${user.account_balance}`,
      });
    }

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

    // Deduct balance atomically
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId, account_balance: { $gte: amount } },
      { $inc: { account_balance: -amount } },
      { returnDocument: "after" },
    );
    // If this fails it means balance changed between check and update
    if (!updatedUser) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    // Create investment
    const return_amount = amount + (amount * plan.return_percentage) / 100;
    const expires_at = new Date(
      Date.now() + plan.duration_hours * 60 * 60 * 1000,
    );

    const investment = await Investmentmodel.create({
      user: userId,
      plan: planId,
      amount,
      return_amount,
      expires_at,
    });

    res.json({
      success: true,
      message: "Investment created successfully",
      data: investment,
      new_balance: updatedUser.account_balance, // ← fix here
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/investment/user  — fetch all investments for logged in user
export const fetchUserInvestments = async (req, res) => {
  try {
    const userId = req.user._id;

    const investments = await Investmentmodel.find({ user: userId })
      .populate("plan", "name return_percentage duration_hours")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: investments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/investment/stats  — user investment summary
export const getInvestmentStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const investments = await Investmentmodel.find({ user: userId });

    // Total ever invested (all statuses)
    const total_invested = investments.reduce(
      (sum, inv) => sum + inv.amount,
      0,
    );

    // Active: sum of amount currently running
    const active_amount = investments
      .filter((inv) => inv.status === "active")
      .reduce((sum, inv) => sum + inv.amount, 0);

    // Completed: profit = return_amount - amount
    const completed = investments.filter((inv) => inv.status === "completed");
    const total_profit = completed.reduce(
      (sum, inv) => sum + ((inv.return_amount ?? 0) - inv.amount),
      0,
    );

    return res.status(200).json({
      success: true,
      stats: {
        total_invested, // all investments ever made
        active_amount, // currently running
        total_profit, // profit from completed only
      },
    });
  } catch (err) {
    console.error("getInvestmentStats error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
