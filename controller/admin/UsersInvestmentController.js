import Investmentmodel from "../../model/Investmentmodel.js";
import UserModel from "../../model/UserModel.js";
import resend from "../../lib/resend.js";
import { investmentCancelledEmailTemplate } from "../../lib/email-templates/investment-cancel-email-template.js";
import { investmentCompletedEmailTemplate } from "../../lib/email-templates/investmentCompletedEmailTemplate.js";

// GET /api/investment/admin/all
export const adminGetAllInvestments = async (req, res) => {
  try {
    const data = await Investmentmodel.find()
      .populate("user", "name email")
      .populate("plan", "name return_percentage duration_hours")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/investment/admin/:id/complete
export const adminCompleteInvestment = async (req, res) => {
  try {
    const inv = await Investmentmodel.findById(req.params.id)
      .populate("user", "name email")
      .populate("plan", "name");

    if (!inv)
      return res.status(404).json({ success: false, message: "Investment not found" });
    if (inv.status !== "active")
      return res.status(400).json({ success: false, message: "Investment is not active" });

    await UserModel.findByIdAndUpdate(inv.user._id, {
      $inc: { account_balance: inv.return_amount },
    });

    inv.status = "completed";
    await inv.save();

    // ── Email: investment completed ──
    try {
      const { data, error } = await resend.emails.send({
        from: "Batrus Trades <info@batrus-trades.pro>",
        to: [inv.user.email],
        subject: "Your Investment Has Matured - Batrus Trades",
        html: investmentCompletedEmailTemplate({
          name: inv.user.name,
          amount: inv.amount,
          return_amount: inv.return_amount,
          plan: inv.plan?.name || "Investment Plan",
        }),
      });
      if (error) console.error("adminCompleteInvestment email error:", error);
    } catch (emailErr) {
      console.error("adminCompleteInvestment email exception:", emailErr.message);
    }

    return res.json({ success: true, message: "Investment completed and balance credited" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/investment/admin/:id/cancel
export const adminCancelInvestment = async (req, res) => {
  try {
    const inv = await Investmentmodel.findById(req.params.id)
      .populate("user", "name email")
      .populate("plan", "name");

    if (!inv)
      return res.status(404).json({ success: false, message: "Investment not found" });
    if (inv.status !== "active")
      return res.status(400).json({ success: false, message: "Investment is not active" });

    // Refund original amount
    await UserModel.findByIdAndUpdate(inv.user._id, {
      $inc: { account_balance: inv.amount },
    });

    inv.status = "cancelled";
    await inv.save();

    // ── Email: investment cancelled ──
    try {
      const { data, error } = await resend.emails.send({
        from: "Batrus Trades <info@batrus-trades.pro>",
        to: [inv.user.email],
        subject: "Investment Cancelled - Batrus Trades",
        html: investmentCancelledEmailTemplate({
          name: inv.user.name,
          amount: inv.amount,
          plan: inv.plan?.name || "Investment Plan",
        }),
      });
      if (error) console.error("adminCancelInvestment email error:", error);
    } catch (emailErr) {
      console.error("adminCancelInvestment email exception:", emailErr.message);
    }

    return res.json({ success: true, message: "Investment cancelled and amount refunded" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};