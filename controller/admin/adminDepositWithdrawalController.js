import Depositmodel from "../../model/Depositmodel.js";
import UserModel from "../../model/UserModel.js";
import WithdrawalModel from "../../model/Withdrawalmodel.js";
import { creditReferralEarning } from "../ReferralController.js";
import resend from "../../lib/resend.js";
import {
  depositConfirmedEmailTemplate,
  depositRejectedEmailTemplate,
} from "../../lib/email-templates/deposit-email-templates.js";
import {
  withdrawalApprovedEmailTemplate,
  withdrawalRejectedEmailTemplate,
} from "../../lib/email-templates/withdrawal-email-templates.js";

// POST /api/admin/users/:id/deposit
export const adminAddDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, status, rejectionReason, note, createdAt } =
      req.body;

    if (!amount || !paymentMethod)
      return res.status(400).json({
        success: false,
        message: "Amount and payment method are required",
      });

    if (status === "rejected" && !rejectionReason)
      return res
        .status(400)
        .json({ success: false, message: "Rejection reason is required" });

    const user = await UserModel.findById(id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const depositData = {
      user: id,
      amount,
      paymentMethod,
      status: status || "pending",
      rejectionReason: rejectionReason || null,
      note: note || null,
      actionedBy: req.user?._id || null,
      actionedAt: new Date(),
    };

    if (createdAt) depositData.createdAt = new Date(createdAt);

    const deposit = await Depositmodel.create(depositData);

    if (status === "confirmed") {
      await UserModel.findByIdAndUpdate(id, {
        $inc: { account_balance: amount },
      });

      // credit referral bonus if this user was referred
      await creditReferralEarning(id, amount);
    }

    return res.json({ success: true, message: "Deposit added", data: deposit });
  } catch (err) {
    console.error("adminAddDeposit error:", err.message, err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/users/:id/withdrawal
export const adminAddWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount,
      currency,
      walletAddress,
      walletTitle,
      status,
      rejectionReason,
      description,
      createdAt,
    } = req.body;

    if (!amount || !currency || !walletAddress)
      return res.status(400).json({
        success: false,
        message: "Amount, currency and wallet address are required",
      });

    if (status === "rejected" && !rejectionReason)
      return res
        .status(400)
        .json({ success: false, message: "Rejection reason is required" });

    const user = await UserModel.findById(id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (status === "approved") {
      if (user.account_balance < amount) {
        return res
          .status(400)
          .json({ success: false, message: "User has insufficient balance" });
      }
      await UserModel.findByIdAndUpdate(id, {
        $inc: { account_balance: -amount },
      });
    }

    const withdrawalData = {
      user: id,
      amount,
      currency,
      walletAddress,
      walletTitle: walletTitle || null,
      status: status || "pending",
      rejectionReason: rejectionReason || null,
      description: description || null,
      actionedBy: req.user?._id || null,
      actionedAt: new Date(),
    };

    if (createdAt) withdrawalData.createdAt = new Date(createdAt);

    const withdrawal = await WithdrawalModel.create(withdrawalData);

    return res.json({
      success: true,
      message: "Withdrawal added",
      data: withdrawal,
    });
  } catch (err) {
    console.error("adminAddWithdrawal error:", err.message, err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Get user deposits ─────────────────────────────────────────────────
export const getUserDeposits = async (req, res) => {
  try {
    const deposits = await Depositmodel.find({ user: req.params.id }).sort({
      createdAt: -1,
    });
    return res.json({ success: true, deposits });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Confirm deposit ───────────────────────────────────────────────────
export const confirmDeposit = async (req, res) => {
  try {
    const deposit = await Depositmodel.findById(req.params.id).populate("user");

    if (!deposit)
      return res
        .status(404)
        .json({ success: false, message: "Deposit not found." });

    if (deposit.status === "confirmed")
      return res
        .status(400)
        .json({ success: false, message: "Deposit is already confirmed." });

    const prevStatus = deposit.status;

    // rejected → confirmed: credit balance + referral (was never credited before)
    // pending  → confirmed: credit balance + referral
    if (prevStatus === "pending" || prevStatus === "rejected") {
      await UserModel.findByIdAndUpdate(deposit.user._id, {
        $inc: { account_balance: deposit.amount },
      });
      await creditReferralEarning(deposit.user._id, deposit.amount);
    }

    deposit.status = "confirmed";
    deposit.rejectionReason = null;
    deposit.actionedBy = null;
    deposit.actionedAt = new Date();
    await deposit.save();

    // ── Email: deposit confirmed ──
    try {
      const { data, error } = await resend.emails.send({
        from: "Batrus Trades <info@batrus-trades.pro>",
        to: [deposit.user.email],
        subject: "Deposit Confirmed - Batrus Trades",
        html: depositConfirmedEmailTemplate({
          name: deposit.user.name,
          amount: deposit.amount,
          paymentMethod: deposit.paymentMethod,
        }),
      });
      if (error) console.error("confirmDeposit email error:", error);
    } catch (emailErr) {
      console.error("confirmDeposit email exception:", emailErr.message);
    }

    return res.json({
      success: true,
      message: `Deposit confirmed. $${deposit.amount} credited to user.`,
    });
  } catch (err) {
    console.error("confirmDeposit error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Admin: Reject deposit ────────────────────────────────────────────────────
export const rejectDeposit = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const deposit = await Depositmodel.findById(req.params.id).populate("user");

    if (!deposit)
      return res
        .status(404)
        .json({ success: false, message: "Deposit not found." });

    if (deposit.status === "rejected")
      return res
        .status(400)
        .json({ success: false, message: "Deposit is already rejected." });

    if (!rejectionReason)
      return res
        .status(400)
        .json({ success: false, message: "Rejection reason is required." });

    const prevStatus = deposit.status;

    // confirmed → rejected: deduct the balance back
    if (prevStatus === "confirmed") {
      await UserModel.findByIdAndUpdate(deposit.user._id, {
        $inc: { account_balance: -deposit.amount },
      });
    }

    // pending → rejected: no balance change (was never credited)

    deposit.status = "rejected";
    deposit.rejectionReason = rejectionReason;
    deposit.actionedBy = null;
    deposit.actionedAt = new Date();
    await deposit.save();

    // ── Email: deposit rejected ──
    try {
      const { data, error } = await resend.emails.send({
        from: "Batrus Trades <info@batrus-trades.pro>",
        to: [deposit.user.email],
        subject: "Deposit Update - Batrus Trades",
        html: depositRejectedEmailTemplate({
          name: deposit.user.name,
          amount: deposit.amount,
          paymentMethod: deposit.paymentMethod,
          rejectionReason,
        }),
      });
      if (error) console.error("rejectDeposit email error:", error);
    } catch (emailErr) {
      console.error("rejectDeposit email exception:", emailErr.message);
    }

    return res.json({ success: true, message: "Deposit rejected." });
  } catch (err) {
    console.error("rejectDeposit error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Admin: Set deposit back to pending ───────────────────────────────────────
export const setPendingDeposit = async (req, res) => {
  try {
    const deposit = await Depositmodel.findById(req.params.id).populate("user");

    if (!deposit)
      return res
        .status(404)
        .json({ success: false, message: "Deposit not found." });

    if (deposit.status === "pending")
      return res
        .status(400)
        .json({ success: false, message: "Deposit is already pending." });

    const prevStatus = deposit.status;

    // confirmed → pending: deduct the balance back (reverse the confirmation)
    if (prevStatus === "confirmed") {
      await UserModel.findByIdAndUpdate(deposit.user._id, {
        $inc: { account_balance: -deposit.amount },
      });
    }

    // rejected → pending: no balance change (was never credited)

    deposit.status = "pending";
    deposit.rejectionReason = null;
    deposit.actionedBy = null;
    deposit.actionedAt = null;
    await deposit.save();

    return res.json({ success: true, message: "Deposit set back to pending." });
  } catch (err) {
    console.error("setPendingDeposit error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Admin: Get withdrawals ───────────────────────────────────────────────────
export const getUserWithdrawals = async (req, res) => {
  try {
    const withdrawals = await WithdrawalModel.find({
      user: req.params.id,
    }).sort({ createdAt: -1 });
    return res.json({ success: true, withdrawals });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Approve withdrawal ────────────────────────────────────────────────
export const approveWithdrawal = async (req, res) => {
  try {
    const withdrawal = await WithdrawalModel.findById(req.params.id).populate(
      "user",
    );

    if (!withdrawal)
      return res
        .status(404)
        .json({ success: false, message: "Withdrawal not found." });

    if (withdrawal.status === "approved")
      return res
        .status(400)
        .json({ success: false, message: "Withdrawal is already approved." });

    const prevStatus = withdrawal.status;

    // rejected → approved: deduct balance again (was refunded on rejection)
    if (prevStatus === "rejected") {
      await UserModel.findByIdAndUpdate(withdrawal.user._id, {
        $inc: { account_balance: -withdrawal.amount },
      });
    }

    withdrawal.status = "approved";
    withdrawal.actionedBy = null;
    withdrawal.actionedAt = new Date();
    withdrawal.rejectionReason = null;
    await withdrawal.save();

    // ── Email: withdrawal approved ──
    try {
      const { data, error } = await resend.emails.send({
        from: "Batrus Trades <info@batrus-trades.pro>",
        to: [withdrawal.user.email],
        subject: "Withdrawal Approved - Batrus Trades",
        html: withdrawalApprovedEmailTemplate({
          name: withdrawal.user.name,
          amount: withdrawal.amount,
          currency: withdrawal.currency,
          walletAddress: withdrawal.walletAddress,
        }),
      });
      if (error) console.error("approveWithdrawal email error:", error);
    } catch (emailErr) {
      console.error("approveWithdrawal email exception:", emailErr.message);
    }

    return res.json({ success: true, message: "Withdrawal approved." });
  } catch (err) {
    console.error("approveWithdrawal error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Admin: Reject withdrawal ─────────────────────────────────────────────────
export const rejectWithdrawal = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const withdrawal = await WithdrawalModel.findById(req.params.id).populate(
      "user",
    );

    if (!withdrawal)
      return res
        .status(404)
        .json({ success: false, message: "Withdrawal not found." });

    if (withdrawal.status === "rejected")
      return res
        .status(400)
        .json({ success: false, message: "Withdrawal is already rejected." });

    if (!rejectionReason)
      return res
        .status(400)
        .json({ success: false, message: "Rejection reason is required." });

    const prevStatus = withdrawal.status;

    // pending → rejected: refund (balance was deducted on withdrawal creation)
    // approved → rejected: refund (was already paid out, reverse it)
    if (prevStatus === "pending" || prevStatus === "approved") {
      await UserModel.findByIdAndUpdate(withdrawal.user._id, {
        $inc: { account_balance: withdrawal.amount },
      });
    }

    withdrawal.status = "rejected";
    withdrawal.rejectionReason = rejectionReason;
    withdrawal.actionedBy = null;
    withdrawal.actionedAt = new Date();
    await withdrawal.save();

    // ── Email: withdrawal rejected ──
    try {
      const { data, error } = await resend.emails.send({
        from: "Batrus Trades <info@batrus-trades.pro>",
        to: [withdrawal.user.email],
        subject: "Withdrawal Update - Batrus Trades",
        html: withdrawalRejectedEmailTemplate({
          name: withdrawal.user.name,
          amount: withdrawal.amount,
          currency: withdrawal.currency,
          walletAddress: withdrawal.walletAddress,
          rejectionReason,
        }),
      });
      if (error) console.error("rejectWithdrawal email error:", error);
    } catch (emailErr) {
      console.error("rejectWithdrawal email exception:", emailErr.message);
    }

    return res.json({
      success: true,
      message: "Withdrawal rejected and balance refunded.",
    });
  } catch (err) {
    console.error("rejectWithdrawal error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Admin: Set withdrawal back to pending ────────────────────────────────────
export const setPendingWithdrawal = async (req, res) => {
  try {
    const withdrawal = await WithdrawalModel.findById(req.params.id);

    if (!withdrawal)
      return res
        .status(404)
        .json({ success: false, message: "Withdrawal not found." });

    if (withdrawal.status === "pending")
      return res
        .status(400)
        .json({ success: false, message: "Withdrawal is already pending." });

    const prevStatus = withdrawal.status;

    // approved → pending: refund the balance (reverse the approval)
    if (prevStatus === "approved") {
      await UserModel.findByIdAndUpdate(withdrawal.user, {
        $inc: { account_balance: withdrawal.amount },
      });
    }

    // rejected → pending: no balance change (balance was already refunded on rejection)

    withdrawal.status = "pending";
    withdrawal.rejectionReason = null;
    withdrawal.actionedBy = null;
    withdrawal.actionedAt = null;
    await withdrawal.save();

    return res.json({
      success: true,
      message: "Withdrawal set back to pending.",
    });
  } catch (err) {
    console.error("setPendingWithdrawal error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
