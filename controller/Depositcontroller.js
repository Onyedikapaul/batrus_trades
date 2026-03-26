import Depositmodel from "../model/Depositmodel.js";
import UserModel from "../model/UserModel.js";
import { creditReferralEarning } from "./ReferralController.js";
import resend from "../lib/resend.js";
import {
  depositCreatedEmailTemplate,
  depositConfirmedEmailTemplate,
  depositRejectedEmailTemplate,
} from "../lib/email-templates/deposit-email-templates.js";

// ─── User: Submit a deposit request ──────────────────────────────────────────
export const createDeposit = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Amount and payment method are required.",
      });
    }
    if (amount < 5) {
      return res
        .status(400)
        .json({ success: false, message: "Minimum deposit is $5." });
    }

    const user = await UserModel.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    if (!user.isAllowedToDeposit)
      return res.status(403).json({
        success: false,
        message: `Deposits are disabled on your account. Reason: ${user.blockedDepositReason || "Please contact support."}`,
      });

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

    const deposit = await Depositmodel.create({
      user: req.user._id,
      amount,
      paymentMethod,
      status: "pending",
    });

    // ── Email: deposit received ──
    // ── Email: deposit received ──
    try {
      await resend.emails.send({
        from: "Batrus Trades <info@digitexwaves.com>",
        to: [user.email],
        subject: "Deposit Request Received - Batrus Trades",
        html: depositCreatedEmailTemplate({
          name: user.name,
          amount,
          paymentMethod,
        }),
      });
    } catch (emailErr) {
      console.error("Deposit email error:", emailErr);
    }

    return res.status(201).json({
      success: true,
      message: "Deposit request submitted. Awaiting admin confirmation.",
      deposit,
    });
  } catch (error) {
    console.error("createDeposit error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── User: Get own deposit history ───────────────────────────────────────────
export const getMyDeposits = async (req, res) => {
  try {
    const deposits = await Depositmodel.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, deposits });
  } catch (error) {
    console.error("getMyDeposits error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Admin: Get all deposits ──────────────────────────────────────────────────
export const getAllDeposits = async (req, res) => {
  try {
    const deposits = await Depositmodel.find()
      .populate("user", "name username email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, deposits });
  } catch (error) {
    console.error("getAllDeposits error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Admin: Confirm a deposit → credit User Account Balance ──────────────────
export const confirmDeposit = async (req, res) => {
  try {
    const deposit = await Depositmodel.findById(req.params.id).populate("user");

    if (!deposit) {
      return res
        .status(404)
        .json({ success: false, message: "Deposit not found." });
    }

    if (deposit.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Deposit is not pending." });
    }

    // credit user account balance
    await UserModel.findByIdAndUpdate(deposit.user._id, {
      $inc: { account_balance: deposit.amount },
    });

    // referral bonus
    await creditReferralEarning(deposit.user._id, deposit.amount);

    // update deposit
    deposit.status = "confirmed";
    deposit.actionedBy = req.user._id;
    deposit.actionedAt = new Date();
    await deposit.save();

    // ── Email: deposit confirmed ──
    await resend.emails.send({
      from: "Batrus Trades <info@digitexwaves.com>",
      to: [deposit.user.email],
      subject: "Deposit Confirmed - Batrus Trades",
      html: depositConfirmedEmailTemplate({
        name: deposit.user.name,
        amount: deposit.amount,
        paymentMethod: deposit.paymentMethod,
      }),
    });

    return res.status(200).json({
      success: true,
      message: `Deposit confirmed. $${deposit.amount} credited to user account.`,
    });
  } catch (error) {
    console.error("confirmDeposit error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Admin: Reject a deposit ──────────────────────────────────────────────────
export const rejectDeposit = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const deposit = await Depositmodel.findById(req.params.id).populate("user");

    if (!deposit)
      return res
        .status(404)
        .json({ success: false, message: "Deposit not found." });

    if (deposit.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Deposit is not pending." });
    }

    deposit.status = "rejected";
    deposit.rejectionReason = rejectionReason || null;
    deposit.actionedBy = req.user._id;
    deposit.actionedAt = new Date();
    await deposit.save();

    // ── Email: deposit rejected ──
    await resend.emails.send({
      from: "Batrus Trades <info@digitexwaves.com>",
      to: [deposit.user.email],
      subject: "Deposit Update - Batrus Trades",
      html: depositRejectedEmailTemplate({
        name: deposit.user.name,
        amount: deposit.amount,
        paymentMethod: deposit.paymentMethod,
        rejectionReason: rejectionReason || null,
      }),
    });

    return res
      .status(200)
      .json({ success: true, message: "Deposit rejected." });
  } catch (error) {
    console.error("rejectDeposit error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── User: Cancel a pending deposit ──────────────────────────────────────────
export const cancelDeposit = async (req, res) => {
  try {
    const deposit = await Depositmodel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deposit)
      return res
        .status(404)
        .json({ success: false, message: "Deposit not found." });

    if (deposit.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending deposits can be cancelled.",
      });
    }

    deposit.status = "cancelled";
    await deposit.save();

    return res
      .status(200)
      .json({ success: true, message: "Deposit cancelled." });
  } catch (error) {
    console.error("cancelDeposit error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
