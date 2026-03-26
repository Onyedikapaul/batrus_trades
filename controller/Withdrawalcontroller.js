import WithdrawalModel from "../model/Withdrawalmodel.js";
import UserModel from "../model/UserModel.js";
import resend from "../lib/resend.js";
import {
  withdrawalCreatedEmailTemplate,
  withdrawalApprovedEmailTemplate,
  withdrawalRejectedEmailTemplate,
} from "../lib/email-templates/withdrawal-email-templates.js";

// ─── User: Submit withdrawal ──────────────────────────────────────────────────
export const createWithdrawal = async (req, res) => {
  try {
    const { amount, currency, walletAddress, walletTitle, description } =
      req.body;

    if (!amount || !walletAddress)
      return res.status(400).json({
        success: false,
        message: "Amount and wallet address required.",
      });

    if (!currency)
      return res.status(400).json({
        success: false,
        message: "Currency address required.",
      });

    if (amount < 5)
      return res
        .status(400)
        .json({ success: false, message: "Minimum withdrawal is $5." });

    const user = await UserModel.findById(req.user._id);

    if (amount > user.account_balance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Your balance is $${user.account_balance}`,
      });
    }

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    if (!user.isAllowedToWithdraw)
      return res.status(403).json({
        success: false,
        message: `Withdrawal are disabled on your account. Reason: ${user.blockedWithdrawalReason || "Please contact support."}`,
      });

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

    // deduct balance
    user.account_balance -= amount;
    await user.save();

    const withdrawal = await WithdrawalModel.create({
      user: req.user._id,
      amount,
      currency,
      walletAddress,
      walletTitle: walletTitle || null,
      description: description || null,
      status: "pending",
    });

    // ── Email: withdrawal received ──
    // try {
    //   await resend.emails.send({
    //     from: "Batrus Trades <info@batrus-trades.pro>",
    //     to: [user.email],
    //     subject: "Withdrawal Request Received - Batrus Trades",
    //     html: withdrawalCreatedEmailTemplate({
    //       name: user.name,
    //       amount,
    //       currency,
    //       walletAddress,
    //     }),
    //   });
    // } catch (emailErr) {
    //   console.error("Withdrawal created email error:", emailErr);
    // }

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted.",
      withdrawal,
    });
  } catch (error) {
    console.error("createWithdrawal error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── User: Get withdrawals ────────────────────────────────────────────────────
export const getMyWithdrawals = async (req, res) => {
  try {
    const withdrawals = await WithdrawalModel.find({ user: req.user._id }).sort(
      { createdAt: -1 },
    );
    return res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    console.error("getMyWithdrawals error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── User: Cancel withdrawal ──────────────────────────────────────────────────
export const cancelWithdrawal = async (req, res) => {
  try {
    const withdrawal = await WithdrawalModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!withdrawal)
      return res
        .status(404)
        .json({ success: false, message: "Withdrawal not found." });

    if (withdrawal.status !== "pending")
      return res.status(400).json({
        success: false,
        message: "Only pending withdrawals can be cancelled.",
      });

    // refund balance
    await UserModel.findByIdAndUpdate(req.user._id, {
      $inc: { account_balance: withdrawal.amount },
    });

    withdrawal.status = "cancelled";
    await withdrawal.save();

    return res.status(200).json({
      success: true,
      message: "Withdrawal cancelled and balance refunded.",
    });
  } catch (error) {
    console.error("cancelWithdrawal error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Admin: Get all withdrawals ───────────────────────────────────────────────
export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await WithdrawalModel.find()
      .populate("user", "name username email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    console.error("getAllWithdrawals error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
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

    if (withdrawal.status !== "pending")
      return res
        .status(400)
        .json({ success: false, message: "Withdrawal not pending." });

    withdrawal.status = "approved";
    withdrawal.actionedBy = req.user._id;
    withdrawal.actionedAt = new Date();
    await withdrawal.save();

    // ── Email: withdrawal approved ──
    try {
      await resend.emails.send({
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
    } catch (emailErr) {
      console.error("Withdrawal approved email error:", emailErr);
    }

    return res.status(200).json({
      success: true,
      message: "Withdrawal approved.",
    });
  } catch (error) {
    console.error("approveWithdrawal error:", error);
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

    if (withdrawal.status !== "pending")
      return res
        .status(400)
        .json({ success: false, message: "Withdrawal not pending." });

    // refund balance
    await UserModel.findByIdAndUpdate(withdrawal.user._id, {
      $inc: { account_balance: withdrawal.amount },
    });

    withdrawal.status = "rejected";
    withdrawal.rejectionReason = rejectionReason || null;
    withdrawal.actionedBy = req.user._id;
    withdrawal.actionedAt = new Date();
    await withdrawal.save();

    // ── Email: withdrawal rejected ──
    try {
      await resend.emails.send({
        from: "Batrus Trades <info@batrus-trades.pro>",
        to: [withdrawal.user.email],
        subject: "Withdrawal Update - Batrus Trades",
        html: withdrawalRejectedEmailTemplate({
          name: withdrawal.user.name,
          amount: withdrawal.amount,
          currency: withdrawal.currency,
          walletAddress: withdrawal.walletAddress,
          rejectionReason: rejectionReason || null,
        }),
      });
    } catch (emailErr) {
      console.error("Withdrawal rejected email error:", emailErr);
    }

    return res.status(200).json({
      success: true,
      message: "Withdrawal rejected and balance refunded.",
    });
  } catch (error) {
    console.error("rejectWithdrawal error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
